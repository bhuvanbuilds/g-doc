import asyncio
from pprint import pprint

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
    pprint(evidence["virustotal"])

    # --------------------------------
    # Print IPinfo results
    # --------------------------------

    print("\nIPinfo:")
    pprint(evidence["ipinfo"])


if __name__ == "__main__":
    asyncio.run(main())