from pprint import pprint

from services.ipinfo import lookup_ip


def main():
    ip_address = "8.8.8.8"

    result = lookup_ip(ip_address)

    print("\nIPINFO RESULT")
    print("=============")

    pprint(result)


if __name__ == "__main__":
    main()