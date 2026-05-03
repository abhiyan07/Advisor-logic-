"""
Tool definitions in Anthropic function-calling format.

Pass ADVISOR_TOOLS to client.messages.create(tools=ADVISOR_TOOLS).
These schemas are also the contract for Emergent Agent tool registration.
"""

ADVISOR_TOOLS: list[dict] = [
    {
        "name": "search_universities",
        "description": (
            "Search for universities matching a student's profile using real-time web data. "
            "Returns universities with tuition costs, rankings, admission requirements, "
            "available scholarships, and fit notes. "
            "Use this after Stage 4 when you have the student's target countries, "
            "field of study, and rough financial situation established. "
            "Do NOT call before you have enough profile data — early searches produce "
            "generic, unhelpful results."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "field_of_study": {
                    "type": "string",
                    "description": (
                        "Academic field or subject area. Be specific: "
                        "'marine biology', 'game design', 'international business', "
                        "'mechanical engineering', not just 'science' or 'arts'."
                    ),
                },
                "degree_level": {
                    "type": "string",
                    "enum": ["undergraduate", "graduate", "phd", "diploma"],
                    "description": "Degree level the student is seeking.",
                },
                "target_countries": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": (
                        "Countries the student is open to studying in. "
                        "Use full country names: ['United Kingdom', 'Canada', 'Australia']. "
                        "Omit if no preference established."
                    ),
                },
                "max_annual_tuition_usd": {
                    "type": "integer",
                    "description": (
                        "Maximum annual tuition in USD the student can afford. "
                        "Pass 0 if budget is unlimited or unknown."
                    ),
                },
                "student_country_of_origin": {
                    "type": "string",
                    "description": (
                        "Student's home country — affects international vs domestic fee tiers "
                        "and visa considerations."
                    ),
                },
                "scholarship_required": {
                    "type": "boolean",
                    "description": "True if the student needs scholarship funding to attend.",
                },
                "ranking_preference": {
                    "type": "string",
                    "enum": ["top_20", "top_100", "top_200", "any"],
                    "description": "How important global rankings are to this student.",
                },
            },
            "required": ["field_of_study", "degree_level"],
        },
    },
    {
        "name": "search_career_paths",
        "description": (
            "Find career paths matching a student's interests and strengths. "
            "Returns specific job titles, salary ranges, job market outlook, "
            "required education, day-in-the-life descriptions, and adjacent fields. "
            "Use this during the career mapping stage to ground the conversation "
            "in real-world data."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "interest_area": {
                    "type": "string",
                    "description": (
                        "The broad area of interest. Be specific: "
                        "'marine biology', 'UX design', 'game development', "
                        "'social entrepreneurship', not just 'science' or 'design'."
                    ),
                },
                "education_level": {
                    "type": "string",
                    "enum": ["high_school", "bachelors", "masters", "phd"],
                    "description": "Highest education level the student will complete.",
                },
                "target_country": {
                    "type": "string",
                    "description": (
                        "Country where the student plans to work — affects salary data "
                        "and job market strength."
                    ),
                },
                "strengths": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": (
                        "Student's known strengths, to find career paths that leverage them. "
                        "E.g. ['analytical thinking', 'strong communication', 'hands-on work']"
                    ),
                },
            },
            "required": ["interest_area"],
        },
    },
    {
        "name": "search_scholarships",
        "description": (
            "Find scholarship and funding opportunities for a student based on their profile. "
            "Returns specific named scholarships with funding amounts, eligibility criteria, "
            "deadlines, and application tips. "
            "Use this whenever financial constraints are a factor, or when presenting "
            "university recommendations — always pair scholarships with recommendations "
            "for students in the lower financial tiers."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "student_country_of_origin": {
                    "type": "string",
                    "description": "Student's home country — most scholarships are country-specific.",
                },
                "target_country_of_study": {
                    "type": "string",
                    "description": "Country the student wants to study in.",
                },
                "degree_level": {
                    "type": "string",
                    "enum": ["undergraduate", "graduate", "phd"],
                },
                "field_of_study": {
                    "type": "string",
                    "description": "Academic field — some scholarships are field-specific.",
                },
                "academic_strength": {
                    "type": "string",
                    "enum": ["exceptional", "strong", "average"],
                    "description": "Student's academic performance level — affects eligibility.",
                },
            },
            "required": ["student_country_of_origin", "target_country_of_study"],
        },
    },
    {
        "name": "get_admission_requirements",
        "description": (
            "Get admission requirements for a specific university and course, "
            "including minimum grades, English language requirements, test scores, "
            "application deadlines, and any country-specific requirements. "
            "Use this when a student has a specific school in mind, or to verify "
            "that a recommendation is genuinely achievable for the student's profile."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "university_name": {
                    "type": "string",
                    "description": "Full or partial name of the university.",
                },
                "course_name": {
                    "type": "string",
                    "description": "Name of the specific program or course.",
                },
                "degree_level": {
                    "type": "string",
                    "enum": ["undergraduate", "graduate", "phd", "diploma"],
                },
                "student_country_of_origin": {
                    "type": "string",
                    "description": "Student's home country — affects which requirements apply.",
                },
            },
            "required": ["university_name", "student_country_of_origin"],
        },
    },
]
