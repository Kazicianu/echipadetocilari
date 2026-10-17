import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const output = process.argv[2];
if (!output) throw new Error('Furnizează directorul de ieșire al conversației.');
const analysis = JSON.parse(fs.readFileSync(path.join(dir,'comparison.json'),'utf8'));
const aliases = {'The Web Design Company':'TWDC','Design Creator Lab (DCL)':'DCL','PowerCart / digitalART':'PowerCart','WebForge Innovations':'WebForge','Faintech Solutions':'Faintech','Soluții Web Companii':'Soluții Web Companii'};
const rows = analysis.rows.map(r => ({competitor: aliases[r.name] || r.name, name:r.name, entryEUR:r.entryEUR, category:r.category, vat:r.vat, offer:r.offer, url:r.url}));
const links = analysis.rows.map(r => ({label:r.name,url:r.url}));
const source = {
  label:'20 pagini comerciale ale furnizorilor',
  links,
  metricDefinitions:[{label:'Praguri publice de intrare',definition:'O valoare publică EUR per firmă pentru primul proiect de aplicație sau baza de platformă, cu limitele de scop și TVA ale sursei.'}],
  filters:['Furnizori adresabili pieței din România','20 firme distincte cu prag EUR comercial','O singură valoare de proiect per firmă'],
  caveats:analysis.caveats.slice(0,8),
  evidenceFlow:[
    {kind:'calculation',title:'Media și mediana',body:'Suma celor 20 valori este 79.386 EUR. Media este 79.386 / 20 = 3.969,30 EUR. Valorile centrale ordonate sunt 3.500 și 3.999 EUR; mediana este 3.749,50 EUR.'},
    {kind:'validation',title:'Acoperire și excluderi',body:'20 domenii distincte, 20 valori pozitive. Beyond Development a fost exclus deoarece publică un interval pentru proiecte complexe, nu un prag minim; MAST și HappyWeb nu publică preț numeric, iar tiny.studio publică prețuri RON contradictorii.'},
  ],
};
const chart = {
  schemaVersion:1,id:'app-development-entry-prices',title:'Praguri publice de intrare, 20 competitori',description:'EUR afișați · scope și TVA diferite · o valoare per firmă',
  chart:{type:'horizontalBar',x:'competitor',y:'entryEUR',xLabel:'Prag public (EUR)',showYAxisLabel:false,showXAxisLabel:true,startAtZero:true,showValues:true,currency:'EUR',valueDecimals:0,sortOrder:'ascending',rowHeight:32,showLegend:false},
  rows,columns:['competitor','name','entryEUR','category','vat','offer'],source,height:640,theme:'codex-classic',
};
const receipt = {
  schemaVersion:1,
  items:[{id:'public-entry-prices',title:'Praguri publice și media pentru 20 competitori',queries:[{id:'public-offers-20',source,reportingPeriod:'Prețuri publice verificate la 17.10.2026, cu limitările de acces indexat menționate',rows,columns:[{field:'name',label:'Competitor'},{field:'entryEUR',label:'Prag EUR afișat'},{field:'category',label:'Tip aplicație'},{field:'vat',label:'TVA'},{field:'offer',label:'Oferta măsurată'}],methods:[{language:'calculation',code:'sum = 79386 EUR; count = 20; mean = sum / count = 3969.30 EUR; median = (3500 + 3999) / 2 = 3749.50 EUR'}]}]}],
};
fs.writeFileSync(path.join(output,'app-development-prices.json'),JSON.stringify(chart,null,2)+'\n');
fs.writeFileSync(path.join(output,'app-development-sources.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({rows:rows.length,output}));
