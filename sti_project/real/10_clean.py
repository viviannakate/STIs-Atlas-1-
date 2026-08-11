"""
real/10_clean.py — parse the real CDC AtlasPlus export into tidy datasets.

Input : real/atlas_raw.csv  (state-level; ages 15-19, 20-24, 25-29)
Output: real/sti_state_byage.csv   (state x year x disease x age band)
        real/sti_state_1529.csv     (state x year x disease, ages combined to 15-29)

Denominators: AtlasPlus gives rate per 100,000 but not population. The age-band
population for a given state-year is identical across diseases, so we recover it
from chlamydia (counts are high and non-zero everywhere): pop = cases/rate*1e5.
Combined 15-29 rate = (sum cases) / (sum pop) * 1e5.
"""
import pandas as pd, numpy as np

STATE_FIPS_TO_ABBR = {
 "01":"AL","02":"AK","04":"AZ","05":"AR","06":"CA","08":"CO","09":"CT","10":"DE",
 "11":"DC","12":"FL","13":"GA","15":"HI","16":"ID","17":"IL","18":"IN","19":"IA",
 "20":"KS","21":"KY","22":"LA","23":"ME","24":"MD","25":"MA","26":"MI","27":"MN",
 "28":"MS","29":"MO","30":"MT","31":"NE","32":"NV","33":"NH","34":"NJ","35":"NM",
 "36":"NY","37":"NC","38":"ND","39":"OH","40":"OK","41":"OR","42":"PA","44":"RI",
 "45":"SC","46":"SD","47":"TN","48":"TX","49":"UT","50":"VT","51":"VA","53":"WA",
 "54":"WV","55":"WI","56":"WY"}
NORTHEAST={"09","23","25","33","44","50","34","36","42"}
MIDWEST={"17","18","26","39","55","19","20","27","29","31","38","46"}
SOUTH={"10","11","12","13","24","37","45","51","54","01","21","28","47","05","22","40","48"}
WEST={"04","08","16","30","32","35","49","56","02","06","15","41","53"}
def region(f):
    return ("Northeast" if f in NORTHEAST else "Midwest" if f in MIDWEST
            else "South" if f in SOUTH else "West" if f in WEST else "Other")
DISH={"Chlamydia":"Chlamydia","Gonorrhea":"Gonorrhea",
      "Primary and Secondary Syphilis":"P&S Syphilis"}

raw=open("real/atlas_raw.csv",encoding="utf-8-sig").read().splitlines()
hdr=[i for i,l in enumerate(raw) if l.startswith("Indicator,Year")][0]
df=pd.read_csv("real/atlas_raw.csv",skiprows=hdr,dtype=str)
df=df.dropna(subset=["Indicator","Year","Geography","Age Group"]).copy()

df["disease"]=df.Indicator.map(DISH)
df["year"]=df.Year.str.extract(r"(\d{4})").astype(int)
df["fips"]=df.FIPS.str.zfill(2)
df["state_abbr"]=df.fips.map(STATE_FIPS_TO_ABBR)
df["region"]=df.fips.map(region)
df["age_group"]=df["Age Group"]
df["cases"]=pd.to_numeric(df.Cases.str.replace(",",""),errors="coerce")
df["rate"]=pd.to_numeric(df["Rate per 100000"],errors="coerce")
df=df.rename(columns={"Geography":"state"})
df=df[["fips","state","state_abbr","region","year","disease","age_group","cases","rate"]]

# ---- recover age-band population from chlamydia (rate>0 everywhere) ----
chl=df[(df.disease=="Chlamydia")&(df.rate>0)].copy()
chl["pop"]=(chl.cases/chl.rate*1e5).round().astype("Int64")
popmap=chl.set_index(["fips","year","age_group"])["pop"]
df["population"]=df.set_index(["fips","year","age_group"]).index.map(popmap)
# fallback: derive from own row where possible
mask=df.population.isna()&(df.rate>0)
df.loc[mask,"population"]=(df.loc[mask,"cases"]/df.loc[mask,"rate"]*1e5).round()
df["population"]=pd.to_numeric(df["population"],errors="coerce")

df.to_csv("real/sti_state_byage.csv",index=False)
print("byage rows:",len(df),"| states:",df.fips.nunique(),
      "| years:",df.year.min(),"-",df.year.max())

# ---- complete the grid (fill missing disease/age cells as 0 cases) ----
full=(df.groupby(["fips","state","state_abbr","region","year","disease","age_group"])
        .agg(cases=("cases","first"),population=("population","first")).reset_index())

# ---- combine ages -> 15-29 ----
def wsum(g):
    cases=g.cases.sum(min_count=1)
    pop=g.population.sum(min_count=1)
    rate=cases/pop*1e5 if (pop and pop>0) else np.nan
    return pd.Series({"cases":cases,"population":pop,"rate":round(rate,1) if rate==rate else np.nan})
comb=(df.groupby(["fips","state","state_abbr","region","year","disease"])
        .apply(wsum,include_groups=False).reset_index())
comb["age_group"]="15-29"
comb=comb[["fips","state","state_abbr","region","year","disease","age_group","cases","population","rate"]]
comb.to_csv("real/sti_state_1529.csv",index=False)
print("combined 15-29 rows:",len(comb))
# sanity: national pop-weighted rate by disease/year
nat=(comb.dropna(subset=["rate"]).groupby(["disease","year"])
     .apply(lambda g: np.average(g.rate,weights=g.population),include_groups=False)
     .unstack(0).round(0))
print("\nNational pop-weighted rate/100k, ages 15-29 (REAL DATA):")
print(nat.to_string())
