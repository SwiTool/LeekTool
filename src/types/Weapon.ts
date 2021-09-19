import { Effect } from "./Effect";

export interface Weapon {
  id: number;

  name: string;

  level: number;

  min_range: number;

  max_range: number;

  launch_type: number;

  effects: Effect[];

  cost: number;

  area: number;

  los: number;

  template: number;

  passive_effects: Effect[];

  forgotten: boolean;

  item: number;
}
