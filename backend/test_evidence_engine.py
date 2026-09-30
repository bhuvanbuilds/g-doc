import asyncio
from pprint import pprint
import unittest
from unittest.mock import AsyncMock, patch

from parsers.email_parser import parse_email
from detection.evidence_engine import build_evidence


async def main():

    # --------------------------------
    # Read test email
    # --------------------------------

    with open("test_emails/suspicious_test.eml", "rb") as file:
        email_bytes = file.read()

    # --------------------------------
    # Parse email
    # --------------------------------

    email_data = parse_email(email_bytes)

    # --------------------------------
    # Build complete evidence
    # --------------------------------

    evidence = await build_evidence(email_data)

    # --------------------------------
    # Print observations
    # --------------------------------

    print("\nEVIDENCE ENGINE")
    print("================")

    print("\nObservations:")

    for observation in evidence["observations"]:

        print(f"\nType: {observation['type']}")

        print(f"Title: {observation['title']}")

        print(f"Severity: {observation['severity']}")

        print("Evidence:")

        pprint(observation["evidence"])

    # --------------------------------
    # Print VirusTotal results
    # --------------------------------

    print("\nVirusTotal:")
    pprint(evidence["technical_evidence"]["virustotal"])

    # --------------------------------
    # Print IPinfo results
    # --------------------------------

    print("\nIPinfo:")
    pprint(evidence["technical_evidence"]["ipinfo"])

    print("\nRisk Assessment:")
    pprint(evidence["risk_assessment"])


class EvidenceEnginePipelineTests(unittest.TestCase):
    def test_build_evidence_returns_risk_assessment_when_groq_fails(self):
        email_data = {
            "from": "Sender <sender@example.com>",
            "reply_to": "Replies <other.example@gmail.com>",
            "return_path": "<sender@example.com>",
            "received": ["from relay.example (198.51.100.42)"],
            "authentication_results": [
                "mx.example; spf=pass dkim=pass dmarc=pass"
            ],
            "urls": ["https://example.com/login"],
            "attachments": [],
        }
        groq_error = {
            "status": "error",
            "provider": "groq",
            "error": "Groq analysis failed",
        }

        with (
            patch(
                "detection.evidence_engine.lookup_url",
                new_callable=AsyncMock,
            ) as lookup_url,
            patch(
                "detection.evidence_engine.lookup_ip",
            ) as lookup_ip,
            patch(
                "detection.evidence_engine.analyze_email_with_groq",
                return_value=groq_error,
            ) as analyze_with_groq,
        ):
            lookup_url.return_value = {
                "status": "found",
                "url": "https://example.com/login",
                "last_analysis_stats": {
                    "malicious": 0,
                    "suspicious": 0,
                },
            }
            lookup_ip.return_value = {
                "status": "found",
                "ip": "198.51.100.42",
            }

            evidence = asyncio.run(build_evidence(email_data))

        self.assertEqual(
            set(evidence),
            {
                "technical_evidence",
                "ai_analysis",
                "risk_assessment",
                "observations",
            },
        )
        self.assertEqual(evidence["ai_analysis"], groq_error)
        technical_evidence = evidence["technical_evidence"]
        self.assertIn("relay", technical_evidence)
        self.assertIn("relay_path", technical_evidence["relay"])
        self.assertTrue(technical_evidence["relay"]["relay_path"])
        relay_observations = technical_evidence["relay"]["observations"]
        self.assertTrue(relay_observations)
        for observation in relay_observations:
            self.assertIn(observation, evidence["observations"])
        self.assertEqual(
            technical_evidence["headers"]["received_ips"],
            ["198.51.100.42"],
        )
        self.assertEqual(
            set(evidence["risk_assessment"]),
            {"score", "risk_level", "confidence", "reasons", "breakdown"},
        )
        lookup_url.assert_awaited_once_with("https://example.com/login")
        lookup_ip.assert_called_once_with("198.51.100.42")
        analyze_with_groq.assert_called_once_with(
            email_data=email_data,
            evidence=evidence["technical_evidence"],
        )


if __name__ == "__main__":
    asyncio.run(main())