from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------

class ConversationStage(str, Enum):
    GREETING        = "greeting"
    RAPPORT         = "rapport"
    ASSESSMENT      = "assessment"
    EXPLORATION     = "exploration"
    CAREER_MAPPING  = "career_mapping"
    RECOMMENDATION  = "recommendation"
    DECISION_SUPPORT = "decision_support"


class EducationLevel(str, Enum):
    HIGH_SCHOOL   = "high_school"
    UNDERGRADUATE = "undergraduate"
    GRADUATE      = "graduate"
    PROFESSIONAL  = "professional"
    PHD           = "phd"


class AcademicStrength(str, Enum):
    EXCEPTIONAL = "exceptional"   # Top 5%
    STRONG      = "strong"        # Top 20%
    AVERAGE     = "average"
    DEVELOPING  = "developing"


class FinancialTier(str, Enum):
    FULL_SCHOLARSHIP_NEEDED = "full_scholarship_needed"
    PARTIAL_AID_NEEDED      = "partial_aid_needed"
    SELF_FUNDED_BUDGET      = "self_funded_budget"
    COMFORTABLE             = "comfortable"
    AFFLUENT                = "affluent"


class PsychologicalBarrier(str, Enum):
    PARENTAL_PRESSURE        = "parental_pressure"
    FEAR_OF_FAILURE          = "fear_of_failure"
    IMPOSTER_SYNDROME        = "imposter_syndrome"
    CONFUSION                = "confusion"
    CULTURAL_RESTRICTION     = "cultural_restriction"
    FINANCIAL_ANXIETY        = "financial_anxiety"
    UNREALISTIC_EXPECTATIONS = "unrealistic_expectations"
    NONE                     = "none"


# ---------------------------------------------------------------------------
# Academic & Financial sub-models
# ---------------------------------------------------------------------------

class AcademicBackground(BaseModel):
    current_level: Optional[EducationLevel] = None
    current_institution: Optional[str] = None
    graduation_year: Optional[int] = None
    gpa_or_percentage: Optional[str] = None
    academic_strength: Optional[AcademicStrength] = None
    strongest_subjects: List[str] = Field(default_factory=list)
    weakest_subjects: List[str] = Field(default_factory=list)
    standardized_tests: Dict[str, str] = Field(default_factory=dict)
    # e.g. {"SAT": "1450", "IELTS": "7.5", "JEE": "95th percentile"}
    extracurriculars: List[str] = Field(default_factory=list)
    achievements: List[str] = Field(default_factory=list)


class FinancialProfile(BaseModel):
    tier: Optional[FinancialTier] = None
    annual_budget_usd: Optional[int] = None
    open_to_loans: Optional[bool] = None
    scholarship_required: Optional[bool] = None
    preferred_countries_by_cost: List[str] = Field(default_factory=list)
    family_can_contribute: Optional[bool] = None
    notes: Optional[str] = None


class CareerInterest(BaseModel):
    field: str
    confidence: float = Field(default=0.5, ge=0, le=1)
    source: Literal["stated", "inferred", "confirmed"] = "inferred"
    parent_approved: Optional[bool] = None
    notes: Optional[str] = None


class PersonalitySignal(BaseModel):
    introvert_extrovert: Optional[float] = Field(None, ge=0, le=1)
    # 0 = strong introvert, 1 = strong extrovert
    risk_tolerance: Optional[float] = Field(None, ge=0, le=1)
    creative_analytical_balance: Optional[float] = Field(None, ge=0, le=1)
    # 0 = pure analytical, 1 = pure creative
    leadership_interest: Optional[bool] = None
    prefers_structure: Optional[bool] = None
    global_mobility_willing: Optional[bool] = None


# ---------------------------------------------------------------------------
# Core Student Profile
# ---------------------------------------------------------------------------

class StudentProfile(BaseModel):
    profile_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str

    # Identity
    first_name: Optional[str] = None
    age: Optional[int] = None
    country_of_origin: str = "unknown"
    country_of_study_preference: List[str] = Field(default_factory=list)
    language_preference: str = "English"
    native_language: Optional[str] = None

    # Academic
    academic_background: AcademicBackground = Field(default_factory=AcademicBackground)

    # Interests and career
    career_interests: List[CareerInterest] = Field(default_factory=list)
    dream_career: Optional[str] = None
    backup_interests: List[str] = Field(default_factory=list)
    values: List[str] = Field(default_factory=list)
    # e.g. ["helping others", "creative work", "financial security"]

    # Financial
    financial_profile: FinancialProfile = Field(default_factory=FinancialProfile)

    # Psychological
    psychological_barriers: List[PsychologicalBarrier] = Field(default_factory=list)
    personality_signals: PersonalitySignal = Field(default_factory=PersonalitySignal)
    sophistication_level: Optional[int] = Field(None, ge=1, le=5)
    # 1 = very young/confused, 5 = highly self-aware and research-ready
    emotional_state: Optional[str] = None

    # Meta
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    completeness_score: float = Field(default=0.0, ge=0, le=1)

    def to_context_string(self) -> str:
        """Renders profile as a compact advisor context block."""
        parts: List[str] = []
        if self.first_name:
            parts.append(f"Name: {self.first_name}")
        if self.age:
            parts.append(f"Age: {self.age}")
        if self.country_of_origin != "unknown":
            parts.append(f"From: {self.country_of_origin}")
        if self.country_of_study_preference:
            parts.append(f"Target countries: {', '.join(self.country_of_study_preference)}")
        if self.academic_background.current_level:
            parts.append(f"Level: {self.academic_background.current_level.value}")
        if self.academic_background.academic_strength:
            parts.append(f"Academic: {self.academic_background.academic_strength.value}")
        if self.academic_background.gpa_or_percentage:
            parts.append(f"GPA/Grade: {self.academic_background.gpa_or_percentage}")
        if self.academic_background.standardized_tests:
            tests = ", ".join(f"{k}: {v}" for k, v in self.academic_background.standardized_tests.items())
            parts.append(f"Tests: {tests}")
        if self.career_interests:
            interests = [f"{ci.field} ({ci.source}, conf={ci.confidence:.1f})"
                         for ci in self.career_interests]
            parts.append(f"Interests: {', '.join(interests)}")
        if self.dream_career:
            parts.append(f"Dream career: {self.dream_career}")
        if self.values:
            parts.append(f"Values: {', '.join(self.values)}")
        if self.financial_profile.tier:
            parts.append(f"Financials: {self.financial_profile.tier.value}")
        if self.financial_profile.annual_budget_usd:
            parts.append(f"Budget: ${self.financial_profile.annual_budget_usd:,}/yr")
        barriers = [b.value for b in self.psychological_barriers
                    if b != PsychologicalBarrier.NONE]
        if barriers:
            parts.append(f"Barriers: {', '.join(barriers)}")
        if self.sophistication_level:
            parts.append(f"Sophistication: {self.sophistication_level}/5")
        if self.emotional_state:
            parts.append(f"Mood: {self.emotional_state}")
        return " | ".join(parts) if parts else "Minimal profile — still gathering info"


# ---------------------------------------------------------------------------
# Recommendation models
# ---------------------------------------------------------------------------

class UniversityRecommendation(BaseModel):
    university_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    country: str
    city: str
    ranking_global: Optional[int] = None
    ranking_for_field: Optional[int] = None

    match_score: float = Field(default=0.0, ge=0, le=1)
    match_reasons: List[str] = Field(default_factory=list)
    concerns: List[str] = Field(default_factory=list)

    annual_tuition_usd: Optional[int] = None
    annual_living_cost_usd: Optional[int] = None
    available_scholarships: List[str] = Field(default_factory=list)
    admission_rate: Optional[float] = None
    required_english_test: Optional[str] = None

    tier: Literal["reach", "target", "safety"] = "target"
    international_student_ratio: Optional[float] = None
    recommended_at: datetime = Field(default_factory=datetime.utcnow)


class CourseRecommendation(BaseModel):
    course_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    degree_type: str
    university_name: str
    duration_years: float = 4.0

    typical_career_paths: List[str] = Field(default_factory=list)
    average_starting_salary_usd: Optional[int] = None
    employment_rate_pct: Optional[float] = None

    match_score: float = Field(default=0.0, ge=0, le=1)
    match_reasons: List[str] = Field(default_factory=list)
    prerequisites: List[str] = Field(default_factory=list)


class CareerPath(BaseModel):
    career_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    field: str
    description: str
    typical_education: List[str] = Field(default_factory=list)
    salary_range_usd: Optional[Dict[str, int]] = None
    job_market: Literal["growing", "stable", "declining", "niche"] = "stable"
    countries_strong_in: List[str] = Field(default_factory=list)
    day_in_the_life: Optional[str] = None
    alternative_paths: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Conversation / Session models
# ---------------------------------------------------------------------------

class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    turn_number: int = 0


class ConversationSession(BaseModel):
    session_id: str
    student_profile: StudentProfile
    stage: ConversationStage = ConversationStage.GREETING
    previous_stage: Optional[ConversationStage] = None
    history: List[Message] = Field(default_factory=list)
    tool_calls_made: List[Dict[str, Any]] = Field(default_factory=list)
    recommendations: List[UniversityRecommendation] = Field(default_factory=list)
    course_recommendations: List[CourseRecommendation] = Field(default_factory=list)
    career_paths: List[CareerPath] = Field(default_factory=list)
    turn_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_active: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True

    # Advisor's private running notes — never shown to student
    advisor_notes: str = ""
    topics_covered: List[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# API request/response models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    session_id: str
    message: str = Field(min_length=1, max_length=4000)
    metadata: Optional[Dict[str, Any]] = None

    @field_validator("message")
    @classmethod
    def strip_message(cls, v: str) -> str:
        return v.strip()


class ChatResponse(BaseModel):
    session_id: str
    response: str
    stage: ConversationStage
    turn_number: int
    tools_used: List[str] = Field(default_factory=list)
    profile_completeness: float
    recommendations_count: int = 0


class NewSessionRequest(BaseModel):
    user_id: Optional[str] = None
    initial_metadata: Optional[Dict[str, Any]] = None
    # Optional hints: {"country_hint": "India", "language": "en"}


class NewSessionResponse(BaseModel):
    session_id: str
    created_at: datetime
    greeting_message: str


class SessionProfileResponse(BaseModel):
    session_id: str
    profile: StudentProfile
    stage: ConversationStage
    completeness_score: float


class SessionRecommendationsResponse(BaseModel):
    session_id: str
    universities: List[UniversityRecommendation]
    courses: List[CourseRecommendation]
    career_paths: List[CareerPath]
    last_updated: datetime
