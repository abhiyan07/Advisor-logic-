"""
profile.py — Student profile extraction helper utilities.

These are lightweight helpers called by the advisor orchestrator to:
  - Merge extracted profile data into a live StudentProfile
  - Compute profile completeness score
  - Record university recommendations made during the session
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from models import StudentProfile, UniversityRecommendation

logger = logging.getLogger(__name__)


def merge_extracted_profile(
    profile: "StudentProfile",
    extracted: dict[str, Any],
) -> None:
    """
    Merges JSON data (from the profile extraction LLM call) into the live
    StudentProfile. Respects existing data — never overwrites confident
    existing values with new inferences.
    """
    from models import (
        AcademicStrength, CareerInterest, EducationLevel,
        FinancialTier, PsychologicalBarrier,
    )

    # Identity fields — only fill if currently empty
    if extracted.get("first_name") and not profile.first_name:
        profile.first_name = extracted["first_name"]

    if extracted.get("age") and not profile.age:
        try:
            profile.age = int(extracted["age"])
        except (ValueError, TypeError):
            pass

    if extracted.get("country_of_origin") and profile.country_of_origin == "unknown":
        profile.country_of_origin = extracted["country_of_origin"]

    # Merge study country preferences (union, no duplicates)
    if extracted.get("country_of_study_preference"):
        existing = set(profile.country_of_study_preference)
        for c in extracted["country_of_study_preference"]:
            if c and c not in existing:
                profile.country_of_study_preference.append(c)
                existing.add(c)

    # Academic background
    if extracted.get("academic_level") and not profile.academic_background.current_level:
        try:
            profile.academic_background.current_level = EducationLevel(
                extracted["academic_level"]
            )
        except ValueError:
            pass

    if extracted.get("academic_strength") and not profile.academic_background.academic_strength:
        try:
            profile.academic_background.academic_strength = AcademicStrength(
                extracted["academic_strength"]
            )
        except ValueError:
            pass

    if extracted.get("gpa_or_percentage") and not profile.academic_background.gpa_or_percentage:
        profile.academic_background.gpa_or_percentage = extracted["gpa_or_percentage"]

    if extracted.get("strongest_subjects"):
        existing = set(profile.academic_background.strongest_subjects)
        for s in extracted["strongest_subjects"]:
            if s and s not in existing:
                profile.academic_background.strongest_subjects.append(s)
                existing.add(s)

    if extracted.get("standardized_tests"):
        for test, score in extracted["standardized_tests"].items():
            if test and test not in profile.academic_background.standardized_tests:
                profile.academic_background.standardized_tests[test] = score

    # Career interests — merge by field name, don't duplicate
    if extracted.get("career_interests"):
        existing_fields = {ci.field.lower() for ci in profile.career_interests}
        for ci_data in extracted["career_interests"]:
            field = ci_data.get("field", "")
            if field and field.lower() not in existing_fields:
                try:
                    profile.career_interests.append(
                        CareerInterest(
                            field=field,
                            confidence=float(ci_data.get("confidence", 0.5)),
                            source=ci_data.get("source", "inferred"),
                        )
                    )
                    existing_fields.add(field.lower())
                except Exception:
                    pass

    if extracted.get("dream_career") and not profile.dream_career:
        profile.dream_career = extracted["dream_career"]

    # Values — merge, no duplicates
    if extracted.get("values"):
        existing = set(profile.values)
        for v in extracted["values"]:
            if v and v not in existing:
                profile.values.append(v)
                existing.add(v)

    # Financial profile
    if extracted.get("financial_tier") and not profile.financial_profile.tier:
        try:
            profile.financial_profile.tier = FinancialTier(extracted["financial_tier"])
        except ValueError:
            pass

    if extracted.get("annual_budget_usd") and not profile.financial_profile.annual_budget_usd:
        try:
            profile.financial_profile.annual_budget_usd = int(extracted["annual_budget_usd"])
        except (ValueError, TypeError):
            pass

    if extracted.get("scholarship_required") is not None and \
       profile.financial_profile.scholarship_required is None:
        profile.financial_profile.scholarship_required = bool(extracted["scholarship_required"])

    # Psychological barriers — accumulate (don't reset)
    if extracted.get("psychological_barriers"):
        existing = {b.value for b in profile.psychological_barriers}
        for barrier_str in extracted["psychological_barriers"]:
            if barrier_str not in existing:
                try:
                    profile.psychological_barriers.append(
                        PsychologicalBarrier(barrier_str)
                    )
                    existing.add(barrier_str)
                except ValueError:
                    pass

    if extracted.get("sophistication_level") and not profile.sophistication_level:
        try:
            level = int(extracted["sophistication_level"])
            if 1 <= level <= 5:
                profile.sophistication_level = level
        except (ValueError, TypeError):
            pass

    if extracted.get("emotional_state"):
        # Always update emotional state — it changes conversation to conversation
        profile.emotional_state = extracted["emotional_state"]


def compute_completeness(profile: "StudentProfile") -> float:
    """
    Scores profile completeness from 0.0 to 1.0.
    Used to drive stage transitions and advisor response depth.
    Higher completeness → advisor can make more specific recommendations.
    """
    from models import PsychologicalBarrier

    checks = {
        "name":           (profile.first_name is not None,                           0.05),
        "country":        (profile.country_of_origin != "unknown",                   0.10),
        "age":            (profile.age is not None,                                  0.04),
        "level":          (profile.academic_background.current_level is not None,    0.10),
        "strength":       (profile.academic_background.academic_strength is not None,0.08),
        "gpa":            (profile.academic_background.gpa_or_percentage is not None,0.05),
        "interests":      (len(profile.career_interests) >= 1,                       0.12),
        "strong_interest":(any(ci.confidence > 0.6 for ci in profile.career_interests), 0.08),
        "financials":     (profile.financial_profile.tier is not None,               0.10),
        "target_country": (len(profile.country_of_study_preference) > 0,            0.08),
        "values":         (len(profile.values) > 0,                                  0.05),
        "psychology":     (
            len(profile.psychological_barriers) > 0 and
            profile.psychological_barriers != [PsychologicalBarrier.NONE],
            0.05,
        ),
        "sophistication": (profile.sophistication_level is not None,                 0.05),
        "dream_career":   (profile.dream_career is not None,                         0.05),
    }

    score = sum(weight for _, (condition, weight) in checks.items() if condition)
    return min(1.0, round(score, 3))


def record_recommendation(
    session: Any,  # ConversationSession — using Any to avoid circular import
    recommendation: "UniversityRecommendation",
) -> None:
    """Appends a university recommendation to the session's recommendation list."""
    existing_names = {r.name.lower() for r in session.recommendations}
    if recommendation.name.lower() not in existing_names:
        session.recommendations.append(recommendation)
