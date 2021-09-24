import { Area } from "./Area";
import { Effect } from "./Effect";

export interface Chip {
  id: number;
  name: string;
  level: number;
  min_range: number;
  max_range: number;
  launch_type: number;
  effects: Effect[];
  cost: number;
  area: Area;
  los: number;
  template: number;
  cooldown: number;
  team_cooldown: number;
  initial_cooldown: number;
  type: number;
}
