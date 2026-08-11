/* STI ATLAS — real state-level dashboard (CDC AtlasPlus, ages 15–29, 2013–2023) */
(function(){"use strict";
const D=window.DASH, DISEASES=D.diseases;
const RAMP=[[0,"#fde7a9"],[.25,"#f7c46c"],[.5,"#f19a4c"],[.75,"#e4572e"],[1,"#a31e22"]];
const $=(s,r=document)=>r.querySelector(s);
const pct=v=>(v>0?"+":"")+Number(v).toFixed(1)+"%";
const slug=d=>d.replace(/ /g,"_").replace(/&/g,"and");

$("#provText").textContent="Source — "+D.provenance;
$("#yearChip").textContent=D.kpis.year_range;

/* KPI cards */
(function(){const g=$("#kpiGrid");
 DISEASES.forEach(d=>{const k=D.kpis.by_disease[d],up=k.pct_change>=0;
  const el=document.createElement("div");el.className="card";
  el.innerHTML=`<div class="name">${d}</div><div class="big">${pct(k.pct_change)}</div>`+
   `<div class="delta ${up?"up":"down"}">${up?"▲":"▼"} 2013→2023 · APC ${k.apc>0?"+":""}${k.apc}%/yr</div>`+
   `<div class="row"><span>Rate 2013 → 2023</span><b>${k.rate_2013.toLocaleString()} → ${k.rate_2023.toLocaleString()}</b></div>`+
   `<div class="row"><span>2023 cases (15–29)</span><b>${k.cases_2023.toLocaleString()}</b></div>`+
   `<div class="row"><span>Peak year · Moran's I</span><b>${k.peak_year} · ${k.moran_I}</b></div>`;
  g.appendChild(el);});
 const s=document.createElement("div");s.className="summ";
 const cy=D.years[D.years.length-1];
 s.innerHTML=`<div class="card"><div class="name">Geographic coverage</div><div class="big">${D.kpis.n_states}</div>`+
   `<div class="row"><span>states + DC · ages 15–29</span><b>CDC AtlasPlus</b></div></div>`+
   `<div class="card blue"><div class="name">Study period</div><div class="big">${D.kpis.year_range}</div>`+
   `<div class="row"><span>latest surveillance year</span><b>${cy}</b></div></div>`;
 g.appendChild(s);})();

/* trend chart */
const RCOL={National:"#e8edf5",South:"#e4572e",West:"#f7c46c",Midwest:"#3e7cb1",Northeast:"#9b6bd0"};
let chart=null;
function trend(d){const t=D.trends[d];
 const ds=["National","South","West","Midwest","Northeast"].map(r=>({label:r,data:t[r],
  borderColor:RCOL[r],backgroundColor:RCOL[r],tension:.25,borderWidth:r==="National"?3:1.5,pointRadius:2,pointHoverRadius:4}));
 const cfg={type:"line",data:{labels:t.years,datasets:ds},options:{responsive:true,maintainAspectRatio:false,
  interaction:{mode:"index",intersect:false},
  plugins:{legend:{labels:{color:"#8fa1bd",font:{family:"IBM Plex Mono",size:11},usePointStyle:true}}},
  scales:{x:{grid:{color:"#1b2940"},ticks:{color:"#8fa1bd",font:{family:"IBM Plex Mono",size:10}}},
   y:{grid:{color:"#1b2940"},ticks:{color:"#8fa1bd",font:{family:"IBM Plex Mono",size:10}},
      title:{display:true,text:"rate / 100,000",color:"#54657f",font:{family:"IBM Plex Mono",size:10}}}}}};
 if(chart){chart.data=cfg.data;chart.update();}else chart=new Chart($("#trendChart"),cfg);}
(function(){const w=$("#trendTabs");DISEASES.forEach((d,i)=>{const b=document.createElement("button");
 b.textContent=d;b.setAttribute("role","tab");b.setAttribute("aria-selected",i===0);
 b.onclick=()=>{w.querySelectorAll("button").forEach(x=>x.setAttribute("aria-selected","false"));
  b.setAttribute("aria-selected","true");trend(d);};w.appendChild(b);});trend(DISEASES[0]);})();

/* gallery: per-disease choropleth + shared APC & age figures */
function gallery(d){$("#choImg").src=`figures/real_choropleth_${slug(d)}.png`;
 $("#choImg").alt=`${d} state choropleth 2013 vs 2023`;}
(function(){const w=$("#galleryTabs");DISEASES.forEach((d,i)=>{const b=document.createElement("button");
 b.textContent=d;b.setAttribute("role","tab");b.setAttribute("aria-selected",i===0);
 b.onclick=()=>{w.querySelectorAll("button").forEach(x=>x.setAttribute("aria-selected","false"));
  b.setAttribute("aria-selected","true");gallery(d);};w.appendChild(b);});gallery(DISEASES[0]);
 $("#apcImg").src="figures/real_apc_map.png"; $("#ageImg").src="figures/real_trends_age.png";})();

/* tables: highest-burden (2023) + fastest-rising states */
(function(){const tag=r=>`<span class="tag ${r==="South"?"south":""}">${r}</span>`;
 let dsel="Chlamydia";
 function fill(){$("#burdenBody").innerHTML=D.topStates[dsel].map(r=>
   `<tr><td>${r.state}</td><td>${tag(r.region)}</td><td class="n">${r.rate.toLocaleString()}</td><td class="n">${r.apc>0?"+":""}${r.apc}</td></tr>`).join("");}
 const w=$("#burdenTabs");DISEASES.forEach((d,i)=>{const b=document.createElement("button");
  b.textContent=d;b.setAttribute("aria-selected",i===0);
  b.onclick=()=>{w.querySelectorAll("button").forEach(x=>x.setAttribute("aria-selected","false"));
   b.setAttribute("aria-selected","true");dsel=d;fill();};w.appendChild(b);});fill();
 $("#risingBody").innerHTML=D.fastest.map(r=>
   `<tr><td>${r.state}</td><td>${tag(r.region)}</td><td class="n">+${r.apc}</td></tr>`).join("");})();

/* interactive state choropleth */
let GEO=null,RATES=null,mDis="Chlamydia",mYear=D.years[D.years.length-1],ready=false;
function draw(){if(!ready)return;const t=RATES[mDis][String(mYear)]||{};
 const loc=Object.keys(t),z=loc.map(f=>t[f]),s=z.slice().sort((a,b)=>a-b);
 Plotly.react("map",[{type:"choropleth",geojson:GEO,locations:loc,z,featureidkey:"properties.fips",
  colorscale:RAMP,zmin:0,zmax:s[Math.floor(s.length*.95)]||1,
  marker:{line:{width:.4,color:"rgba(255,255,255,.3)"}},
  colorbar:{title:{text:"rate/100k",font:{family:"IBM Plex Mono",size:10,color:"#8fa1bd"}},
   tickfont:{family:"IBM Plex Mono",size:9,color:"#8fa1bd"},thickness:9,len:.85,x:0.98,outlinewidth:0,bgcolor:"rgba(0,0,0,0)"},
  hovertemplate:"<b>%{location}</b><br>%{z:.0f} per 100k<extra></extra>"}],
  {geo:{projection:{type:"albers"},visible:false,lonaxis:{range:[-125,-66]},lataxis:{range:[24,50]},bgcolor:"rgba(0,0,0,0)",
   showland:false,showlakes:false,showcountries:false,showsubunits:false,showframe:false,showcoastlines:false,domain:{x:[0,1],y:[0,1]}},
   paper_bgcolor:"rgba(0,0,0,0)",margin:{t:0,b:0,l:0,r:0},dragmode:false},
  {displayModeBar:false,responsive:true});}
function init(){Promise.all([
  fetch("assets/states.geojson").then(r=>{if(!r.ok)throw 0;return r.json();}),
  fetch("assets/state_rates.json").then(r=>{if(!r.ok)throw 0;return r.json();})
 ]).then(([g,r])=>{GEO=g;RATES=r;ready=true;$("#map").innerHTML="";draw();})
 .catch(()=>{$("#mapMsg").innerHTML="The interactive map loads data over HTTP. On GitHub Pages it "+
   "appears automatically; opened directly from disk, the browser blocks the fetch. The maps in "+
   "section 03 work everywhere.";});}
$("#mapDisease").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;
 $("#mapDisease").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed","false"));
 b.setAttribute("aria-pressed","true");mDis=b.dataset.d;draw();});
$("#mapYear").addEventListener("input",e=>{mYear=+e.target.value;$("#mapYearVal").textContent=mYear;draw();});
if(window.Plotly){Plotly.setPlotConfig({topojsonURL:"assets/vendor/"});init();}
else $("#mapMsg").textContent="Map library failed to load. The rest of the dashboard works.";
})();
