import asyncio
from pathlib import Path
from pprint import pprint

from detection.evidence_engine import build_evidence
from parsers.email_parser import parse_email


async def main() -> None:
    email_path = Path(__file__).parent / "test_emails" / "suspicious_test.eml"
    email_data = parse_email(email_path.read_bytes())
    evidence = await build_evidence(email_data)

    print("Technical observations:")
    pprint(evidence["technical_evidence"]["observations"])
    print("\nAI analysis:")
    pprint(evidence["ai_analysis"])


if __name__ == "__main__":
    asyncio.run(main())
