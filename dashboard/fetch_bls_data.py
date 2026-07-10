#!/usr/bin/env python3
"""
Fetch BLS data for the Food Price Dashboard and write data.json.
Run this after each monthly CPI/PPI release.

Usage:
    python fetch_bls_data.py [--out path/to/data.json]

Writes data.json to the same directory as this script by default,
and also to the website dashboard/ directory if it exists.
"""
import json
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

BLS_API = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

SERIES = [
    # CPI main
    "CUUR0000SA0",
    "CUUR0000SAF1",
    "CUUR0000SAF11",
    "CUUR0000SEFV",
    # CPI subcategories
    "CUUR0000SAF111",
    "CUUR0000SAF112",
    "CUUR0000SEFJ",
    "CUUR0000SAF113",
    "CUUR0000SAF114",
    "CUUR0000SAF115",
    # PPI food value chain
    "WPU01",
    "WPUID621",
    "WPU02",
    "WPUFD4111",
    # Average hourly earnings
    "CES0500000003",
    "CES3231100003",
    "CES7000000003",
]

# BLS public API: max 25 series per request, 10 years of history without a key
BATCH_SIZE = 20


def fetch_batch(series_ids, start_year, end_year):
    payload = json.dumps({
        "seriesid": series_ids,
        "startyear": str(start_year),
        "endyear": str(end_year),
    }).encode()
    req = urllib.request.Request(
        BLS_API,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.loads(resp.read())
    if data.get("status") != "REQUEST_SUCCEEDED":
        msgs = data.get("message", [])
        raise RuntimeError(f"BLS request failed: {msgs}")
    return data


def parse_series(bls_result):
    out = {}
    for s in bls_result.get("Results", {}).get("series", []):
        sid = s["seriesID"]
        obs = []
        for d in s["data"]:
            if d["period"] == "M13":
                continue
            month = int(d["period"][1:])
            year = int(d["year"])
            try:
                val = float(d["value"])
            except (ValueError, TypeError):
                continue
            obs.append({"date": f"{year}-{month:02d}-15", "value": val})
        obs.sort(key=lambda x: x["date"])
        out[sid] = obs
    return out


def main():
    out_path = Path(__file__).parent / "data.json"
    if "--out" in sys.argv:
        out_path = Path(sys.argv[sys.argv.index("--out") + 1])

    now = datetime.now(timezone.utc)
    end_year = now.year
    start_year = end_year - 9

    print(f"Fetching {len(SERIES)} BLS series ({start_year}–{end_year})…")

    all_data = {}
    for i in range(0, len(SERIES), BATCH_SIZE):
        batch = SERIES[i:i + BATCH_SIZE]
        print(f"  Batch {i // BATCH_SIZE + 1}: {len(batch)} series")
        result = fetch_batch(batch, start_year, end_year)
        all_data.update(parse_series(result))

    output = {
        "fetched": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "series": all_data,
    }

    out_path.write_text(json.dumps(output, separators=(",", ":")))
    print(f"Wrote {out_path} ({out_path.stat().st_size // 1024} KB)")



if __name__ == "__main__":
    main()
