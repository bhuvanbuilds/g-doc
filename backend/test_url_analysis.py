from parsers.email_parser import parse_email
from parsers.url_analysis import analyze_urls


with open("test_emails/suspicious_test.eml", "rb") as file:
    email_bytes = file.read()


email_data = parse_email(email_bytes)

analysis = analyze_urls(email_data["urls"])

print("\nURL ANALYSIS")
print("============")

for url in analysis["urls"]:
    print("URL:", url["url"])
    print("Hostname:", url["hostname"])
    print("Scheme:", url["scheme"])
    print("Port:", url["port"])
    print("Path:", url["path"])
    print("IP address:", url["is_ip_address"])

print("\nObservations:")

for observation in analysis["observations"]:
    print(f"- {observation['title']}")
    print(f"  Severity: {observation['severity']}")
    print(f"  Evidence: {observation['evidence']}")