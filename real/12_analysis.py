"""
real/12_analysis.py — REAL state-level analysis, ages 15-29, 2013-2023.
Outputs figures/ (real_*), tables/ (R1..R6), outputs/real_results.json
"""
import json, warnings
import numpy as np, pandas as pd, geopandas as gpd
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from libpysal.weights import KNN
from esda.moran import Moran
from esda.getisord import G_Local
warnings.filterwarnings("ignore")
plt.rcParams.update({"figure.dpi":130,"font.size":9,"axes.titlesize":11,"axes.titleweight":"bold"})

DIS=["Chlamydia","Gonorrhea","P&S Syphilis"]
REG=["Northeast","Midwest","South","West"]
Y0,Y1=2013,2023
RES={}

comb=pd.read_csv("real/sti_state_1529.csv",dtype={"fips":str})
byage=pd.read_csv("real/sti_state_byage.csv",dtype={"fips":str})
gdf=gpd.read_file("real/states.geojson")[["fips","geometry"]]
gdf["fips"]=gdf["fips"].str.zfill(2)
gdf=gdf[gdf.fips.isin(comb.fips.unique())].to_crs(5070)

def wmean(g):
    v=g.dropna(subset=["rate"])
    return np.average(v.rate,weights=v.population) if len(v) else np.nan

# ---------- T: national & regional trends (15-29) ----------
rows=[]
for d in DIS:
    dd=comb[comb.disease==d]
    for y in range(Y0,Y1+1):
        dy=dd[dd.year==y]
        r={"disease":d,"year":y,"National":wmean(dy)}
        for rg in REG: r[rg]=wmean(dy[dy.region==rg])
        rows.append(r)
T1=pd.DataFrame(rows); T1.to_csv("tables/R1_national_regional_1529.csv",index=False)

# ---------- national totals & APC ----------
def apc(series_year,series_rate):
    b=np.polyfit(series_year,np.log(series_rate),1)[0]
    return (np.exp(b)-1)*100
natrows=[]; 
for d in DIS:
    dd=comb[comb.disease==d].groupby("year").apply(
        lambda g:pd.Series({"cases":g.cases.sum(),"pop":g.population.sum()}),include_groups=False)
    dd["rate"]=dd.cases/dd["pop"]*1e5
    a=apc(dd.index.values,dd.rate.values)
    natrows.append({"disease":d,"rate_2013":round(dd.rate.loc[Y0],1),
        "rate_2023":round(dd.rate.loc[Y1],1),
        "peak_year":int(dd.rate.idxmax()),"peak_rate":round(dd.rate.max(),1),
        "pct_change":round((dd.rate.loc[Y1]/dd.rate.loc[Y0]-1)*100,1),
        "apc":round(a,1),"cases_2023":int(dd.cases.loc[Y1])})
NAT=pd.DataFrame(natrows); NAT.to_csv("tables/R2_national_change_apc.csv",index=False)
RES["national"]=NAT.to_dict("records")

# ---------- by age group (national) ----------
agerows=[]
for d in DIS:
    for ag in ["15-19","20-24","25-29"]:
        s=byage[(byage.disease==d)&(byage.age_group==ag)].groupby("year").apply(
            lambda g:g.cases.sum()/g.population.sum()*1e5,include_groups=False)
        agerows.append({"disease":d,"age_group":ag,"rate_2013":round(s.loc[Y0],1),
            "rate_2023":round(s.loc[Y1],1),"apc":round(apc(s.index.values,s.values),1)})
AGE=pd.DataFrame(agerows); AGE.to_csv("tables/R3_by_age_group.csv",index=False)
RES["by_age"]=AGE.to_dict("records")

# ---------- per-state APC + 2023 rate ----------
def state_apc(d):
    out={}
    dd=comb[(comb.disease==d)].dropna(subset=["rate"])
    for f,g in dd.groupby("fips"):
        if g.year.nunique()>=6 and (g.rate>0).all():
            out[f]=apc(g.year.values,g.rate.values)
    return pd.Series(out)
state_apcs={d:state_apc(d) for d in DIS}

# ---------- spatial: Moran's I + Gi* on 2023 rates ----------
coords=np.array([(g.centroid.x,g.centroid.y) for g in gdf.geometry])
w=KNN.from_array(coords,k=4); w.transform="r"
spat=[]; gi_frames={}
for d in DIS:
    d23=comb[(comb.disease==d)&(comb.year==Y1)][["fips","rate"]]
    m=gdf.merge(d23,on="fips",how="left"); m["rate"]=m["rate"].fillna(m["rate"].median())
    y=m["rate"].values
    mi=Moran(y,w,permutations=999)
    gi=G_Local(y,w,transform="R",star=True,permutations=999)
    z,p=gi.Zs,gi.p_sim
    cat=np.full(len(y),"ns",dtype=object)
    cat[(z>0)&(p<=0.05)]="Hot"; cat[(z<0)&(p<=0.05)]="Cold"
    m["gi"]=cat; gi_frames[d]=m
    spat.append({"disease":d,"morans_I":round(mi.I,3),"p":mi.p_sim,
        "hot":int((cat=="Hot").sum()),"cold":int((cat=="Cold").sum())})
SPAT=pd.DataFrame(spat); SPAT.to_csv("tables/R4_spatial.csv",index=False)
RES["spatial"]=SPAT.to_dict("records")

# ---------- rankings ----------
rank={}
for d in DIS:
    d23=comb[(comb.disease==d)&(comb.year==Y1)].dropna(subset=["rate"])
    top=d23.nlargest(10,"rate")[["state","state_abbr","region","rate"]]
    top["apc"]=top.fips if False else [round(state_apcs[d].get(f,np.nan),1) for f in d23.nlargest(10,"rate").fips]
    rank[d]=top.round(1).to_dict("records")
    # fastest rising
RES["top_states"]=rank
# fastest-rising (by APC, combined mean across diseases)
apc_df=pd.DataFrame(state_apcs); apc_df["mean_apc"]=apc_df.mean(axis=1)
meta=comb.drop_duplicates("fips").set_index("fips")[["state","state_abbr","region"]]
rising=apc_df.join(meta).dropna(subset=["mean_apc"]).sort_values("mean_apc",ascending=False)
rising.head(10).round(1).to_csv("tables/R5_fastest_rising_states.csv")
RES["fastest_rising"]=rising.head(10).reset_index()[["state","state_abbr","region","mean_apc"]].round(1).to_dict("records")

# ================= FIGURES =================
RC={"National":"#111","South":"#d7191c","West":"#fdae61","Midwest":"#2c7bb6","Northeast":"#7b3294"}
def fig_trends():
    fig,ax=plt.subplots(1,3,figsize=(14,4))
    for a,d in zip(ax,DIS):
        dd=T1[T1.disease==d]
        for col in ["National","South","West","Midwest","Northeast"]:
            a.plot(dd.year,dd[col],marker="o",ms=3,lw=2 if col=="National" else 1.2,
                   color=RC[col],label=col)
        a.set_title(d); a.grid(alpha=.3); a.set_xlabel("Year")
        if d==DIS[0]: a.set_ylabel("Rate / 100,000"); a.legend(fontsize=7)
    fig.suptitle("STI rates among persons aged 15–29 by U.S. Census region, 2013–2023 (CDC AtlasPlus)",
                 fontsize=12,fontweight="bold")
    fig.tight_layout(); fig.savefig("figures/real_trends_region.png",bbox_inches="tight"); plt.close()
def fig_age():
    fig,ax=plt.subplots(1,3,figsize=(14,4))
    for a,d in zip(ax,DIS):
        for ag,c in zip(["15-19","20-24","25-29"],["#4575b4","#f46d43","#8c510a"]):
            s=byage[(byage.disease==d)&(byage.age_group==ag)].groupby("year").apply(
                lambda g:g.cases.sum()/g.population.sum()*1e5,include_groups=False)
            a.plot(s.index,s.values,marker="o",ms=3,label=ag,color=c)
        a.set_title(d); a.grid(alpha=.3); a.set_xlabel("Year")
        if d==DIS[0]: a.set_ylabel("Rate / 100,000"); a.legend(title="Age",fontsize=8)
    fig.suptitle("STI rates by age group, 2013–2023 (CDC AtlasPlus)",fontsize=12,fontweight="bold")
    fig.tight_layout(); fig.savefig("figures/real_trends_age.png",bbox_inches="tight"); plt.close()
def fig_choro():
    for d in DIS:
        fig,ax=plt.subplots(1,2,figsize=(12,4.2))
        for a,y in zip(ax,[Y0,Y1]):
            dd=comb[(comb.disease==d)&(comb.year==y)][["fips","rate"]]
            m=gdf.merge(dd,on="fips",how="left")
            m.plot(column="rate",ax=a,cmap="YlOrRd",scheme="quantiles",k=5,legend=True,
                   edgecolor="0.5",linewidth=.3,
                   legend_kwds={"fontsize":6,"loc":"lower left","title":"Rate/100k","title_fontsize":6})
            a.set_title(f"{d} — {y}"); a.axis("off")
        fig.suptitle(f"State rate per 100,000, ages 15–29 — {d}",fontsize=11,fontweight="bold")
        fig.tight_layout()
        fig.savefig(f"figures/real_choropleth_{d.replace(' ','_').replace('&','and')}.png",bbox_inches="tight"); plt.close()
def fig_apc_map():
    fig,ax=plt.subplots(1,3,figsize=(15,4))
    for a,d in zip(ax,DIS):
        s=state_apcs[d].rename("apc").reset_index(); s.columns=["fips","apc"]
        m=gdf.merge(s,on="fips",how="left"); vmax=np.nanpercentile(np.abs(m.apc),95)
        m.plot(column="apc",ax=a,cmap="RdBu_r",vmin=-vmax,vmax=vmax,legend=True,
               edgecolor="0.5",linewidth=.3,legend_kwds={"label":"APC %/yr","shrink":.6})
        a.set_title(f"{d}\nannual % change 2013–2023"); a.axis("off")
    fig.suptitle("State-level trend in STI rates among persons aged 15–29",fontsize=12,fontweight="bold")
    fig.tight_layout(); fig.savefig("figures/real_apc_map.png",bbox_inches="tight"); plt.close()
fig_trends(); fig_age(); fig_choro(); fig_apc_map()

json.dump(RES,open("outputs/real_results.json","w"),indent=2,default=float)
print("NATIONAL (real):"); print(NAT.to_string(index=False))
print("\nBY AGE (real):"); print(AGE.to_string(index=False))
print("\nSPATIAL (real):"); print(SPAT.to_string(index=False))
print("\nfigures/ and tables/ (R1-R5) + outputs/real_results.json written")
