"""real/14_dashboard_data.py — export REAL state data to the dashboard."""
import json, os, shutil
import pandas as pd, numpy as np

os.makedirs("docs/assets",exist_ok=True); os.makedirs("docs/figures",exist_ok=True)
comb=pd.read_csv("real/sti_state_1529.csv",dtype={"fips":str})
comb["fips"]=comb.fips.str.zfill(2)
R=json.load(open("outputs/real_results.json"))
T1=pd.read_csv("tables/R1_national_regional_1529.csv")
DIS=["Chlamydia","Gonorrhea","P&S Syphilis"]; REGIONS=["National","Northeast","Midwest","South","West"]
YEARS=sorted(comb.year.unique().tolist())
NAT={r["disease"]:r for r in R["national"]}; SPAT={r["disease"]:r for r in R["spatial"]}

trends={}
for d in DIS:
    s=T1[T1.disease==d].sort_values("year"); trends[d]={"years":s.year.tolist()}
    for rg in REGIONS: trends[d][rg]=[round(float(v),1) for v in s[rg]]

kpis={"year_range":f"{YEARS[0]}\u2013{YEARS[-1]}","n_states":int(comb.fips.nunique()),
      "by_disease":{d:{"pct_change":NAT[d]["pct_change"],"apc":NAT[d]["apc"],
        "rate_2013":NAT[d]["rate_2013"],"rate_2023":NAT[d]["rate_2023"],
        "peak_year":int(NAT[d]["peak_year"]),"cases_2023":int(NAT[d]["cases_2023"]),
        "moran_I":SPAT[d]["morans_I"],"moran_p":SPAT[d]["p"],"hot":int(SPAT[d]["hot"])} for d in DIS}}

top_states={d:[{"state":r["state"],"abbr":r["state_abbr"],"region":r["region"],
                "rate":r["rate"],"apc":r["apc"]} for r in R["top_states"][d]] for d in DIS}
fastest=[{"state":r["state"],"abbr":r["state_abbr"],"region":r["region"],"apc":r["mean_apc"]}
         for r in R["fastest_rising"]]

DASH={"provenance":"Source: CDC NCHHSTP AtlasPlus, state-level surveillance, persons aged "
      "15\u201329, 2013\u20132023. Rates are cases per 100,000. County-level data for this age "
      "group are suppressed by CDC, so analysis is at the state level.",
      "diseases":DIS,"years":YEARS,"regions":REGIONS,"kpis":kpis,"trends":trends,
      "topStates":top_states,"fastest":fastest}
open("docs/assets/data.js","w").write("window.DASH = "+json.dumps(DASH,indent=2)+";\n")

rates={d:{} for d in DIS}
for d in DIS:
    sub=comb[comb.disease==d]
    for y in YEARS:
        sy=sub[sub.year==y].dropna(subset=["rate"])
        rates[d][str(y)]={r.fips:round(float(r.rate),1) for r in sy.itertuples()}
json.dump(rates,open("docs/assets/state_rates.json","w"),separators=(",",":"))

shutil.copy("real/states.geojson","docs/assets/states.geojson")
for fn in os.listdir("figures"):
    if fn.startswith("real_") and fn.endswith(".png"):
        shutil.copy(f"figures/{fn}",f"docs/figures/{fn}")
print("dashboard assets rebuilt (real, state-level):",
      "states",kpis["n_states"],"| rates size",
      round(os.path.getsize('docs/assets/state_rates.json')/1e3,1),"KB")
