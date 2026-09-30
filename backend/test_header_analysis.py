from parsers.email_parser import parse_email
from parsers.header_analysis import analyze_headers


with open("test_emails/suspicious_test.eml", "rb") as file:
    email_bytes = file.read()


email_data = parse_email(email_bytes)

analysis = analyze_headers(email_data)

print("\nHEADER ANALYSIS")
print("================")

print("Sender domain:", analysis["sender_domain"])
print("Reply-To domain:", analysis["reply_to_domain"])
print("Return-Path domain:", analysis["return_path_domain"])
print("Received IPs:", analysis["received_ips"])

print("\nObservations:")

for observation in analysis["observations"]:
    print(f"- {observation['title']}")
    print(f"  Severity: {observation['severity']}")
    print(f"  Evidence: {observation['evidence']}")