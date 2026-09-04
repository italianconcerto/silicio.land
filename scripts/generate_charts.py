#!/usr/bin/env python3
"""Generate article graphics from checked-in source data."""

from __future__ import annotations

import csv
from html import escape
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "assets/data/epoch-cve-severity-monthly.csv"
OUTPUT = ROOT / "assets/images/posts/2026-09-04"


def chart() -> str:
    with DATA.open(newline="", encoding="utf-8") as source:
        rows = list(csv.DictReader(source))

    width, height = 1040, 600
    left, right, top, bottom = 74, 34, 92, 76
    plot_width = width - left - right
    plot_height = height - top - bottom
    max_value = 2750
    step = plot_width / len(rows)
    bar_width = max(6, step - 4)
    parts: list[str] = []

    for tick in range(0, 2501, 500):
        y = top + plot_height - (tick / max_value) * plot_height
        parts.append(f'<line x1="{left}" y1="{y:.1f}" x2="{width-right}" y2="{y:.1f}" class="grid"/>')
        parts.append(f'<text x="{left-14}" y="{y+5:.1f}" text-anchor="end" class="axis">{tick:,}</text>')

    for index, row in enumerate(rows):
        high = int(row["High"])
        critical = int(row["Critical"])
        x = left + index * step + 2
        high_height = high / max_value * plot_height
        critical_height = critical / max_value * plot_height
        y_high = top + plot_height - high_height
        y_critical = y_high - critical_height
        parts.append(f'<rect x="{x:.1f}" y="{y_high:.1f}" width="{bar_width:.1f}" height="{high_height:.1f}" class="high"/>')
        parts.append(f'<rect x="{x:.1f}" y="{y_critical:.1f}" width="{bar_width:.1f}" height="{critical_height:.1f}" class="critical"/>')

        month = row["Month"]
        if month.endswith("-01"):
            parts.append(f'<text x="{x + bar_width/2:.1f}" y="{height-bottom+28}" text-anchor="middle" class="axis year">{escape(month[:4])}</text>')

        if month in {"2026-06", "2026-07"}:
            total = high + critical
            if month == "2026-06":
                parts.append(f'<text x="{x-7:.1f}" y="{y_critical-13:.1f}" text-anchor="end" class="value">{total:,}</text>')
            else:
                parts.append(f'<text x="{x + bar_width/2:.1f}" y="{y_critical-13:.1f}" text-anchor="middle" class="value">{total:,}</text>')

    mythos_index = next(i for i, row in enumerate(rows) if row["Month"] == "2026-04")
    mythos_x = left + mythos_index * step + step / 2
    parts.append(f'<line x1="{mythos_x:.1f}" y1="{top}" x2="{mythos_x:.1f}" y2="{top+plot_height}" class="event"/>')
    parts.append(f'<text x="{mythos_x-10:.1f}" y="{top+20}" text-anchor="end" class="event-label">MYTHOS PREVIEW</text>')

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="title description">
  <title id="title">Monthly high and critical severity CVEs</title>
  <desc id="description">Stacked bars show monthly high and critical CVEs disclosed by 21 notable organizations from January 2022 to July 2026. June and July 2026 rise sharply to 1,549 and 2,512.</desc>
  <style>
    text {{ font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }}
    .background {{ fill: #0b0d12; }}
    .grid {{ stroke: #29313b; stroke-width: 1; }}
    .axis {{ fill: #77808c; font-size: 14px; }}
    .year {{ letter-spacing: .08em; }}
    .high {{ fill: #37e6d0; }}
    .critical {{ fill: #ff4f9a; }}
    .heading {{ fill: #f2f4f6; font-size: 21px; font-weight: 700; letter-spacing: .035em; }}
    .legend {{ fill: #aab1ba; font-size: 13px; }}
    .value {{ fill: #f2f4f6; font-size: 14px; font-weight: 700; }}
    .event {{ stroke: #77808c; stroke-width: 1; stroke-dasharray: 5 6; }}
    .event-label {{ fill: #aab1ba; font-size: 12px; letter-spacing: .06em; }}
  </style>
  <rect class="background" width="100%" height="100%"/>
  <text x="{left}" y="42" class="heading">HIGH + CRITICAL CVEs / MONTH</text>
  <rect x="{width-298}" y="29" width="13" height="13" class="high"/><text x="{width-278}" y="41" class="legend">HIGH</text>
  <rect x="{width-188}" y="29" width="13" height="13" class="critical"/><text x="{width-168}" y="41" class="legend">CRITICAL</text>
  {''.join(parts)}
  <text x="{left}" y="{height-18}" class="axis">21 NOTABLE ORGANIZATIONS · SOURCE: EPOCH AI</text>
</svg>
'''


def first_data_card() -> str:
    return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1040 570" role="img" aria-labelledby="title description">
  <title id="title">FIRST 2026 mid-year vulnerability forecast key figures</title>
  <desc id="description">The 2026 forecast is 66,000 CVEs. Actual disclosures through April ran 46.3 percent above February projections. GitHub Security Advisories rose 449 percent year over year, VulnCheck CNA-of-Last-Resort activity rose 3,119 percent, and Mozilla CNA disclosures rose 164 percent in the first quarter.</desc>
  <style>
    text { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
    .background { fill: #0b0d12; }
    .box { fill: none; stroke: #29313b; stroke-width: 2; }
    .heading { fill: #f2f4f6; font-size: 21px; font-weight: 700; letter-spacing: .035em; }
    .number { fill: #37e6d0; font-size: 48px; font-weight: 700; letter-spacing: -.035em; }
    .pink { fill: #ff4f9a; }
    .label { fill: #aab1ba; font-size: 14px; }
    .note { fill: #77808c; font-size: 12px; }
  </style>
  <rect class="background" width="100%" height="100%"/>
  <text x="52" y="48" class="heading">2026 VULNERABILITY SURGE</text>
  <rect x="52" y="82" width="442" height="178" class="box"/>
  <text x="78" y="154" class="number">66,000</text>
  <text x="78" y="190" class="label">FULL-YEAR CVE FORECAST</text>
  <text x="78" y="225" class="note">UP FROM 59,427 IN FEBRUARY</text>
  <rect x="514" y="82" width="474" height="178" class="box"/>
  <text x="540" y="154" class="number pink">+46.3%</text>
  <text x="540" y="190" class="label">ACTUAL DISCLOSURES VS FEB. PROJECTION</text>
  <text x="540" y="225" class="note">CUMULATIVE DRIFT THROUGH APRIL 2026</text>
  <rect x="52" y="280" width="296" height="218" class="box"/>
  <text x="78" y="359" class="number">+449%</text>
  <text x="78" y="397" class="label">GITHUB SECURITY</text>
  <text x="78" y="419" class="label">ADVISORIES</text>
  <text x="78" y="463" class="note">YEAR OVER YEAR</text>
  <rect x="368" y="280" width="304" height="218" class="box"/>
  <text x="394" y="359" class="number">+3,119%</text>
  <text x="394" y="397" class="label">VULNCHECK CNA</text>
  <text x="394" y="419" class="label">OF LAST RESORT</text>
  <text x="394" y="463" class="note">ACTIVITY INCREASE</text>
  <rect x="692" y="280" width="296" height="218" class="box"/>
  <text x="718" y="359" class="number">+164%</text>
  <text x="718" y="397" class="label">MOZILLA CNA</text>
  <text x="718" y="419" class="label">DISCLOSURES</text>
  <text x="718" y="463" class="note">Q1 2026</text>
  <text x="52" y="544" class="note">SOURCE: FIRST · MID-YEAR VULNERABILITY FORECAST · 15 JUNE 2026</text>
</svg>
'''


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    (OUTPUT / "monthly-high-critical-cves.svg").write_text(chart(), encoding="utf-8")
    (OUTPUT / "first-2026-key-figures.svg").write_text(first_data_card(), encoding="utf-8")


if __name__ == "__main__":
    main()
