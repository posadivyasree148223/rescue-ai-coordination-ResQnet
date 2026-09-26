import type { Pos } from "./grid";
import type { Severity } from "./resourceAllocation";

export type ScenarioId = "earthquake" | "flood" | "fire" | "multi" | "case1" | "case2";
export type ResKey = "medicalKits" | "water" | "food" | "equipment" | "fuel" | "vehicles";

export interface ScenarioDef {
  id: ScenarioId;
  name: string;
  description: string;
  map: string[];
  recon: Pos;
  rescuers: Pos[];
  victims: { pos: Pos; severity: Severity }[];
  resources: Record<ResKey, number>;
  severity: 1 | 2 | 3;
  scriptedBlocks?: { tick: number; pos: Pos }[];
}

const P = (r: number, c: number): Pos => ({ r, c });
const V = (r: number, c: number, severity: Severity) => ({ pos: P(r, c), severity });

const baseRes: Record<ResKey, number> = { medicalKits: 42, water: 120, food: 90, equipment: 24, fuel: 200, vehicles: 3 };

export const SCENARIOS: Record<ScenarioId, ScenarioDef> = {
  earthquake: {
    id: "earthquake",
    name: "Earthquake",
    description: "Collapsed structures in the central district; debris blocks several roads.",
    map: [
      "S..R......H.",
      ".XX...DD....",
      "......DDD.X.",
      "..X...DD..X.",
      "..X.........",
      ".....XX..DD.",
      "H.........D.",
      "....R.....S.",
    ],
    recon: P(0, 0),
    rescuers: [P(0, 3), P(7, 4)],
    victims: [V(1, 6, "critical"), V(2, 7, "serious"), V(3, 6, "minor"), V(2, 8, "critical"), V(5, 9, "serious"), V(6, 10, "minor"), V(4, 4, "serious"), V(7, 8, "minor")],
    resources: baseRes,
    severity: 2,
  },
  flood: {
    id: "flood",
    name: "Flood",
    description: "River overflow floods the central lowlands; water levels keep rising.",
    map: [
      "H....XX....S",
      "....DDDD....",
      ".R..DDDD..X.",
      "....DDDDD...",
      ".X...DDD..R.",
      ".X..........",
      "....XX...DD.",
      "S.........DH",
    ],
    recon: P(0, 11),
    rescuers: [P(2, 1), P(4, 10)],
    victims: [V(1, 5, "critical"), V(2, 6, "serious"), V(3, 8, "minor"), V(4, 6, "critical"), V(6, 9, "serious"), V(7, 10, "minor"), V(3, 2, "minor"), V(5, 7, "serious")],
    resources: baseRes,
    severity: 2,
  },
  fire: {
    id: "fire",
    name: "Urban Fire",
    description: "Spreading fire in a dense residential block; smoke closes roads quickly.",
    map: [
      "S.....R.....",
      "..XX.......H",
      "..X..DDD....",
      ".....DDDD.X.",
      "..X..DDD..X.",
      "..X.........",
      "H...XX..DD..",
      "...R....DD.S",
    ],
    recon: P(0, 0),
    rescuers: [P(0, 6), P(7, 3)],
    victims: [V(2, 6, "critical"), V(3, 7, "critical"), V(4, 5, "serious"), V(3, 8, "minor"), V(6, 8, "serious"), V(7, 9, "minor"), V(5, 0, "minor"), V(1, 8, "serious")],
    resources: baseRes,
    severity: 3,
  },
  multi: {
    id: "multi",
    name: "Multi-Zone Disaster",
    description: "Simultaneous incidents across four zones compete for three rescue teams.",
    map: [
      "H..DD....R.S",
      "...DD..X....",
      ".R....X..DD.",
      "......X..DD.",
      "..DD......X.",
      "..DD..XX....",
      "........X.DD",
      "S...R.....DH",
    ],
    recon: P(0, 11),
    rescuers: [P(2, 1), P(7, 4), P(0, 9)],
    victims: [V(0, 3, "critical"), V(1, 4, "serious"), V(2, 9, "critical"), V(3, 10, "minor"), V(4, 2, "serious"), V(5, 3, "critical"), V(6, 10, "serious"), V(7, 10, "minor"), V(6, 11, "minor")],
    resources: { ...baseRes, vehicles: 3 },
    severity: 3,
  },
  case1: {
    id: "case1",
    name: "Case 1 · Single-Zone Earthquake",
    description: "1 disaster zone, 2 rescue agents, 5 victims, sufficient resources, one blocked route.",
    map: [
      "S...........",
      ".R..........",
      "......DDD...",
      "......DDD...",
      "...XXXX.....",
      "............",
      ".R.........H",
      "H...........",
    ],
    recon: P(0, 0),
    rescuers: [P(1, 1), P(6, 1)],
    victims: [V(2, 6, "critical"), V(2, 8, "serious"), V(3, 7, "critical"), V(3, 6, "minor"), V(5, 9, "serious")],
    resources: baseRes,
    severity: 1,
  },
  case2: {
    id: "case2",
    name: "Case 2 · Multi-Zone Flood",
    description: "3 flood zones, 7 victims, only 2 rescue agents, 3 medical kits, roads failing mid-operation.",
    map: [
      "H...DD......",
      "....DD...R..",
      "..........X.",
      ".DD...X.....",
      ".DD...X..DD.",
      "......X..DD.",
      "..R.........",
      "S.........SH",
    ],
    recon: P(7, 0),
    rescuers: [P(6, 2), P(1, 9)],
    victims: [V(0, 4, "serious"), V(1, 5, "critical"), V(3, 1, "minor"), V(4, 2, "critical"), V(4, 9, "critical"), V(5, 10, "serious"), V(3, 2, "serious")],
    resources: { ...baseRes, medicalKits: 3, vehicles: 2 },
    severity: 1,
    scriptedBlocks: [
      { tick: 8, pos: P(5, 3) },
      { tick: 14, pos: P(2, 7) },
      { tick: 22, pos: P(6, 8) },
    ],
  },
};

export const LIVE_SCENARIOS: ScenarioId[] = ["earthquake", "flood", "fire", "multi"];
