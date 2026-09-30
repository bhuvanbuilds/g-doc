import json
import os
from typing import Any

from dotenv import load_dotenv
from groq import Groq

load_dotenv()


def get_groq_api_key() -> str:
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not configured")

    return api_key


def get_groq_client() -> Groq:
    return Groq(api_key=get_groq_api_key())


def analyze_email_with_groq(
    email_data: dict[str, Any],
    evidence: dict[str, Any],
) -> dict[str, Any]:

    try:
        client = get_groq_client()

        prompt = f"""
You are an email cybersecurity analysis assistant.

Analyze the following user-selected email and the technical evidence
collected by the security analysis pipeline.

Identify semantic and social-engineering signals such as:
- phishing language
- urgency or pressure
- impersonation
- credential harvesting
- financial fraud indicators
- suspicious requests
- social engineering
- unusual sender behavior

IMPORTANT RULES:
- Do not invent technical evidence.
- Do not claim an IP address is the attacker.
- Do not claim a domain is malicious unless the supplied evidence supports it.
- Do not assume that an email is malicious.
- Base conclusions only on the supplied email and evidence.
- Technical indicators such as SPF, DKIM, DMARC, VirusTotal and IPinfo
  must only be interpreted from the supplied evidence.

Return ONLY valid JSON.
Do not use Markdown.
Do not wrap the JSON in ```.

Use exactly this structure:

{{
    "risk_level": "low",
    "confidence": 0.0,
    "summary": "short explanation",
    "signals": [
        {{
            "type": "signal type",
            "severity": "low",
            "description": "what was observed"
        }}
    ],
    "recommended_actions": [
        "action 1",
        "action 2"
    ]
}}

EMAIL DATA:
{json.dumps(email_data, indent=2, default=str)}

TECHNICAL EVIDENCE:
{json.dumps(evidence, indent=2, default=str)}
"""

        response = client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a cybersecurity email analysis assistant. "
                        "Return only valid JSON."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.1,
        )

        content = response.choices[0].message.content

        if not content:
            return {
                "status": "error",
                "provider": "groq",
                "error": "Groq returned an empty response",
            }

        try:
            analysis = json.loads(content)
        except json.JSONDecodeError:
            return {
                "status": "error",
                "provider": "groq",
                "error": "Groq returned invalid JSON",
                "raw_response": content,
            }

        return {
            "status": "success",
            "provider": "groq",
            "model": "openai/gpt-oss-20b",
            "analysis": analysis,
        }

    except Exception as exc:
        return {
            "status": "error",
            "provider": "groq",
            "error": f"Groq analysis failed: {str(exc)}",
        }