const STORAGE_KEY = "svw_countries_v1";
const PREVIOUS_KEY = "svw_previous_v1";

function getFlag(code){return `https://flagcdn.com/w80/${code}.png`;}
function loadCountries(){return JSON.parse(localStorage.getItem(STORAGE_KEY)) || window.DEFAULT_COUNTRIES;}
function loadPrevious(){return JSON.parse(localStorage.getItem(PREVIOUS_KEY)) || null;}
function saveCountries(data){localStorage.setItem(STORAGE_KEY, JSON.stringify(data));}
function savePrevious(data){localStorage.setItem(PREVIOUS_KEY, JSON.stringify(data));}
function averageOdds(item){return (Number(item.official)+Number(item.world))/2;}
function chanceList(list){const weights=list.map(x=>1/averageOdds(x)); const total=weights.reduce((a,b)=>a+b,0); return weights.map(w=>Math.round((w/total)*100));}
function fmt(n){return Number(n).toFixed(2).replace(/\.00$/,"");}
function esc(s){return String(s ?? "").replace(/[&<>'"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[m]));}

let countries = loadCountries();
let previous = loadPrevious();

function render(){
  countries.sort((a,b)=>a.rank-b.rank);
  const chances=chanceList(countries);
  const body=document.getElementById("oddsBody");
  body.innerHTML="";
  countries.forEach((item,i)=>{
    const prev=previous?.find(p=>p.name===item.name);
    const rankMove=prev ? Number(prev.rank)-Number(item.rank) : 0;
    const officialMove=prev ? Number(prev.official)-Number(item.official) : 0;
    const worldMove=prev ? Number(prev.world)-Number(item.world) : 0;
    const row=document.createElement("tr");
    row.innerHTML=`
      <td class="rank-cell">${item.rank}${rankMove>0?'<span class="movement up">▲</span>':rankMove<0?'<span class="movement down">▼</span>':'<span class="movement same">–</span>'}</td>
      <td><button class="country-button" data-country="${esc(item.name)}"><span class="trend-icon">↗</span><img class="flag" src="${getFlag(item.code)}" alt="${esc(item.name)} flag"><span>${esc(item.name)}</span>${item.released?'<span class="video-icon">▶</span>':''}</button></td>
      <td class="chance">${chances[i]}%</td>
      <td><span class="odd-box ${officialMove>0?'flash-good':officialMove<0?'flash-bad':''}">${fmt(item.official)}</span></td>
      <td><span class="odd-box ${worldMove>0?'flash-good':worldMove<0?'flash-bad':''}">${fmt(item.world)}</span></td>
      <td><button class="history-btn" data-country="${esc(item.name)}">📈</button></td>`;
    body.appendChild(row);
  });
  document.getElementById("lastUpdated").textContent = "Last updated: " + new Date().toLocaleString("en-GB");
}

function openCountry(name){
  const item=countries.find(c=>c.name===name); if(!item)return;
  document.getElementById("modalFlag").src=getFlag(item.code);
  document.getElementById("modalCountry").textContent=item.name;
  document.getElementById("modalStatus").textContent=item.released?"Released · Video available":"Not released yet";
  document.getElementById("modalArtist").textContent=item.artist;
  document.getElementById("modalSong").textContent=item.song;
  document.getElementById("modalRelease").textContent=item.releaseDate;
  document.getElementById("modalRank").textContent="#"+item.rank;
  document.getElementById("modalHistory").textContent=item.history || "No history added yet.";
  document.getElementById("countryModal").classList.add("open");
}

document.addEventListener("click",e=>{
  const btn=e.target.closest("[data-country]");
  if(btn) openCountry(btn.dataset.country);
  if(e.target.dataset.close) document.getElementById("countryModal").classList.remove("open");
});

render();
