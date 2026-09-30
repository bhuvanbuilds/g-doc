from parsers.email_parser import parse_email
from parsers.attachment_analysis import analyze_attachments


with open("test_emails/suspicious_test.eml", "rb") as file:
    email_bytes = file.read()


email_data = parse_email(email_bytes)

analysis = analyze_attachments(
    email_data["attachments"]
)

print("\nATTACHMENT ANALYSIS")
print("===================")

print("Attachments:", analysis["attachments"])

print("\nObservations:")

for observation in analysis["observations"]:
    print(f"- {observation['title']}")
    print(f"  Severity: {observation['severity']}")
    print(f"  Evidence: {observation['evidence']}")