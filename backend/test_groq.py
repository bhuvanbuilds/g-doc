import asyncio

from services.groq import analyze_email_with_groq


async def main():
    email_data = {
        "from": "Microsoft Support <security@example.com>",
        "to": "victim@example.com",
        "subject": "Urgent: Verify your account",
        "body_text": """
        Your account will be suspended today.
        Click the link below immediately to verify your password.
        """,
        "urls": [
            "https://example.com/verify"
        ],
    }

    evidence = {
        "observations": [
            {
                "type": "reply_to_mismatch",
                "severity": "medium",
                "title": "Reply-To domain differs from sender domain",
            }
        ]
    }

    result = analyze_email_with_groq(email_data, evidence)

    print("\nGROQ ANALYSIS")
    print(result)


if __name__ == "__main__":
    asyncio.run(main())