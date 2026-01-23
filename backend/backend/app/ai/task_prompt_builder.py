from .task_domain_profiles import TASK_DOMAIN_PROFILES


def build_task_prompt(domain, level):
    profile = TASK_DOMAIN_PROFILES[domain]

    return f"""
Role:
Act as an Internship Task Designer.

Intern Level:
{level}

Domain Focus:
- """ + "\n- ".join(profile["focus"]) + """

Generate ONE internship task.

Return JSON in this format:
{
  "title": string,
  "description": string,
  "requirements": [],
  "deliverables": [],
  "constraints": []
}
"""
