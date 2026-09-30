import os
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import errors


load_dotenv()


def get_gemini_api_key() -> str:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is not configured"
        )

    return api_key


def analyze_email_with_gemini(
    subject: str | None,
    sender: str | None,
    body_text: str | None,
) -> dict[str, Any]:
    """
    Analyze email content for semantic and social-engineering signals.

    Gemini performs semantic analysis only.
    Technical evidence is handled separately.
    """

    api_key = get_gemini_api_key()

    client = genai.Client(api_key=api_key)

    prompt = f"""
You are an email security analysis assistant.

Analyze the following email for semantic and social-engineering
indicators.

Do NOT claim that the email is definitively malicious.
Do NOT invent technical evidence.
Only analyze the content provided.

Look for:

1. Urgency or pressure
2. Threats or consequences
3. Requests for credentials or sensitive information
4. Financial/payment requests
5. Impersonation indicators
6. Suspicious instructions
7. Business Email Compromise (BEC) indicators
8. Social-engineering techniques
9. Other unusual behavioral indicators

Return ONLY valid JSON using this structure:

{{
  "summary": "short neutral summary",
  "risk_indicators": [
    {{
      "type": "string",
      "severity": "low | medium | high",
      "description": "string",
      "evidence": "short quote or reference from the email"
    }}
  ],
  "benign_indicators": [
    "string"
  ]
}}

Email:

From: {sender}

Subject: {subject}

Body:
{body_text}
"""

    try:
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
        )

        text = response.text or ""

        return {
            "status": "success",
            "raw_response": text,
        }

    except errors.ServerError as exc:
        return {
            "status": "unavailable",
            "error": "Gemini is temporarily unavailable",
            "details": str(exc),
        }

    except errors.ClientError as exc:
        return {
            "status": "error",
            "error": "Gemini API request failed",
            "details": str(exc),
        }

    except Exception as exc:
        return {
            "status": "error",
            "error": "Unexpected Gemini error",
            "details": str(exc),
        }