"""
session_store.py — File-based session and student profile persistence.

Storage layout:
  data/
    sessions/<session_id>.json   — full ConversationSession (history + profile)
    students/<student_id>.json   — merged StudentProfile across sessions

This file-based approach is intentionally simple and portable so the advisor
logic can run standalone, in tests, and be plugged into Emergent Agent without
any database dependency. Swap the backend by subclassing SessionStore and
overriding load/save.
"""

from __future__ import annotations

import json
import logging
import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from models import ConversationSession, ConversationStage, StudentProfile

logger = logging.getLogger(__name__)


class SessionStore:
    """
    File-backed session store.

    Usage:
        store = SessionStore(data_dir="./data")
        session = store.create_session()
        store.save(session)
        session = store.load(session.session_id)
    """

    def __init__(self, data_dir: str = "./data") -> None:
        self._sessions_dir = Path(data_dir) / "sessions"
        self._students_dir = Path(data_dir) / "students"
        self._sessions_dir.mkdir(parents=True, exist_ok=True)
        self._students_dir.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # Session CRUD
    # ------------------------------------------------------------------

    def create_session(
        self,
        session_id: Optional[str] = None,
        initial_metadata: Optional[dict] = None,
    ) -> ConversationSession:
        """
        Creates and saves a fresh ConversationSession.
        Returns the new session object.
        """
        sid = session_id or str(uuid.uuid4())
        country_hint = (initial_metadata or {}).get("country_hint", "unknown")

        profile = StudentProfile(
            session_id=sid,
            country_of_origin=country_hint,
        )

        session = ConversationSession(
            session_id=sid,
            student_profile=profile,
            stage=ConversationStage.GREETING,
        )

        self.save(session)
        logger.info(f"Created session {sid}")
        return session

    def load(self, session_id: str) -> Optional[ConversationSession]:
        """Returns a ConversationSession or None if not found."""
        path = self._sessions_dir / f"{session_id}.json"
        if not path.exists():
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return ConversationSession.model_validate(data)
        except Exception as e:
            logger.error(f"Failed to load session {session_id}: {e}")
            return None

    def save(self, session: ConversationSession) -> None:
        """Persists a ConversationSession to disk."""
        session.last_active = datetime.utcnow()
        path = self._sessions_dir / f"{session.session_id}.json"
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(session.model_dump_json(indent=2))
        except Exception as e:
            logger.error(f"Failed to save session {session.session_id}: {e}")

    def exists(self, session_id: str) -> bool:
        return (self._sessions_dir / f"{session_id}.json").exists()

    def delete(self, session_id: str) -> None:
        path = self._sessions_dir / f"{session_id}.json"
        if path.exists():
            path.unlink()
            logger.info(f"Deleted session {session_id}")

    # ------------------------------------------------------------------
    # Student profile persistence (cross-session)
    # ------------------------------------------------------------------

    def save_student_profile(self, student_id: str, profile: StudentProfile) -> None:
        """Persists a StudentProfile keyed by a stable student/user ID."""
        path = self._students_dir / f"{student_id}.json"
        try:
            with open(path, "w", encoding="utf-8") as f:
                f.write(profile.model_dump_json(indent=2))
        except Exception as e:
            logger.error(f"Failed to save student profile {student_id}: {e}")

    def load_student_profile(self, student_id: str) -> Optional[StudentProfile]:
        """Returns the persisted StudentProfile for a user, or None."""
        path = self._students_dir / f"{student_id}.json"
        if not path.exists():
            return None
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return StudentProfile.model_validate(data)
        except Exception as e:
            logger.error(f"Failed to load student profile {student_id}: {e}")
            return None

    # ------------------------------------------------------------------
    # History management
    # ------------------------------------------------------------------

    def trim_history(
        self,
        session: ConversationSession,
        max_turns: int = 60,
    ) -> None:
        """
        Trims conversation history to avoid context overflow.
        Strategy: keep the first 4 messages (establish initial context)
        plus the last N messages (recent context).
        Mutates session.history in place.
        """
        max_messages = max_turns * 2  # user + assistant per turn
        if len(session.history) > max_messages:
            keep_tail = max_messages - 4
            session.history = session.history[:4] + session.history[-keep_tail:]
            logger.debug(
                f"Trimmed history for {session.session_id}: {len(session.history)} messages remain"
            )
