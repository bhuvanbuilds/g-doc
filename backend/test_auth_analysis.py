from parsers.email_parser import parse_email
from parsers.auth_analysis import analyze_authentication


with open("test_emails/suspicious_test.eml", "rb") as file:
    email_bytes = file.read()


email_data = parse_email(email_bytes)

analysis = analyze_authentication(
    email_data["authentication_results"]
)

print("\nAUTHENTICATION ANALYSIS")
print("=======================")

print("SPF:", analysis["spf"])
print("DKIM:", analysis["dkim"])
print("DMARC:", analysis["dmarc"])

print("\nObservations:")

for observation in analysis["observations"]:
    print(f"- {observation['title']}")
    print(f"  Severity: {observation['severity']}")
    print(f"  Evidence: {observation['evidence']}")