#!/usr/bin/env python3
"""
Check whether today is a BLS CPI or PPI release day.

Exit code 0 → today is a release day, proceed with data fetch.
Exit code 1 → not a release day, skip.

Used by the GitHub Actions workflow to avoid unnecessary commits.
"""
import re
import sys
import urllib.request
from datetime import datetime, timezone

SCHEDULE_URLS = [
    "https://www.bls.gov/schedule/news_release/cpi.htm",
    "https://www.bls.gov/schedule/news_release/ppi.htm",
]

MONTH_MAP = {
    "January": 1,  "February": 2,  "March": 3,    "April": 4,
    "May": 5,       "June": 6,      "July": 7,     "August": 8,
    "September": 9, "October": 10,  "November": 11, "December": 12,
}

def fetch(url):
    req = urllib.request.Request(
        url, headers={"User-Agent": "Mozilla/5.0 (BLS-release-checker; bernharddalheimer.com)"}
    )
    with urllib.request.urlopen(req, timeout=15) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_dates(html):
    """Return set of (year, month, day) tuples found in the page."""
    pattern = r"(" + "|".join(MONTH_MAP) + r")\s+(\d{1,2}),?\s+(\d{4})"
    dates = set()
    for m in re.finditer(pattern, html):
        month_name, day, year = m.groups()
        dates.add((int(year), MONTH_MAP[month_name], int(day)))
    return dates


def main():
    today = datetime.now(timezone.utc)
    today_key = (today.year, today.month, today.day)
    print(f"Checking BLS release schedule for {today.strftime('%Y-%m-%d')}…")

    errors = []
    for url in SCHEDULE_URLS:
        name = url.rsplit("/", 1)[-1]
        try:
            html = fetch(url)
            dates = parse_dates(html)
            print(f"  {name}: found {len(dates)} release dates")
            if today_key in dates:
                print(f"✓ Today matches a release date in {name} — proceeding.")
                sys.exit(0)
        except Exception as exc:
            errors.append(f"{name}: {exc}")
            print(f"  Warning: could not fetch {name}: {exc}", file=sys.stderr)

    if errors and len(errors) == len(SCHEDULE_URLS):
        # All schedule pages failed — run anyway so we don't miss a release
        print("All schedule pages unreachable — running fetch as a precaution.", file=sys.stderr)
        sys.exit(0)

    print("Not a BLS release day — skipping fetch.")
    sys.exit(1)


if __name__ == "__main__":
    main()
