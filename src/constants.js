export const OFB_URL = "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";
export const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";
export const CLAUDE_API = "https://api.anthropic.com/v1/messages";
export const CLAUDE_MODEL = "claude-sonnet-4-6";

export const FLAGS = {
  Mexico:"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷","Czech Republic":"🇨🇿",
  Canada:"🇨🇦","Bosnia-Herzegovina":"🇧🇦",Switzerland:"🇨🇭",Qatar:"🇶🇦",
  Brazil:"🇧🇷",Morocco:"🇲🇦",Scotland:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",Haiti:"🇭🇹",
  USA:"🇺🇸","United States":"🇺🇸",Paraguay:"🇵🇾",Australia:"🇦🇺",Turkey:"🇹🇷",
  Germany:"🇩🇪","Côte d'Ivoire":"🇨🇮","Ivory Coast":"🇨🇮",Ecuador:"🇪🇨","Curaçao":"🇨🇼",
  Netherlands:"🇳🇱",Japan:"🇯🇵",Sweden:"🇸🇪",Tunisia:"🇹🇳",
  Belgium:"🇧🇪",Egypt:"🇪🇬",Iran:"🇮🇷","New Zealand":"🇳🇿",
  Spain:"🇪🇸","Cape Verde":"🇨🇻","Saudi Arabia":"🇸🇦",Uruguay:"🇺🇾",
  France:"🇫🇷",Senegal:"🇸🇳",Norway:"🇳🇴",Iraq:"🇮🇶",
  Argentina:"🇦🇷",Algeria:"🇩🇿",Austria:"🇦🇹",Jordan:"🇯🇴",
  Portugal:"🇵🇹","Congo DR":"🇨🇩",Uzbekistan:"🇺🇿",Colombia:"🇨🇴",
  England:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",Croatia:"🇭🇷",Ghana:"🇬🇭",Panama:"🇵🇦",
  "Bosnia & Herzegovina":"🇧🇦","Bosnia and Herzegovina":"🇧🇦",
};

export const STRENGTH = {
  France:92,Spain:91,Argentina:90,England:88,Brazil:87,Portugal:85,Germany:84,
  Netherlands:83,Belgium:80,Uruguay:79,USA:75,"United States":75,Colombia:74,
  Mexico:73,Japan:72,Morocco:72,Norway:71,Australia:68,"South Korea":68,
  Turkey:67,Switzerland:66,Ecuador:65,Croatia:65,Senegal:64,Scotland:63,
  Austria:62,Ghana:60,Iran:60,Canada:59,Sweden:59,Tunisia:58,Egypt:57,
  "South Africa":55,"New Zealand":54,"Saudi Arabia":54,Algeria:53,Paraguay:52,
  "Côte d'Ivoire":64,"Ivory Coast":64,Uzbekistan:50,"Cape Verde":50,"Congo DR":49,
  Jordan:48,"Bosnia-Herzegovina":55,"Bosnia & Herzegovina":55,"Bosnia and Herzegovina":55,
  Qatar:52,Iraq:50,"Curaçao":44,Panama:52,Haiti:45,
};

export const GROUP_TEAMS = {
  A:["Mexico","South Africa","South Korea","Czech Republic"],
  B:["Canada","Switzerland","Bosnia-Herzegovina","Qatar"],
  C:["Brazil","Morocco","Scotland","Haiti"],
  D:["USA","Paraguay","Australia","Turkey"],
  E:["Germany","Côte d'Ivoire","Ecuador","Curaçao"],
  F:["Netherlands","Japan","Sweden","Tunisia"],
  G:["Belgium","Egypt","Iran","New Zealand"],
  H:["Spain","Cape Verde","Saudi Arabia","Uruguay"],
  I:["France","Senegal","Norway","Iraq"],
  J:["Argentina","Algeria","Austria","Jordan"],
  K:["Portugal","Congo DR","Uzbekistan","Colombia"],
  L:["England","Croatia","Ghana","Panama"],
};

export const R32 = [
  {n:73,t1:"2A",t2:"2B",d:"28 Haz",v:"Los Angeles"},
  {n:74,t1:"1E",t2:"3rd",d:"29 Haz",v:"Boston"},
  {n:75,t1:"1F",t2:"2C",d:"29 Haz",v:"Monterrey"},
  {n:76,t1:"1C",t2:"2F",d:"29 Haz",v:"Houston"},
  {n:77,t1:"1I",t2:"3rd",d:"30 Haz",v:"New York"},
  {n:78,t1:"2E",t2:"2I",d:"30 Haz",v:"Dallas"},
  {n:79,t1:"1A",t2:"3rd",d:"30 Haz",v:"Mexico City"},
  {n:80,t1:"1L",t2:"3rd",d:"1 Tem",v:"Atlanta"},
  {n:81,t1:"1D",t2:"3rd",d:"1 Tem",v:"San Francisco"},
  {n:82,t1:"1G",t2:"3rd",d:"1 Tem",v:"Seattle"},
  {n:83,t1:"2K",t2:"2L",d:"2 Tem",v:"Toronto"},
  {n:84,t1:"1H",t2:"2J",d:"2 Tem",v:"Los Angeles"},
  {n:85,t1:"1B",t2:"3rd",d:"2 Tem",v:"Vancouver"},
  {n:86,t1:"1J",t2:"2H",d:"3 Tem",v:"Miami"},
  {n:87,t1:"1K",t2:"3rd",d:"3 Tem",v:"Kansas City"},
  {n:88,t1:"2D",t2:"2G",d:"3 Tem",v:"Dallas"},
];
export const R16 = [
  {n:89,t1:"W74",t2:"W77",d:"4 Tem",v:"Philadelphia"},
  {n:90,t1:"W73",t2:"W75",d:"4 Tem",v:"Houston"},
  {n:91,t1:"W76",t2:"W78",d:"5 Tem",v:"New York"},
  {n:92,t1:"W79",t2:"W80",d:"5 Tem",v:"Mexico City"},
  {n:93,t1:"W83",t2:"W84",d:"6 Tem",v:"Dallas"},
  {n:94,t1:"W81",t2:"W82",d:"6 Tem",v:"Seattle"},
  {n:95,t1:"W86",t2:"W88",d:"7 Tem",v:"Atlanta"},
  {n:96,t1:"W85",t2:"W87",d:"7 Tem",v:"Vancouver"},
];
export const QF = [
  {n:97,t1:"W89",t2:"W90",d:"9 Tem",v:"Boston"},
  {n:98,t1:"W93",t2:"W94",d:"10 Tem",v:"Los Angeles"},
  {n:99,t1:"W91",t2:"W92",d:"11 Tem",v:"Miami"},
  {n:100,t1:"W95",t2:"W96",d:"11 Tem",v:"Kansas City"},
];
export const SF = [
  {n:101,t1:"W97",t2:"W98",d:"14 Tem",v:"Dallas"},
  {n:102,t1:"W99",t2:"W100",d:"15 Tem",v:"Atlanta"},
];
export const FINAL = {n:104,t1:"W101",t2:"W102",d:"19 Tem",v:"MetLife Stadium"};
