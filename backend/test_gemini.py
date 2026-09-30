from pprint import pprint

from parsers.email_parser import parse_email
from services.gemini import analyze_email_with_gemini


def main():

    with open("test_emails/suspicious_test.eml", "rb") as file:
        email_bytes = file.read()

    email_data = parse_email(email_bytes)

    result = analyze_email_with_gemini(
        subject=email_data.get("subject"),
        sender=email_data.get("from"),
        body_text=email_data.get("body_text"),
    )

    print("\nGEMINI ANALYSIS")
    print("================")

    pprint(result)


if __name__ == "__main__":
    main()