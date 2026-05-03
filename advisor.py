"""
advisor.py — Core advisor orchestration.

AdvisorOrchestrator is the single entry point for all conversation turns.
It owns the full agentic loop:
  1. Load session state
  2. Assemble API payload (system + history + new message)
  3. Call Claude — handle tool_use blocks in a loop until end_turn
  4. Update session stage via rule-based state machine
  5. Trigger background profile extraction every N turns
  6. Save session state
  7. Return response text

Emergent Agent integration:
    from advisor import AdvisorOrchestrator
    from session_store import SessionStore
    from config import get_config

    store = SessionStore(config.data_dir)
    advisor = AdvisorOrchestrator(config, store)

    # New session:
    greeting, session = advisor.start_session(metadata={"country_hint": "India"})

    # Each turn:
    response, session = advisor.chat(session_id, user_message)
"""

from __future__ import annotations

import asyncio
import json
import logging
import threading
from datetime import datetime
from typing import Optional

import anthropic

from config import Config, get_config
from models import (
    CareerPath, ConversationSession, ConversationStage,
    CourseRecommendation, Message, StudentProfile, UniversityRecommendation,
)
from session_store import SessionStore
from system_prompt import (
    PROFILE_EXTRACTION_SYSTEM,
    build_system_payload,
    get_greeting_payload,
)
from tools import ADVISOR_TOOLS, execute_tool
from tools.profile import compute_completeness, merge_extracted_profile

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Stage transition rules
# ---------------------------------------------------------------------------

def _should_advance(session: ConversationSession) -> Optional[ConversationStage]:
    """
    Returns the next stage if transition conditions are met, else None.
    Called after every turn. Only ever advances one stage at a time.
    """
    stage = session.stage
    turn = session.turn_count
    profile = session.student_profile

    if stage == ConversationStage.GREETING and turn >= 1:
        return ConversationStage.RAPPORT

    if stage == ConversationStage.RAPPORT and turn >= 3:
        return ConversationStage.ASSESSMENT

    if stage == ConversationStage.ASSESSMENT:
        has_country = profile.country_of_origin != "unknown"
        has_level = profile.academic_background.current_level is not None
        if has_country and has_level:
            return ConversationStage.EXPLORATION

    if stage == ConversationStage.EXPLORATION:
        has_interest = len(profile.career_interests) >= 1
        sufficient_profile = profile.completeness_score >= 0.40
        if has_interest and sufficient_profile:
            return ConversationStage.CAREER_MAPPING

    if stage == ConversationStage.CAREER_MAPPING:
        has_career_data = len(session.career_paths) >= 1
        sufficient_profile = profile.completeness_score >= 0.55
        if has_career_data or sufficient_profile:
            return ConversationStage.RECOMMENDATION

    if stage == ConversationStage.RECOMMENDATION:
        if len(session.recommendations) >= 2:
            return ConversationStage.DECISION_SUPPORT

    return None


# ---------------------------------------------------------------------------
# Core orchestrator
# ---------------------------------------------------------------------------

class AdvisorOrchestrator:
    """
    The brain of the advisor platform.

    Sync-first design: chat() and start_session() are synchronous so they
    can be called from any context (Emergent Agent, scripts, tests, FastAPI).
    Profile extraction runs in a background thread so it never blocks the
    response to the student.
    """

    def __init__(
        self,
        config: Optional[Config] = None,
        store: Optional[SessionStore] = None,
    ) -> None:
        self.config = config or get_config()
        self.store = store or SessionStore(self.config.data_dir)
        self._client = anthropic.Anthropic(api_key=self.config.api_key)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def start_session(
        self,
        session_id: Optional[str] = None,
        metadata: Optional[dict] = None,
    ) -> tuple[str, ConversationSession]:
        """
        Creates a new session and generates the opening greeting.

        Returns (greeting_text, session).
        """
        session = self.store.create_session(
            session_id=session_id,
            initial_metadata=metadata,
        )

        greeting = self._generate_greeting(metadata)

        session.history.append(
            Message(role="assistant", content=greeting, turn_number=0)
        )
        session.turn_count = 1
        self.store.save(session)

        logger.info(f"Started session {session.session_id}")
        return greeting, session

    def chat(
        self,
        session_id: str,
        user_message: str,
    ) -> tuple[str, ConversationSession]:
        """
        Processes one user message and returns (response_text, updated_session).

        This is the main entry point for every conversation turn.
        Safe to call from synchronous code.
        """
        session = self.store.load(session_id)
        if not session:
            raise ValueError(f"Session not found: {session_id}")

        # Append user message
        session.history.append(
            Message(
                role="user",
                content=user_message,
                turn_number=session.turn_count,
            )
        )

        # Run the agentic tool loop — may call tools multiple times
        response_text, tools_used = self._run_agentic_loop(session, user_message)

        # Append assistant response
        session.history.append(
            Message(
                role="assistant",
                content=response_text,
                turn_number=session.turn_count,
            )
        )
        session.turn_count += 1
        session.last_active = datetime.utcnow()

        # Trim history to prevent context overflow
        self.store.trim_history(session, max_turns=self.config.max_conversation_turns)

        # Advance stage if conditions are met
        next_stage = _should_advance(session)
        if next_stage:
            logger.info(
                f"[{session_id}] Stage: {session.stage.value} → {next_stage.value}"
            )
            session.previous_stage = session.stage
            session.stage = next_stage

        # Recompute completeness score
        session.student_profile.completeness_score = compute_completeness(
            session.student_profile
        )

        self.store.save(session)

        # Profile extraction runs in a background thread every N turns
        if session.turn_count % self.config.profile_extraction_every_n_turns == 0:
            self._extract_profile_background(session_id)

        return response_text, session

    # ------------------------------------------------------------------
    # Private: Agentic tool loop
    # ------------------------------------------------------------------

    def _run_agentic_loop(
        self,
        session: ConversationSession,
        user_message: str,
    ) -> tuple[str, list[str]]:
        """
        Runs the Claude API call + tool use loop until stop_reason == "end_turn"
        or we hit the max_tool_iterations limit.

        Returns (response_text, list_of_tool_names_called).
        """
        system_blocks, messages = build_system_payload(session, user_message)
        tools_used: list[str] = []

        for iteration in range(self.config.max_tool_iterations):
            api_kwargs: dict = {
                "model": self.config.model,
                "max_tokens": self.config.max_tokens,
                "system": system_blocks,
                "messages": messages,
                "tools": ADVISOR_TOOLS,
            }

            # Caching requires betas header in some SDK versions;
            # handled transparently when cache_control is set on system blocks.
            response = self._client.messages.create(**api_kwargs)

            if response.stop_reason == "end_turn":
                text = self._extract_text(response)
                return text, tools_used

            if response.stop_reason == "tool_use":
                tool_calls = [b for b in response.content if b.type == "tool_use"]

                # Record assistant message (which includes tool_use blocks)
                messages.append({"role": "assistant", "content": response.content})

                # Execute all requested tools (synchronously — search.py funcs are sync)
                tool_results = []
                for tc in tool_calls:
                    tools_used.append(tc.name)
                    logger.info(f"[{session.session_id}] Tool call: {tc.name}")
                    result = asyncio.run(execute_tool(tc.name, tc.input))
                    tool_results.append((tc.id, result))

                # Record tool calls in session for audit trail
                session.tool_calls_made.append({
                    "turn": session.turn_count,
                    "iteration": iteration,
                    "tools": [{"name": tc.name, "input": tc.input} for tc in tool_calls],
                })

                # Feed tool results back into the message list
                messages.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": tool_id,
                            "content": result_json,
                        }
                        for tool_id, result_json in tool_results
                    ],
                })
                # Loop — Claude will now synthesise the tool results

            else:
                # Unexpected stop reason
                logger.warning(
                    f"[{session.session_id}] Unexpected stop_reason: {response.stop_reason}"
                )
                text = self._extract_text(response)
                return text or _FALLBACK_RESPONSE, tools_used

        # Exceeded max iterations
        logger.error(
            f"[{session.session_id}] Tool loop hit max iterations "
            f"({self.config.max_tool_iterations})"
        )
        return _FALLBACK_RESPONSE, tools_used

    # ------------------------------------------------------------------
    # Private: Greeting generation
    # ------------------------------------------------------------------

    def _generate_greeting(self, metadata: Optional[dict]) -> str:
        """Calls Claude to generate a warm, personalised opening greeting."""
        system_blocks, messages = get_greeting_payload(metadata)
        try:
            response = self._client.messages.create(
                model=self.config.model,
                max_tokens=300,
                system=system_blocks,
                messages=messages,
            )
            return self._extract_text(response)
        except Exception as e:
            logger.error(f"Greeting generation failed: {e}")
            return (
                "Hi! Really glad you're here. "
                "What's on your mind — are you figuring out what to study, "
                "where to apply, or something else entirely?"
            )

    # ------------------------------------------------------------------
    # Private: Profile extraction (background thread)
    # ------------------------------------------------------------------

    def _extract_profile_background(self, session_id: str) -> None:
        """
        Spawns a background thread to extract structured profile data from
        the recent conversation. Runs after the response is returned to the
        student so it never adds latency.
        """
        thread = threading.Thread(
            target=self._extract_profile_sync,
            args=(session_id,),
            daemon=True,
        )
        thread.start()

    def _extract_profile_sync(self, session_id: str) -> None:
        """
        Runs a secondary Claude call to extract structured profile fields
        from the last 10 messages, then merges into the session profile.
        """
        session = self.store.load(session_id)
        if not session or len(session.history) < 4:
            return

        # Use the last 12 messages for extraction
        recent = session.history[-12:]
        conversation_text = "\n".join(
            f"{m.role.upper()}: {m.content}" for m in recent
        )

        try:
            response = self._client.messages.create(
                model=self.config.model,
                max_tokens=1024,
                system=PROFILE_EXTRACTION_SYSTEM,
                messages=[
                    {
                        "role": "user",
                        "content": (
                            "Extract student profile data from this advisor conversation:\n\n"
                            f"{conversation_text}"
                        ),
                    }
                ],
            )
            raw = self._extract_text(response).strip()

            # Strip markdown code fences if present
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]

            extracted = json.loads(raw)
            merge_extracted_profile(session.student_profile, extracted)
            session.student_profile.last_updated = datetime.utcnow()
            session.student_profile.completeness_score = compute_completeness(
                session.student_profile
            )

            if extracted.get("advisor_notes"):
                session.advisor_notes = extracted["advisor_notes"]

            self.store.save(session)
            logger.info(
                f"[{session_id}] Profile extraction complete. "
                f"Completeness: {session.student_profile.completeness_score:.2f}"
            )

        except json.JSONDecodeError as e:
            logger.warning(f"[{session_id}] Profile extraction: JSON parse error: {e}")
        except Exception as e:
            logger.warning(f"[{session_id}] Profile extraction failed: {e}")

    # ------------------------------------------------------------------
    # Private: Utilities
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_text(response: anthropic.types.Message) -> str:
        """Extracts all text blocks from a Claude response into a single string."""
        parts = [block.text for block in response.content if hasattr(block, "text")]
        return "\n".join(parts)


_FALLBACK_RESPONSE = (
    "I ran into a small issue gathering some information. "
    "Could you tell me a bit more about what's most important to you? "
    "I want to make sure I give you something genuinely useful."
)
