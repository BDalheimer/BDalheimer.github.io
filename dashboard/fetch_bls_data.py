#!/usr/bin/env python3
"""
Fetch BLS data for the Food Price Dashboard and write data.json.
Run this after each monthly CPI/PPI release.

Usage:
    python fetch_bls_data.py [--out path/to/data.json]

Writes data.json to the same directory as this script by default,
and also to the website dashboard/ directory if it exists.
"""
import csv
import io
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

# FAO Food Price Index — stable CSV published monthly (~1-month lag)
FFPI_URL = (
    "https://www.fao.org/media/docs/worldfoodsituationlibraries/"
    "default-document-library/food_price_indices_data.csv"
)
FFPI_COLS = {
    "Food Price Index": "FFPI_FOOD",
    "Meat":             "FFPI_MEAT",
    "Dairy":            "FFPI_DAIRY",
    "Cereals":          "FFPI_CEREALS",
    "Oils":             "FFPI_OILS",
    "Sugar":            "FFPI_SUGAR",
}


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


def fetch_ffpi():
    """Download FAO Food Price Index CSV and return series dict."""
    req = urllib.request.Request(
        FFPI_URL,
        headers={"User-Agent": "Mozilla/5.0 (food-price-dashboard; bernharddalheimer.com)"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        text = resp.read().decode("utf-8-sig")  # handle optional BOM
    # File has 2 title rows before the actual header row; skip them
    body = "\n".join(text.splitlines()[2:])
    reader = csv.DictReader(io.StringIO(body))
    series = {sid: [] for sid in FFPI_COLS.values()}
    for row in reader:
        date_str = row.get("Date", "").strip()
        if not date_str or len(date_str) < 7:
            continue
        date_out = date_str + "-15"  # YYYY-MM → YYYY-MM-15 (matches BLS format)
        for col, sid in FFPI_COLS.items():
            val_str = row.get(col, "").strip()
            if not val_str:
                continue
            try:
                series[sid].append({"date": date_out, "value": float(val_str)})
            except ValueError:
                continue
    return series


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

    print("Fetching FAO Food Price Index…")
    try:
        ffpi = fetch_ffpi()
        all_data.update(ffpi)
        n = sum(len(v) for v in ffpi.values())
        print(f"  Got {n} observations across {len(ffpi)} FFPI series")
    except Exception as exc:
        print(f"  Warning: FFPI fetch failed: {exc}", file=sys.stderr)

    output = {
        "fetched": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "series": all_data,
    }

    out_path.write_text(json.dumps(output, separators=(",", ":")))
    print(f"Wrote {out_path} ({out_path.stat().st_size // 1024} KB)")



if __name__ == "__main__":
    main()
