"""
search.py — Real-time search tool implementations.

Primary backend: Tavily (structured web research).
Fallback: duckduckgo-search (no API key required).

Each function:
  1. Constructs a targeted search query from the tool input
  2. Calls the search backend
  3. Parses and structures the results
  4. Returns a JSON-serialisable dict

execute_tool(name, input_dict) is the single dispatch entry point
called by the advisor's tool loop.
"""

from __future__ import annotations

import json
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Search backend helpers
# ---------------------------------------------------------------------------

def _tavily_search(query: str, max_results: int = 5) -> list[dict]:
    """Calls Tavily API and returns a list of result dicts."""
    try:
        from tavily import TavilyClient
        api_key = os.environ.get("TAVILY_API_KEY", "")
        if not api_key:
            logger.warning("TAVILY_API_KEY not set — falling back to duckduckgo")
            return _ddg_search(query, max_results)
        client = TavilyClient(api_key=api_key)
        response = client.search(
            query=query,
            search_depth="advanced",
            max_results=max_results,
            include_answer=True,
        )
        results = response.get("results", [])
        return [
            {"title": r.get("title", ""), "content": r.get("content", ""), "url": r.get("url", "")}
            for r in results
        ]
    except Exception as e:
        logger.warning(f"Tavily search failed: {e} — falling back to duckduckgo")
        return _ddg_search(query, max_results)


def _ddg_search(query: str, max_results: int = 5) -> list[dict]:
    """Fallback search using duckduckgo-search (no API key needed)."""
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))
        return [
            {"title": r.get("title", ""), "content": r.get("body", ""), "url": r.get("href", "")}
            for r in results
        ]
    except Exception as e:
        logger.error(f"DuckDuckGo search also failed: {e}")
        return []


def _results_to_text(results: list[dict], max_chars: int = 3000) -> str:
    """Converts raw search results into a compact text block for the advisor."""
    if not results:
        return "No results found."
    lines = []
    total = 0
    for r in results:
        snippet = f"[{r['title']}]\n{r['content'][:400]}"
        if r.get("url"):
            snippet += f"\nSource: {r['url']}"
        snippet += "\n"
        if total + len(snippet) > max_chars:
            break
        lines.append(snippet)
        total += len(snippet)
    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Tool implementations
# ---------------------------------------------------------------------------

def search_universities(
    field_of_study: str,
    degree_level: str,
    target_countries: list[str] | None = None,
    max_annual_tuition_usd: int = 0,
    student_country_of_origin: str = "unknown",
    scholarship_required: bool = False,
    ranking_preference: str = "any",
) -> dict[str, Any]:
    """
    Real-time search for universities matching the student's profile.
    Constructs a targeted query and returns structured results.
    """
    countries_str = (
        f"in {', '.join(target_countries)}" if target_countries else "worldwide"
    )
    budget_str = (
        f"under ${max_annual_tuition_usd:,} tuition"
        if max_annual_tuition_usd > 0
        else ""
    )
    scholarship_str = "with scholarships for international students" if scholarship_required else ""
    ranking_str = {
        "top_20": "ranked top 20 globally",
        "top_100": "ranked top 100 globally",
        "top_200": "ranked top 200 globally",
        "any": "",
    }.get(ranking_preference, "")

    query_parts = [
        f"best universities for {degree_level} {field_of_study}",
        countries_str,
        ranking_str,
        budget_str,
        scholarship_str,
        f"for students from {student_country_of_origin}" if student_country_of_origin != "unknown" else "",
        "tuition fees admission requirements 2024 2025",
    ]
    query = " ".join(p for p in query_parts if p).strip()

    raw = _tavily_search(query, max_results=6)
    results_text = _results_to_text(raw)

    return {
        "query_used": query,
        "search_results": results_text,
        "note": (
            "Synthesise these results into 3-5 specific university recommendations "
            "with reach/target/safety tiers. For each, explain why it fits this "
            "student specifically. Include estimated costs and scholarship opportunities."
        ),
        "search_params": {
            "field": field_of_study,
            "level": degree_level,
            "countries": target_countries,
            "max_tuition_usd": max_annual_tuition_usd,
            "scholarship_required": scholarship_required,
        },
    }


def search_career_paths(
    interest_area: str,
    education_level: str = "bachelors",
    target_country: str = "global",
    strengths: list[str] | None = None,
) -> dict[str, Any]:
    """
    Real-time search for career paths in the student's area of interest.
    Returns job titles, salaries, outlook, and day-in-the-life context.
    """
    strengths_str = f"suited for someone with {', '.join(strengths)}" if strengths else ""
    query = (
        f"career paths jobs in {interest_area} with {education_level} degree "
        f"salary range job outlook {target_country} {strengths_str} "
        f"day in the life what does a {interest_area} professional do 2024"
    )

    raw = _tavily_search(query, max_results=5)
    results_text = _results_to_text(raw)

    return {
        "query_used": query,
        "search_results": results_text,
        "note": (
            "From these results, identify 2-3 specific career paths with: "
            "concrete job titles, realistic salary ranges, market outlook, "
            "a vivid day-in-the-life description, and adjacent fields. "
            "Connect each path to the student's interests and strengths."
        ),
        "search_params": {
            "interest": interest_area,
            "education": education_level,
            "country": target_country,
        },
    }


def search_scholarships(
    student_country_of_origin: str,
    target_country_of_study: str,
    degree_level: str = "undergraduate",
    field_of_study: str = "",
    academic_strength: str = "strong",
) -> dict[str, Any]:
    """
    Real-time search for scholarships matching the student's profile.
    Returns named scholarships with amounts, eligibility, and tips.
    """
    field_str = f"for {field_of_study}" if field_of_study else ""
    query = (
        f"scholarships for students from {student_country_of_origin} "
        f"studying {degree_level} {field_str} in {target_country_of_study} "
        f"fully funded partial funding international students eligibility 2024 2025 "
        f"how to apply deadline"
    )

    raw = _tavily_search(query, max_results=6)
    results_text = _results_to_text(raw)

    return {
        "query_used": query,
        "search_results": results_text,
        "note": (
            "Extract 3-5 specific named scholarships. For each include: "
            "scholarship name, funder, approximate value (full tuition / partial / stipend), "
            "eligibility criteria, typical deadline window, and one practical application tip. "
            "Prioritise scholarships that actually fund students from this student's country."
        ),
        "search_params": {
            "from": student_country_of_origin,
            "to": target_country_of_study,
            "level": degree_level,
            "field": field_of_study,
        },
    }


def get_admission_requirements(
    university_name: str,
    student_country_of_origin: str,
    course_name: str = "",
    degree_level: str = "undergraduate",
) -> dict[str, Any]:
    """
    Real-time search for admission requirements at a specific university.
    Returns grade requirements, English tests, deadlines, and country-specific info.
    """
    course_str = f"{course_name} " if course_name else ""
    query = (
        f"{university_name} {course_str}{degree_level} admission requirements "
        f"for international students from {student_country_of_origin} "
        f"minimum GPA grades IELTS TOEFL application deadline 2024 2025"
    )

    raw = _tavily_search(query, max_results=5)
    results_text = _results_to_text(raw)

    return {
        "query_used": query,
        "search_results": results_text,
        "note": (
            "Extract the key admission requirements: minimum academic grades "
            "(in terms meaningful to a student from the given country), "
            "English language requirements (IELTS/TOEFL minimums), "
            "application deadlines, any country-specific requirements, "
            "and whether this student's profile is likely to be competitive."
        ),
        "search_params": {
            "university": university_name,
            "course": course_name,
            "level": degree_level,
            "applicant_from": student_country_of_origin,
        },
    }


# ---------------------------------------------------------------------------
# Dispatch entry point
# ---------------------------------------------------------------------------

_TOOL_REGISTRY = {
    "search_universities": search_universities,
    "search_career_paths": search_career_paths,
    "search_scholarships": search_scholarships,
    "get_admission_requirements": get_admission_requirements,
}


async def execute_tool(tool_name: str, tool_input: dict[str, Any]) -> str:
    """
    Dispatch a tool call by name and return the result as a JSON string.
    Called by the advisor's tool-use loop.
    """
    if tool_name not in _TOOL_REGISTRY:
        return json.dumps({"error": f"Unknown tool: {tool_name}"})
    try:
        func = _TOOL_REGISTRY[tool_name]
        result = func(**tool_input)
        return json.dumps(result, ensure_ascii=False)
    except TypeError as e:
        logger.error(f"Tool {tool_name} called with bad params {tool_input}: {e}")
        return json.dumps({"error": f"Invalid parameters for {tool_name}: {e}"})
    except Exception as e:
        logger.exception(f"Tool {tool_name} raised unexpected error: {e}")
        return json.dumps({"error": str(e), "tool": tool_name})
