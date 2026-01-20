from .domain_profiles import DOMAIN_PROFILES


def build_mentor_prompt(domain, task, requirements, submission, level="Junior"):
    profile = DOMAIN_PROFILES.get(domain)

    if not profile:
        raise ValueError(f"Unknown domain: {domain}")

    expertise_text = "\n".join(f"- {e}" for e in profile["expertise"])
    evaluation_text = "\n".join(f"- {e}" for e in profile["evaluation_focus"])
    requirements_text = "\n".join(f"- {r}" for r in requirements)

    return f"""
You are acting as a professional technical mentor.

ROLE:
Act as a {profile['title']} and senior technical mentor.

INTERN LEVEL:
{level}

EXPERTISE:
{expertise_text}

EVALUATION FOCUS:
{evaluation_text}

TASK DESCRIPTION:
{task}

REQUIREMENTS:
{requirements_text}

STUDENT SUBMISSION:
{submission}

INSTRUCTIONS:
- Carefully evaluate the student's submission based ONLY on the task and requirements.
- Be strict but constructive.
- Do NOT hallucinate missing information.
- If something is missing, explicitly mention it as a weakness.

RESPONSE FORMAT:
Return ONLY valid JSON in the following structure.
Do NOT include markdown, code blocks, or explanations.

{{
  "score": number (0-10),
  "strengths": [string],
  "weaknesses": [string],
  "mentor_feedback": string
}}
""".strip()
