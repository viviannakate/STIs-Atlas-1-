// real/13_paper.js — REAL paper: STI trends among persons aged 15–29, US, 2013–2023
const fs=require("fs");
const {Document,Packer,Paragraph,TextRun,HeadingLevel,AlignmentType,Table,TableRow,
 TableCell,WidthType,BorderStyle,ShadingType,ImageRun,PageBreak,Footer,PageNumber}=require("docx");
const R=JSON.parse(fs.readFileSync("outputs/real_results.json","utf8"));
const NAT={};R.national.forEach(x=>NAT[x.disease]=x);
const SP={};R.spatial.forEach(x=>SP[x.disease]=x);
const n=x=>Number(x).toLocaleString(undefined,{maximumFractionDigits:1});
const ASPECT={"real_trends_region.png":0.26,"real_trends_age.png":0.26,
 "real_choropleth_PandS_Syphilis.png":0.35,"real_choropleth_Gonorrhea.png":0.35,"real_apc_map.png":0.26};
const F="Calibri";
function run(t,o={}){return new TextRun({text:t,font:F,size:o.size??22,bold:o.bold,italics:o.italics,color:o.color});}
function P(t,o={}){return new Paragraph({children:Array.isArray(t)?t:[run(t,o)],alignment:o.align??AlignmentType.JUSTIFIED,spacing:{after:o.after??140,line:o.line??276},heading:o.heading,pageBreakBefore:o.pbb});}
function H1(t){return new Paragraph({heading:HeadingLevel.HEADING_1,spacing:{before:260,after:120},children:[run(t,{bold:true,size:28,color:"1F3864"})]});}
function H2(t){return new Paragraph({heading:HeadingLevel.HEADING_2,spacing:{before:180,after:100},children:[run(t,{bold:true,size:24,color:"2E5496"})]});}
function img(f,w=580){const h=Math.round((ASPECT[f]??.3)*w);return new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:120,after:50},children:[new ImageRun({type:"png",data:fs.readFileSync("figures/"+f),transformation:{width:w,height:h}})]});}
function cap(t){return new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:180},children:[run(t,{italics:true,size:18})]});}
function cell(t,{b=false,sh=null,w,al=AlignmentType.LEFT}={}){return new TableCell({width:{size:w,type:WidthType.DXA},shading:sh?{type:ShadingType.CLEAR,fill:sh}:undefined,margins:{top:40,bottom:40,left:80,right:80},children:[new Paragraph({alignment:al,spacing:{after:0},children:[run(String(t),{size:18,bold:b})]})]});}
function table(head,rows,w){const hr=new TableRow({tableHeader:true,children:head.map((h,i)=>new TableCell({width:{size:w[i],type:WidthType.DXA},shading:{type:ShadingType.CLEAR,fill:"1F3864"},margins:{top:40,bottom:40,left:80,right:80},children:[new Paragraph({alignment:i===0?AlignmentType.LEFT:AlignmentType.CENTER,children:[run(h,{bold:true,color:"FFFFFF",size:18})]})]}))});
 const tr=rows.map((r,ri)=>new TableRow({children:r.map((c,i)=>cell(c,{w:w[i],sh:ri%2?"EEF1F7":"FFFFFF",al:i===0?AlignmentType.LEFT:AlignmentType.CENTER}))}));
 return new Table({columnWidths:w,width:{size:w.reduce((a,b)=>a+b),type:WidthType.DXA},rows:[hr,...tr]});}
function tcap(t){return new Paragraph({spacing:{before:160,after:50},children:[run(t,{italics:true,bold:true,size:18})]});}

const K=[];
K.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:80},children:[run(
 "Divergent Trends in Chlamydia, Gonorrhea, and Primary & Secondary Syphilis Among Persons "
 +"Aged 15–29 in the United States, 2013–2023: A State-Level Surveillance Analysis",{bold:true,size:30})]}));
K.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:40},children:[run("[Author One], [Author Two], [Author Three]",{size:20})]}));
K.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[run("[Department / Institution] · Corresponding author: [email]",{italics:true,size:17})]}));

K.push(H1("Abstract"));
const chl=NAT["Chlamydia"],gon=NAT["Gonorrhea"],syp=NAT["P&S Syphilis"];
[["Background. ","Adolescents and young adults bear a disproportionate share of sexually transmitted infections (STIs). We characterized national, regional, age-specific, and state-level trends in chlamydia, gonorrhea, and primary & secondary (P&S) syphilis among persons aged 15–29 over 2013–2023."],
 ["Methods. ",`Using state-level counts and rates from CDC's NCHHSTP AtlasPlus for persons aged 15–19, 20–24, and 25–29 (combined to 15–29), we computed population-weighted national and U.S. Census-region rates, log-linear annual percent change (APC), and between-state spatial autocorrelation (global Moran's I, k-nearest-neighbour weights, 999 permutations) across all 50 states and the District of Columbia.`],
 ["Results. ",`Chlamydia remained the most common infection but was essentially flat over the decade (${n(chl.rate_2013)} to ${n(chl.rate_2023)} per 100,000; APC ${chl.apc>0?"+":""}${chl.apc}%), peaking in ${chl.peak_year} before a 2020 decline. Gonorrhea rose ${n(gon.pct_change)}% (APC +${gon.apc}%), peaking in ${gon.peak_year} then declining. P&S syphilis rose most steeply, by ${n(syp.pct_change)}% (APC +${syp.apc}%). Increases were steepest in the 25–29 age band, and burden and growth concentrated in the South and, for syphilis, the Great Plains/Mountain West. All three infections showed significant between-state clustering in 2023.`],
 ["Conclusions. ",`Among young people, the STI epidemic over 2013–2023 was one of divergence: a chlamydia plateau alongside steep, geographically concentrated rises in gonorrhea and especially syphilis, shifting toward older youth. Findings support age- and place-targeted screening and syphilis-in-pregnancy prevention.`],
].forEach(([b,t])=>K.push(new Paragraph({spacing:{after:120,line:276},children:[run(b,{bold:true}),run(t)]})));
K.push(new Paragraph({spacing:{after:180},children:[run("Keywords: ",{bold:true}),run("sexually transmitted infections; adolescents and young adults; chlamydia; gonorrhea; syphilis; surveillance; trends; spatial epidemiology.")]}));

K.push(H1("1. Introduction"));
K.push(P("Sexually transmitted infections remain a major public-health challenge in the United States, and their burden is concentrated among adolescents and young adults, who acquire a large share of new infections each year. This concentration reflects biological susceptibility, sexual-network structure, and unequal access to screening and care. The three reportable bacterial STIs—chlamydia, gonorrhea, and syphilis—are curable but carry serious sequelae when untreated, including pelvic inflammatory disease, infertility, enhanced HIV transmission, and, for syphilis in pregnancy, congenital infection and stillbirth."));
K.push(P("Over the past decade national reports have described rising gonorrhea and syphilis and a sharp increase in congenital syphilis, with the most recent provisional data suggesting an emerging downturn in some infections. Yet national totals combine heterogeneous age groups and geographies. A focused analysis of persons aged 15–29—disaggregated by single infection, by narrower age band, and by state—clarifies which infections are driving the epidemic among young people, in whom, and where. We therefore analyzed CDC AtlasPlus surveillance data to characterize trends in chlamydia, gonorrhea, and P&S syphilis among persons aged 15–29 across all states, 2013–2023."));

K.push(H1("2. Methods"));
K.push(H2("2.1 Data source and population"));
K.push(P("We obtained state-level annual case counts and rates per 100,000 for chlamydia, gonorrhea, and P&S syphilis for persons aged 15–19, 20–24, and 25–29 from CDC's NCHHSTP AtlasPlus, for all 50 states and the District of Columbia, 2013–2023 (all races/ethnicities, both sexes). Because AtlasPlus does not release county-level rates for these age groups (small-count suppression), the state was the geographic unit."));
K.push(H2("2.2 Measures"));
K.push(P("Age-band populations, which are identical across infections for a given state-year, were recovered from the chlamydia count and rate (population = cases ÷ rate × 100,000) and used to combine the three bands into a 15–29 group and to compute population-weighted national and regional (U.S. Census region) rates. Temporal change was summarized as the annual percent change (APC) from a log-linear regression of the rate on calendar year, APC = (exp(β) − 1) × 100."));
K.push(H2("2.3 Spatial analysis"));
K.push(P("Between-state spatial clustering of 2023 rates was assessed with the global Moran's I using row-standardized k-nearest-neighbour weights (k = 4) and 999 conditional permutations; the Getis-Ord Gi* statistic identified high- and low-rate states. Analyses used Python (pandas, GeoPandas, libpysal, esda). The pipeline is deterministic and openly available; results and code accompany an interactive dashboard."));

K.push(H1("3. Results"));
K.push(H2("3.1 National trends by infection"));
K.push(P(`In 2023, among persons aged 15–29, there were approximately ${n(chl.cases_2023)} chlamydia, ${n(gon.cases_2023)} gonorrhea, and ${n(syp.cases_2023)} P&S syphilis cases nationally. Chlamydia was by far the most common but changed little over the decade (${n(chl.rate_2013)} to ${n(chl.rate_2023)} per 100,000; APC ${chl.apc>0?"+":""}${chl.apc}%), rising to a ${chl.peak_year} peak before a marked 2020 decline coincident with pandemic-related disruptions to testing, followed by partial recovery. Gonorrhea increased ${n(gon.pct_change)}% (APC +${gon.apc}%), peaking in ${gon.peak_year} (${n(gon.peak_rate)} per 100,000) before declining through 2023. P&S syphilis showed the steepest rise, ${n(syp.pct_change)}% (APC +${syp.apc}%), peaking in ${syp.peak_year} (Figure 1; Table 1).`));
K.push(img("real_trends_region.png",600));
K.push(cap("Figure 1. Population-weighted rate per 100,000 among persons aged 15–29 by U.S. Census region, 2013–2023, for each infection (CDC AtlasPlus)."));
K.push(tcap("Table 1. National change and annual percent change (APC) among persons aged 15–29, 2013–2023."));
K.push(table(["Infection","2013","2023","Peak (year)","% change","APC %/yr","2023 cases"],
 [["Chlamydia",n(chl.rate_2013),n(chl.rate_2023),`${n(chl.peak_rate)} (${chl.peak_year})`,n(chl.pct_change)+"%",(chl.apc>0?"+":"")+chl.apc,n(chl.cases_2023)],
  ["Gonorrhea",n(gon.rate_2013),n(gon.rate_2023),`${n(gon.peak_rate)} (${gon.peak_year})`,n(gon.pct_change)+"%","+"+gon.apc,n(gon.cases_2023)],
  ["P&S syphilis",n(syp.rate_2013),n(syp.rate_2023),`${n(syp.peak_rate)} (${syp.peak_year})`,n(syp.pct_change)+"%","+"+syp.apc,n(syp.cases_2023)]],
 [1900,1000,1000,1500,1200,1180,1580]));

K.push(H2("3.2 Age-specific trends"));
K.push(P("Disaggregation by age band revealed a shift in burden toward older youth. For chlamydia, rates declined among 15–19-year-olds while rising among 25–29-year-olds. For gonorrhea and, most strikingly, syphilis, the steepest increases occurred in the 25–29 band (Figure 2; Table 2)."));
K.push(img("real_trends_age.png",600));
K.push(cap("Figure 2. Rate per 100,000 by age band (15–19, 20–24, 25–29), 2013–2023, for each infection."));
K.push(tcap("Table 2. Annual percent change (APC) by age band, 2013–2023."));
K.push(table(["Infection","15–19","20–24","25–29"],
 (function(){const by={};R.by_age.forEach(r=>{by[r.disease]=by[r.disease]||{};by[r.disease][r.age_group]=r.apc;});
  return [["Chlamydia",by.Chlamydia["15-19"],by.Chlamydia["20-24"],by.Chlamydia["25-29"]],
   ["Gonorrhea",by.Gonorrhea["15-19"],by.Gonorrhea["20-24"],by.Gonorrhea["25-29"]],
   ["P&S syphilis",by["P&S Syphilis"]["15-19"],by["P&S Syphilis"]["20-24"],by["P&S Syphilis"]["25-29"]]]
   .map(r=>r.map((v,i)=>i===0?v:(v>0?"+":"")+v+"%"));})(),
 [2600,2253,2253,2254]));

K.push(H2("3.3 Geographic distribution and change"));
K.push(P(`Burden was geographically concentrated. In 2023 the highest chlamydia and gonorrhea rates were in the District of Columbia, Louisiana, and Mississippi, and the highest P&S syphilis rates were in South Dakota (notably elevated), Mississippi, and Louisiana (Table 3). The steepest decade increases (mean APC across infections) occurred in the Great Plains and Mountain West—Montana, South Dakota, and Alaska led—signaling diffusion beyond the traditional southern core (Figure 3).`));
K.push(img("real_apc_map.png",600));
K.push(cap("Figure 3. State-level annual percent change in rates among persons aged 15–29, 2013–2023, by infection. Red = increasing, blue = decreasing."));
K.push(tcap("Table 3. States with the highest 2023 rate per 100,000 (ages 15–29), by infection (top 5)."));
K.push(table(["Rank","Chlamydia","Gonorrhea","P&S syphilis"],
 [0,1,2,3,4].map(i=>[String(i+1),
   `${R.top_states["Chlamydia"][i].state} (${n(R.top_states["Chlamydia"][i].rate)})`,
   `${R.top_states["Gonorrhea"][i].state} (${n(R.top_states["Gonorrhea"][i].rate)})`,
   `${R.top_states["P&S Syphilis"][i].state} (${n(R.top_states["P&S Syphilis"][i].rate)})`]),
 [900,2820,2820,2820]));

K.push(H2("3.4 Spatial clustering"));
K.push(P(`Rates were spatially clustered rather than randomly distributed across states in 2023: global Moran's I was ${SP["Chlamydia"].morans_I} for chlamydia (p=${SP["Chlamydia"].p}) and ${SP["Gonorrhea"].morans_I} for gonorrhea (p=${SP["Gonorrhea"].p}), with weaker but still significant clustering for P&S syphilis (${SP["P&S Syphilis"].morans_I}, p=${SP["P&S Syphilis"].p}). Getis-Ord Gi* localized high-rate clusters in the South for chlamydia and gonorrhea.`));

K.push(H1("4. Discussion"));
K.push(P("Among persons aged 15–29 over 2013–2023, the STI epidemic was one of divergence. Chlamydia—still the most common infection, with over a million cases annually in this age group—plateaued, whereas gonorrhea and, most steeply, P&S syphilis rose substantially before beginning to turn in the most recent years. The pronounced 2020 chlamydia decline is best interpreted as reduced screening during the COVID-19 pandemic rather than a true fall in incidence, given the rebound thereafter and the asymptomatic nature of most chlamydial infection."));
K.push(P("Two patterns have clear programmatic implications. First, the burden shifted toward the 25–29 band, with the fastest increases—especially for syphilis—in this slightly older group; screening strategies focused narrowly on teenagers may miss where growth is now concentrated. Second, geography mattered: chronic burden persisted in the South and in the District of Columbia, while the steepest increases emerged in the Great Plains and Mountain West, consistent with documented syphilis outbreaks in those regions and among American Indian/Alaska Native communities. The very high South Dakota syphilis rate exemplifies this shift."));
K.push(P("These patterns are consistent with structural drivers—contraction of the STD-clinic safety net, uneven access to testing and partner services, and social determinants that cluster spatially—though this descriptive analysis cannot attribute causation. The significant between-state clustering supports place-based approaches, including geography-informed screening and targeted investment in high-burden and fast-rising states."));
K.push(H2("4.1 Limitations"));
K.push(P("Surveillance rates reflect testing and reporting intensity as well as true incidence, so cross-jurisdiction differences may partly reflect ascertainment. Analysis is ecological and at the state level—county-level heterogeneity is masked and individual-level inference is not supported (the modifiable areal unit problem and ecological fallacy). Age-band populations were derived from reported chlamydia counts and rates; the 2020 value is labeled a pandemic year by the data provider. Between-state spatial statistics are based on 51 units and should be interpreted as indicative."));
K.push(H1("5. Conclusions"));
K.push(P("Among young people in the United States, 2013–2023 saw a chlamydia plateau alongside steep, geographically shifting rises in gonorrhea and syphilis, with growth concentrated in the 25–29 age band and in the Great Plains and Mountain West. Age- and place-targeted screening, strengthened partner services, and syphilis-in-pregnancy prevention—directed by continuously updated surveillance such as the accompanying dashboard—are warranted."));

K.push(H1("References"));
["Centers for Disease Control and Prevention. NCHHSTP AtlasPlus. Atlanta, GA: CDC; 2025. https://www.cdc.gov/nchhstp/about/atlasplus.html",
 "Centers for Disease Control and Prevention. Sexually Transmitted Infections Surveillance, 2023. Atlanta, GA: CDC; 2025.",
 "Centers for Disease Control and Prevention. Sexually Transmitted Infections Surveillance, 2024 (Provisional). Atlanta, GA: CDC; 2025.",
 "Anselin L. Local indicators of spatial association—LISA. Geographical Analysis. 1995;27(2):93–115.",
 "Getis A, Ord JK. The analysis of spatial association by use of distance statistics. Geographical Analysis. 1992;24(3):189–206.",
 "Rey SJ, Anselin L. PySAL: a Python library of spatial analytical methods. Review of Regional Studies. 2007;37(1):5–27.",
 "Office of Disease Prevention and Health Promotion. Healthy People 2030: Sexually Transmitted Infections. Washington, DC: U.S. DHHS; 2020.",
].forEach((t,i)=>K.push(new Paragraph({spacing:{after:100,line:264},indent:{left:420,hanging:420},children:[run(`${i+1}. `,{bold:true}),run(t,{size:18})]})));

const doc=new Document({creator:"STI trends analysis",title:"STI trends 15-29, 2013-2023",
 styles:{default:{document:{run:{font:F,size:22}}},paragraphStyles:[
  {id:"Heading1",name:"Heading 1",basedOn:"Normal",next:"Normal",quickFormat:true,run:{font:F,size:28,bold:true,color:"1F3864"},paragraph:{spacing:{before:260,after:120}}},
  {id:"Heading2",name:"Heading 2",basedOn:"Normal",next:"Normal",quickFormat:true,run:{font:F,size:24,bold:true,color:"2E5496"},paragraph:{spacing:{before:180,after:100}}}]},
 sections:[{properties:{page:{size:{width:12240,height:15840},margin:{top:1440,bottom:1440,left:1440,right:1440}}},
  footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({font:F,size:16,children:["Page ",PageNumber.CURRENT]})]})]})},
  children:K}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync("outputs/STI_Trends_15-29_Paper.docx",b);console.log("STI_Trends_15-29_Paper.docx",(b.length/1024).toFixed(0)+" KB");});
