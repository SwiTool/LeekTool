import { BasicLeekInfos } from "./Leek";

export type FightOutcome = "win" | "defeat";

export interface Fight {
  id: number;
  leeks1: BasicLeekInfos[];
  leeks2: BasicLeekInfos[];
  winner: number;
  status: number;
  date: number;
  context: number;
  type: number;
  farmer1: number;
  farmer2: number;
  team1: number;
  team2: number;
  composition1: null;
  composition2: null;
  result: FightOutcome;
}
