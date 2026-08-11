# STI Atlas — trends among persons aged 15–29 (United States, 2013–2023)

Interactive dashboard and reproducible analysis of chlamydia, gonorrhea, and primary &
secondary (P&S) syphilis among **persons aged 15–29** across all 50 U.S. states and the
District of Columbia, 2013–2023, using **real CDC NCHHSTP AtlasPlus** state-level data.

Dashboard: linkhttps://viviannakate.github.io/STIs-Atlas-1-/

[![Deploy dashboard to GitHub Pages](https://github.com/viviannakate/STIs-Atlas/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/viviannakate/STIs-Atlas/actions/workflows/deploy-pages.yml)
![License: MIT](https://img.shields.io/badge/license-MIT-black)

> **Data.** Source: CDC NCHHSTP AtlasPlus, state-level surveillance, ages 15–19/20–24/25–29
> (combined to 15–29), 2013–2023. CDC suppresses county-level rates for these age groups, so
> the analysis is at the **state** level. Rates are cases per 100,000.

## 🌐 The dashboard (`docs/`)

- **Interactive state choropleth** — pick an infection and year; hover any state.
- **KPI cards** — decade change, annual percent change (APC), 2023 case burden, Moran's I.
- **Regional trend chart** by U.S. Census region.
- **Maps & change** — 2013-vs-2023 choropleths, the APC map, and the age-band breakdown.
- **Rankings** — highest-burden states (2023) and fastest-rising states.

Chart libraries and the map base file are vendored in `docs/assets/vendor/`, so the site
works offline and needs no CDN.

## 📄 Key findings (real data)

- **Chlamydia** — the most common infection (~1.21M cases among 15–29 in 2023) but roughly flat over the decade (APC ≈ +0.3%), with a sharp 2020 dip.
- **Gonorrhea** — up ~39% (APC ≈ +5%/yr), peaking in 2021 then declining.
- **P&S syphilis** — up ~131% (APC ≈ +9.5%/yr), the steepest rise; highest in South Dakota.
- **Age shift** toward the 25–29 band; **fastest-rising** states in the Great Plains / Mountain West.

Full write-up: `outputs/STI_Trends_15-29_Paper.docx`.

## 🚀 Publish

1. Push to GitHub. 2. **Settings → Pages → Source: GitHub Actions.** The workflow deploys
`docs/` on every push; the site appears at `https://viviannakate.github.io/STIs-Atlas/`.

## 🔬 Reproduce

```bash
pip install -r requirements.txt
python real/10_clean.py            # parse + reshape the AtlasPlus export (ages -> 15-29)
python real/12_analysis.py         # trends, APC, choropleths, spatial, rankings
python real/14_dashboard_data.py   # refresh dashboard assets
node   real/13_paper.js            # rebuild the paper (.docx)
```

## 🗂 Repository map

```
.
├── docs/                       # GitHub Pages dashboard (state-level, real data)
├── real/
│   ├── atlas_raw.csv           # CDC AtlasPlus export (input)
│   ├── sti_state_1529.csv      # cleaned, ages combined to 15-29
│   ├── sti_state_byage.csv     # cleaned, by age band
│   ├── 10_clean.py · 12_analysis.py · 14_dashboard_data.py · 13_paper.js
│   └── states.geojson
├── figures/  real_*.png        # trend, choropleth, APC, age figures
├── tables/   R1..R5            # results tables (CSV)
├── outputs/  STI_Trends_15-29_Paper.docx · real_results.json
├── requirements.txt · LICENSE
└── .github/workflows/deploy-pages.yml
```

## Methods

Population-weighted state & regional rates · log-linear annual percent change (APC) ·
global Moran's I and Getis-Ord Gi* (kNN weights, 999 permutations) · ages 15–19 + 20–24 +
25–29 combined to 15–29. Age-band denominators recovered from reported chlamydia counts/rates.

## Data source

CDC NCHHSTP AtlasPlus — https://www.cdc.gov/nchhstp/about/atlasplus.html

## License

MIT — see `LICENSE`. Replace placeholder author fields before publishing.
