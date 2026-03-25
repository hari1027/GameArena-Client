import { useState, useMemo } from "react";
import type { Route, TTRPlayerSnapshot } from "../../Utils/Ticket To Ride";

// ── Card color palette ────────────────────────────────────────────────────────
const HEX: Record<string, string> = {
  red:"#e53935", blue:"#1e88e5", green:"#43a047", yellow:"#fdd835",
  black:"#555",  white:"#e0e0e0", pink:"#e91e8c", orange:"#fb8c00",
  gray:"#9e9e9e", locomotive:"#7b1fa2",
};
const BDR: Record<string, string> = {
  red:"#b71c1c", blue:"#0d47a1", green:"#1b5e20", yellow:"#f57f17",
  black:"#000",  white:"#757575", pink:"#880e4f", orange:"#bf360c",
  gray:"#424242", locomotive:"#4a0072",
};

// ── City positions (1300 × 1500 canvas) ──────────────────────────────────────
const CP: Record<string, [number, number]> = {
  Peshawar:    [130,  80],
  Jacobabad:   [ 60, 310],
  Rohri:       [220, 270],
  Karachi:     [ 48, 460],
  Lahore:      [310, 155],
  Bhatinda:    [450, 220],
  Ambala:      [610, 195],
  Delhi:       [560, 330],
  Bareilly:    [740, 255],
  Jodhpur:     [295, 430],
  Jaipur:      [440, 390],
  Ahmadabad:   [160, 570],
  Ratiam:      [370, 535],
  Khandwa:     [400, 640],
  Agra:        [555, 420],
  Lucknow:     [700, 355],
  Patna:       [840, 375],
  Bhopal:      [530, 575],
  Katni:       [740, 460],
  Bilaspur:    [720, 540],
  Raipur:      [695, 635],
  Calcutta:    [980, 490],
  Dhubri:      [1090, 415],
  Jarhat:      [1200, 355],
  Chittagong:  [1180, 510],
  Manmad:      [360, 720],
  Bombay:      [130, 760],
  Poona:       [225, 835],
  Wadi:        [480, 755],
  Indur:       [600, 700],
  Waltain:     [820, 760],
  Mormugau:    [155, 960],
  Guntakal:    [460, 900],
  Bezwada:     [620, 855],
  Madras:      [740, 940],
  Mangalore:   [260, 1070],
  Erode:       [560, 1080],
  Calicut:     [195, 1185],
  Quilon:      [210, 1330],
};

// ── Visual route definitions (exact same as original IndianBoard) ─────────────
// id: visual key used for selection state (matches what onRouteSelect sends up)
// dual: 1 = has two lanes; lane A = id, lane B = id+"b"
// c/c2: slot fill colors per lane
// locos: number of locomotive (purple) slots at start
interface RouteData {
  id: string;
  a: string; b: string;
  dual: number;
  c: string; c2?: string;
  n: number;
  locos?: number;
}

// ── Visual routes — IDs now match the unified routes.js exactly ──────────────
// dual:1 means lane A = id, lane B = id+"b" (both exist in engine routes.js)
// c = lane A color, c2 = lane B color (from routes.js .color field per lane)
// locos = locosRequired from routes.js (ferry routes only)
const ROUTES: RouteData[] = [
  {id:"R01",  a:"Peshawar",  b:"Lahore",    dual:1,c:"pink",  c2:"green",  n:1},
  {id:"R02",  a:"Peshawar",  b:"Jacobabad", dual:1,c:"orange",c2:"yellow", n:3},
  {id:"R03",  a:"Lahore",    b:"Jacobabad", dual:0,c:"red",               n:3},
  {id:"R04",  a:"Lahore",    b:"Bhatinda",  dual:1,c:"gray",  c2:"gray",   n:2},
  {id:"R05",  a:"Lahore",    b:"Ambala",    dual:0,c:"black",              n:4},
  {id:"R06",  a:"Jacobabad", b:"Karachi",   dual:0,c:"white",              n:4},
  {id:"R07",  a:"Jacobabad", b:"Rohri",     dual:1,c:"green", c2:"blue",   n:1},
  {id:"R08",  a:"Bhatinda",  b:"Rohri",     dual:0,c:"pink",               n:2},
  {id:"R09",  a:"Bhatinda",  b:"Jodhpur",   dual:0,c:"green",              n:3},
  {id:"R10",  a:"Bhatinda",  b:"Delhi",     dual:0,c:"blue",               n:3},
  {id:"R11",  a:"Bhatinda",  b:"Ambala",    dual:1,c:"white", c2:"yellow", n:2},
  {id:"R12",  a:"Rohri",     b:"Karachi",   dual:0,c:"black",              n:3},
  {id:"R13",  a:"Ambala",    b:"Delhi",     dual:1,c:"gray",  c2:"gray",   n:2},
  {id:"R14",  a:"Ambala",    b:"Bareilly",  dual:0,c:"orange",             n:2},
  {id:"R15",  a:"Karachi",   b:"Jodhpur",   dual:0,c:"orange",             n:3},
  {id:"R16",  a:"Karachi",   b:"Bombay",    dual:1,c:"gray",  c2:"gray",   n:6, locos:2},
  {id:"R17",  a:"Jodhpur",   b:"Ahmadabad", dual:1,c:"pink",  c2:"black",  n:3},
  {id:"R18",  a:"Jodhpur",   b:"Jaipur",    dual:0,c:"red",                n:2},
  {id:"R19",  a:"Delhi",     b:"Jaipur",    dual:0,c:"pink",               n:2},
  {id:"R20",  a:"Delhi",     b:"Agra",      dual:0,c:"orange",             n:2},
  {id:"R21",  a:"Delhi",     b:"Lucknow",   dual:0,c:"yellow",             n:2},
  {id:"R22",  a:"Delhi",     b:"Bareilly",  dual:0,c:"white",              n:1},
  {id:"R23",  a:"Jaipur",    b:"Ratiam",    dual:1,c:"yellow",c2:"orange", n:1},
  {id:"R24",  a:"Jaipur",    b:"Agra",      dual:1,c:"blue",  c2:"white",  n:1},
  {id:"R25",  a:"Agra",      b:"Bhopal",    dual:1,c:"red",   c2:"pink",   n:1},
  {id:"R26",  a:"Agra",      b:"Katni",     dual:0,c:"green",              n:2},
  {id:"R27",  a:"Agra",      b:"Lucknow",   dual:0,c:"gray",               n:2},
  {id:"R28",  a:"Bareilly",  b:"Lucknow",   dual:0,c:"gray",               n:1},
  {id:"R29",  a:"Bareilly",  b:"Patna",     dual:0,c:"green",              n:4},
  {id:"R30",  a:"Lucknow",   b:"Katni",     dual:1,c:"blue",  c2:"black",  n:1},
  {id:"R31",  a:"Katni",     b:"Bilaspur",  dual:1,c:"white", c2:"pink",   n:1},
  {id:"R32",  a:"Katni",     b:"Patna",     dual:1,c:"gray",  c2:"gray",   n:2},
  {id:"R33",  a:"Patna",     b:"Calcutta",  dual:0,c:"pink",               n:2},
  {id:"R34",  a:"Patna",     b:"Dhubri",    dual:1,c:"red",   c2:"blue",   n:2},
  {id:"R35",  a:"Dhubri",    b:"Calcutta",  dual:1,c:"gray",  c2:"gray",   n:2},
  {id:"R36",  a:"Dhubri",    b:"Chittagong",dual:0,c:"white",              n:2},
  {id:"R37",  a:"Dhubri",    b:"Jarhat",    dual:1,c:"gray",  c2:"gray",   n:2},
  {id:"R38",  a:"Jarhat",    b:"Chittagong",dual:0,c:"gray",               n:3},
  {id:"R39",  a:"Chittagong",b:"Calcutta",  dual:1,c:"gray",  c2:"gray",   n:2, locos:1},
  {id:"R40",  a:"Calcutta",  b:"Bilaspur",  dual:0,c:"yellow",             n:4},
  {id:"R41",  a:"Calcutta",  b:"Raipur",    dual:0,c:"blue",               n:4},
  {id:"R42",  a:"Calcutta",  b:"Waltain",   dual:0,c:"red",                n:4},
  {id:"R43",  a:"Calcutta",  b:"Madras",    dual:0,c:"gray",               n:8, locos:2},
  {id:"R44",  a:"Bilaspur",  b:"Bhopal",    dual:1,c:"gray",  c2:"gray",   n:2},
  {id:"R45",  a:"Bilaspur",  b:"Raipur",    dual:1,c:"red",   c2:"black",  n:1},
  {id:"R46",  a:"Bhopal",    b:"Ratiam",    dual:0,c:"black",              n:2},
  {id:"R47",  a:"Bhopal",    b:"Khandwa",   dual:0,c:"blue",               n:2},
  {id:"R48",  a:"Ratiam",    b:"Ahmadabad", dual:0,c:"green",              n:1},
  {id:"R49",  a:"Ratiam",    b:"Khandwa",   dual:0,c:"gray",               n:2},
  {id:"R50",  a:"Ahmadabad", b:"Khandwa",   dual:0,c:"yellow",             n:2},
  {id:"R51",  a:"Ahmadabad", b:"Bombay",    dual:0,c:"white",              n:3},
  {id:"R52",  a:"Khandwa",   b:"Manmad",    dual:0,c:"red",                n:1},
  {id:"R53",  a:"Khandwa",   b:"Raipur",    dual:0,c:"orange",             n:4},
  {id:"R54",  a:"Raipur",    b:"Waltain",   dual:1,c:"white", c2:"green",  n:3},
  {id:"R55",  a:"Manmad",    b:"Bombay",    dual:0,c:"black",              n:1},
  {id:"R56",  a:"Manmad",    b:"Poona",     dual:0,c:"gray",               n:1},
  {id:"R57",  a:"Manmad",    b:"Indur",     dual:0,c:"pink",               n:3},
  {id:"R58",  a:"Indur",     b:"Wadi",      dual:0,c:"gray",               n:1},
  {id:"R59",  a:"Indur",     b:"Bezwada",   dual:1,c:"green", c2:"yellow", n:2},
  {id:"R60",  a:"Bombay",    b:"Calicut",   dual:0,c:"gray",               n:6, locos:2},
  {id:"R61",  a:"Bombay",    b:"Mormugau",  dual:0,c:"green",              n:1},
  {id:"R62",  a:"Bombay",    b:"Poona",     dual:0,c:"blue",               n:1},
  {id:"R63",  a:"Waltain",   b:"Bezwada",   dual:1,c:"black", c2:"orange", n:2},
  {id:"R64",  a:"Waltain",   b:"Madras",    dual:0,c:"yellow",             n:3},
  {id:"R65",  a:"Poona",     b:"Mormugau",  dual:0,c:"gray",               n:1},
  {id:"R66",  a:"Poona",     b:"Wadi",      dual:0,c:"orange",             n:1},
  {id:"R67",  a:"Mormugau",  b:"Mangalore", dual:0,c:"black",              n:2},
  {id:"R68",  a:"Mormugau",  b:"Guntakal",  dual:0,c:"red",                n:2},
  {id:"R69",  a:"Mormugau",  b:"Wadi",      dual:0,c:"gray",               n:1},
  {id:"R70",  a:"Wadi",      b:"Guntakal",  dual:1,c:"black", c2:"pink",   n:1},
  {id:"R71",  a:"Bezwada",   b:"Guntakal",  dual:0,c:"blue",               n:2},
  {id:"R72",  a:"Bezwada",   b:"Madras",    dual:0,c:"red",                n:1},
  {id:"R73",  a:"Guntakal",  b:"Mangalore", dual:0,c:"gray",               n:2},
  {id:"R74",  a:"Guntakal",  b:"Madras",    dual:0,c:"white",              n:2},
  {id:"R75",  a:"Madras",    b:"Mangalore", dual:0,c:"pink",               n:4},
  {id:"R76",  a:"Madras",    b:"Erode",     dual:1,c:"green", c2:"orange", n:2},
  {id:"R77",  a:"Mangalore", b:"Calicut",   dual:1,c:"yellow",c2:"white",  n:1},
  {id:"R78",  a:"Calicut",   b:"Quilon",    dual:1,c:"gray",  c2:"gray",   n:2, locos:1},
  {id:"R79",  a:"Calicut",   b:"Erode",     dual:1,c:"red",   c2:"blue",   n:3},
  {id:"R80",  a:"Quilon",    b:"Erode",     dual:0,c:"gray",               n:4},
];

// Bezier curves — same as original
const CURVE: Record<string, [number, number]> = {
  R03: [130,  240],
  R05: [460,   90],
  R16: [ 30,  620],
  R43: [1160, 760],
  R53: [580,  650],
  R60: [-80, 1050],
  R75: [560, 1010],
};

// ── Geometry helpers ──────────────────────────────────────────────────────────
const GAP = 10;
const SH  = 8;
const SW  = 0.66;

function perpDir(x1: number, y1: number, x2: number, y2: number): [number, number] {
  const dx = x2-x1, dy = y2-y1, L = Math.hypot(dx, dy) || 1;
  return [-dy/L, dx/L];
}
function angDeg(x1: number, y1: number, x2: number, y2: number): number {
  return Math.atan2(y2-y1, x2-x1) * 180 / Math.PI;
}
function lerp(a: number, b: number, t: number): number { return a+(b-a)*t; }

function bezierPts(x1: number, y1: number, cpx: number, cpy: number, x2: number, y2: number, n: number): [number,number][] {
  return Array.from({length: n}, (_, i) => {
    const t = (i+0.5)/n, m = 1-t;
    return [m*m*x1+2*m*t*cpx+t*t*x2, m*m*y1+2*m*t*cpy+t*t*y2] as [number,number];
  });
}
function bezierAngDeg(x1: number, y1: number, cpx: number, cpy: number, x2: number, y2: number, t: number): number {
  const dx = 2*(1-t)*(cpx-x1)+2*t*(x2-cpx);
  const dy = 2*(1-t)*(cpy-y1)+2*t*(y2-cpy);
  return Math.atan2(dy, dx) * 180 / Math.PI;
}
function bezierLen(x1: number, y1: number, cpx: number, cpy: number, x2: number, y2: number): number {
  let L = 0;
  for (let i = 0; i < 20; i++) {
    const t0=i/20, t1=(i+1)/20, m0=1-t0, m1=1-t1;
    const ax=m0*m0*x1+2*m0*t0*cpx+t0*t0*x2, ay=m0*m0*y1+2*m0*t0*cpy+t0*t0*y2;
    const bx=m1*m1*x1+2*m1*t1*cpx+t1*t1*x2, by=m1*m1*y1+2*m1*t1*cpy+t1*t1*y2;
    L += Math.hypot(bx-ax, by-ay);
  }
  return L;
}

// ── Slot ──────────────────────────────────────────────────────────────────────
interface SlotProps {
  cx: number; cy: number; ang: number;
  col: string;
  claimed: boolean; trainColor: string;
  sel: boolean; isLoco: boolean; sw: number;
}

function Slot({ cx, cy, ang, col, claimed, trainColor, sel, isLoco, sw }: SlotProps) {
  const fill   = claimed ? trainColor
               : sel     ? "rgba(255,255,255,0.85)"
               : isLoco  ? HEX.locomotive
               : (HEX[col] || HEX.gray);
  const stroke = claimed ? "rgba(0,0,0,0.8)"
               : isLoco  ? BDR.locomotive
               : (BDR[col] || BDR.gray);

  return (
    <g transform={`rotate(${ang},${cx},${cy})`} pointerEvents="none">
      <rect x={cx-sw/2} y={cy-SH/2} width={sw} height={SH} rx={1.8}
        fill={fill} stroke={stroke} strokeWidth={0.6}/>
      {!claimed && !sel && !isLoco && (
        <rect x={cx-sw/2+1} y={cy-SH/2+1} width={sw-2} height={2} rx={0.8}
          fill="rgba(255,255,255,0.2)" pointerEvents="none"/>
      )}
      {claimed && (() => {
        const clipId = `cl${cx|0}x${cy|0}`;
        return (
          <g pointerEvents="none">
            <clipPath id={clipId}>
              <rect x={cx-sw/2} y={cy-SH/2} width={sw} height={SH} rx={1.8}/>
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              {Array.from({length: Math.ceil(sw/2)+1}, (_, k) => (
                <rect key={k}
                  x={cx-sw/2+k*4} y={cy-SH/2}
                  width={2} height={SH}
                  fill={k%2===0 ? trainColor : "#ffffff"}/>
              ))}
            </g>
            <rect x={cx-sw/2} y={cy-SH/2} width={sw} height={SH} rx={1.8}
              fill="none" stroke="rgba(0,0,0,0.8)" strokeWidth={0.7}/>
          </g>
        );
      })()}
    </g>
  );
}

// ── renderLane ────────────────────────────────────────────────────────────────
function renderLane(
  key: string,
  x1: number, y1: number, x2: number, y2: number,
  n: number, col: string,
  claimed: boolean, trainColor: string,
  sel: boolean, locos: number,
  cv: [number,number] | null,
  tracks: React.ReactElement[],
  hits:   React.ReactElement[],
  onSelect: (k: string) => void,
) {
  const cpx = cv?.[0] ?? null;
  const cpy = cv?.[1] ?? null;
  const bedW = SH + 4;

  let pts: [number,number][];
  let angFn: (i: number) => number;
  let pitch: number;

  if (cpx !== null && cpy !== null) {
    const L = bezierLen(x1,y1,cpx,cpy,x2,y2);
    pitch  = L / n;
    pts    = bezierPts(x1,y1,cpx,cpy,x2,y2,n);
    angFn  = (i) => bezierAngDeg(x1,y1,cpx,cpy,x2,y2,(i+0.5)/n);
  } else {
    pitch  = Math.hypot(x2-x1, y2-y1) / n;
    pts    = Array.from({length: n}, (_, i) => {
      const t = (i+0.5)/n;
      return [lerp(x1,x2,t), lerp(y1,y2,t)] as [number,number];
    });
    const a = angDeg(x1,y1,x2,y2);
    angFn  = () => a;
  }

  const sw = Math.max(pitch * SW - 2, 4);
  const d  = cpx !== null && cpy !== null
    ? `M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}` : null;

  tracks.push(d
    ? <path key={`bed${key}`} d={d} fill="none" stroke="#050505" strokeWidth={bedW} strokeLinecap="round" pointerEvents="none"/>
    : <line key={`bed${key}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#050505" strokeWidth={bedW} strokeLinecap="round" pointerEvents="none"/>
  );
  if (sel) {
    tracks.push(d
      ? <path key={`glow${key}`} d={d} fill="none" stroke="#4fc3f7" strokeWidth={bedW+9} strokeLinecap="round" opacity={0.28} pointerEvents="none"/>
      : <line key={`glow${key}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#4fc3f7" strokeWidth={bedW+9} strokeLinecap="round" opacity={0.28} pointerEvents="none"/>
    );
  }
  tracks.push(
    <g key={`slots${key}`} pointerEvents="none">
      {pts.map(([cx,cy], i) => (
        <Slot key={i} cx={cx} cy={cy} ang={angFn(i)} col={col}
          claimed={claimed} trainColor={trainColor}
          sel={sel} isLoco={!claimed && i < locos} sw={sw}/>
      ))}
    </g>
  );
  if (!claimed) {
    hits.push(d
      ? <path key={`hit${key}`} d={d} fill="none" stroke="transparent" strokeWidth={16} strokeLinecap="round"
          style={{cursor:"pointer"}} onClick={() => onSelect(key)}/>
      : <line key={`hit${key}`} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="transparent" strokeWidth={16} strokeLinecap="round"
          style={{cursor:"pointer"}} onClick={() => onSelect(key)}/>
    );
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────
// interface PlayerInfo {
//   id: string;
//   trainColor: string;
// }

interface IndiaBoardProps {
  routes:          Route[];          // live snapshot from engine
  onRouteSelect:   (id: string) => void;
  selectedRouteId: string | null;
  players:         TTRPlayerSnapshot[];     // for player legend
  canInteract:     boolean;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function IndiaBoard({
  routes,
  onRouteSelect,
  selectedRouteId,
  players,
  canInteract,
}: IndiaBoardProps) {

  const [selCity, setSelCity] = useState<string | null>(null);

  // Fast lookup: visual route id → engine Route object
  // Visual ids (R01, R01b, R02 …) match engine ids only when the engine
  // route list uses the same ids. If they differ, adapt here.
  const routeMap = useMemo(() => {
    const m: Record<string, Route> = {};
    routes.forEach(r => { m[r.id] = r; });
    return m;
  }, [routes]);

  // Reachable cities from currently selected city.
  // For each visual route entry, check BOTH lane A (r.id) and lane B (r.id+"b")
  // against the engine routeMap — both keys exist as separate objects in the snapshot.
  const reachable = useMemo(() => {
    if (!selCity) return new Set<string>();
    const s = new Set<string>();
    ROUTES.forEach(r => {
      const laneAFree = !routeMap[r.id]?.claimedBy;
      // For dual routes, lane B key = r.id+"b" which exists as its own engine object
      const laneBFree = r.dual === 1 ? !routeMap[r.id + "b"]?.claimedBy : false;
      const anyFree   = laneAFree || laneBFree;
      if (!anyFree) return;
      if (r.a === selCity) s.add(r.b);
      if (r.b === selCity) s.add(r.a);
    });
    return s;
  }, [selCity, routeMap]);

  const handleCity = (name: string) => {
    if (!canInteract) return;
    if (!selCity) { setSelCity(name); return; }
    if (selCity === name) { setSelCity(null); return; }
    if (reachable.has(name)) {
      const matches = ROUTES.filter(
        r => (r.a === selCity && r.b === name) || (r.a === name && r.b === selCity)
      );
      for (const r of matches) {
        // Try lane A first — r.id exists as its own engine route object
        if (!routeMap[r.id]?.claimedBy) {
          onRouteSelect(r.id);
          setSelCity(null);
          return;
        }
        // Try lane B — r.id+"b" also exists as its own engine route object
        if (r.dual === 1 && !routeMap[r.id + "b"]?.claimedBy) {
          onRouteSelect(r.id + "b");
          setSelCity(null);
          return;
        }
      }
    }
    setSelCity(name);
  };

  const handleSelect = (key: string) => {
    if (!canInteract) return;
    onRouteSelect(key);
    setSelCity(null);
  };

  const tracks: React.ReactElement[] = [];
  const hits:   React.ReactElement[] = [];

  ROUTES.forEach(r => {
    const A = CP[r.a], B = CP[r.b];
    if (!A || !B) return;
    const cv = (CURVE[r.id] as [number,number] | undefined) ?? null;

    const mkLane = (key: string, col: string, dir: -1|0|1) => {
      let x1=A[0], y1=A[1], x2=B[0], y2=B[1];
      let cpx = cv?.[0] ?? null;
      let cpy = cv?.[1] ?? null;
      if (dir !== 0) {
        const [px,py] = perpDir(x1,y1,x2,y2);
        x1 += px*GAP*dir; y1 += py*GAP*dir;
        x2 += px*GAP*dir; y2 += py*GAP*dir;
        if (cpx !== null && cpy !== null) { cpx += px*GAP*dir; cpy += py*GAP*dir; }
      }
      const engineRoute = routeMap[key];
      const claimed     = !!engineRoute?.claimedBy;
      const trainColor  = engineRoute?.trainColor ?? "#4fc3f7";
      const sel         = selectedRouteId === key;
      const finalCv: [number,number]|null = cpx !== null && cpy !== null ? [cpx,cpy] : null;
      renderLane(key, x1,y1,x2,y2, r.n, col, claimed, trainColor, sel, r.locos??0, finalCv, tracks, hits, handleSelect);
    };

    if (!r.dual) {
      mkLane(r.id, r.c, 0);
    } else {
      mkLane(r.id,       r.c,          -1);
      mkLane(r.id+"b",   r.c2||r.c,     1);
    }
  });

  const cities = Object.entries(CP).map(([name, [cx, cy]]) => {
    const iS = selCity === name;
    const iR = !iS && reachable.has(name);
    return (
      <g key={name}>
        {iS && <circle cx={cx} cy={cy} r={13} fill="rgba(253,216,53,0.22)" stroke="#fdd835" strokeWidth={1.8} pointerEvents="none"/>}
        {iR && <circle cx={cx} cy={cy} r={11} fill="rgba(102,187,106,0.18)" stroke="#66bb6a" strokeWidth={1.3} pointerEvents="none"/>}
        <circle cx={cx} cy={cy} r={6.5}
          fill={iS?"#fdd835":iR?"#c8e6c9":"#f5e4c0"}
          stroke={iS?"#c8a000":"#3a1a00"} strokeWidth={1.3} pointerEvents="none"/>
        <circle cx={cx} cy={cy} r={2.5}
          fill={iS?"#7a5500":"#6a2a00"} pointerEvents="none"/>
        <text x={cx} y={cy-10} textAnchor="middle" fontSize="8" fontWeight="700"
          fontFamily="'Segoe UI',sans-serif" fill="#f0e8d0"
          stroke="#000" strokeWidth={2.2} paintOrder="stroke" pointerEvents="none">
          {name}
        </text>
        <circle cx={cx} cy={cy} r={13} fill="transparent"
          style={{cursor: canInteract ? "pointer" : "default"}}
          onClick={() => handleCity(name)}/>
      </g>
    );
  });

  const legCols = ["red","blue","green","yellow","black","white","pink","orange","gray","locomotive"];

  return (
    <div style={{flex:1, overflow:"auto"}}>
      <svg viewBox="0 0 1300 1520"
        style={{display:"block", minWidth:700, width:"100%", background:"#1a1a2e"}}
        xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="boardgrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="rgba(255,255,255,0.045)"/>
          </pattern>
        </defs>
        <rect width="1300" height="1520" fill="url(#boardgrid)"/>

        {/* Route points table */}
        <rect x="1030" y="44" width="240" height="128" rx="4"
          fill="rgba(8,4,0,0.9)" stroke="#7a5010" strokeWidth={0.8}/>
        <text x="1150" y="61" textAnchor="middle" fontSize="10" fontWeight="700"
          fill="#c8962a" fontFamily="Georgia,serif">Route Points</text>
        {[["1","1"],["2","2"],["3","4"],["4","7"],["6","15"],["8","21"]].map(([c,p],i) => (
          <g key={i}>
            <text x="1044" y={75+i*16} fontSize="8.5" fill="#c8a060">{c} Train{+c>1?"s":""}</text>
            <text x="1258" y={75+i*16} textAnchor="end" fontSize="8.5" fontWeight="700" fill="#e8c880">
              {p} pt{+p>1?"s":""}
            </text>
          </g>
        ))}

        <g>{tracks}</g>
        <g>{hits}</g>
        <g>{cities}</g>

        {/* Card color legend */}
        <rect x="8" y="1464" width={legCols.length*126+6} height="22" rx="3" fill="rgba(0,0,0,0.6)"/>
        {legCols.map((col, i) => (
          <g key={col}>
            <rect x={12+i*126} y={1466} width={104} height={15} rx={1.8}
              fill={HEX[col]} stroke={BDR[col]} strokeWidth={0.6}/>
            <text x={64+i*126} y={1477} textAnchor="middle" fontSize={7.5} fontWeight="700"
              fontFamily="'Segoe UI',sans-serif"
              fill={col==="yellow"||col==="white"?"#111":"#fff"}>{col}</text>
          </g>
        ))}

        {/* Player legend — striped to match claimed route appearance */}
        <rect x="8" y="1492" width={players.length*145+6} height="22" rx="3" fill="rgba(0,0,0,0.6)"/>
        {players.map((p, i) => {
          const bx = 12+i*145;
          const clipId = `plcl${i}`;
          return (
            <g key={p.id}>
              <clipPath id={clipId}>
                <rect x={bx} y={1494} width={132} height={15} rx={2}/>
              </clipPath>
              <rect x={bx} y={1494} width={132} height={15} rx={2} fill={p.trainColor}/>
              <g clipPath={`url(#${clipId})`}>
                {Array.from({length:18}, (_, k) => (
                  <rect key={k} x={bx+k*8} y={1494} width={4} height={15}
                    fill={k%2===0 ? p.trainColor : "#ffffff"}/>
                ))}
              </g>
              <rect x={bx} y={1494} width={132} height={15} rx={2}
                fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={0.6}/>
              <text x={bx+66} y={1505} textAnchor="middle" fontSize={8} fontWeight="700"
                fontFamily="'Segoe UI',sans-serif"
                fill={p.trainColor==="#fdd835"?"#111":"#000"}>{p.id}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}