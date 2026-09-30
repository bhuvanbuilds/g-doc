from pprint import pprint

from parsers.email_parser import parse_email
from detection.evidence_engine import build_evidence


with open("test_emails/suspicious_test.eml", "rb") as file:
    email_bytes = file.read()


email_data = parse_email(email_bytes)

evidence = build_evidence(email_data)

print("\nEVIDENCE ENGINE")
print("================")

print("\nObservations:")

for observation in evidence["observations"]:
    print(f"\nType: {observation['type']}")
    print(f"Title: {observation['title']}")
    print(f"Severity: {observation['severity']}")
    print("Evidence:")
    pprint(observation["evidence"])