import { Chip } from "./Chip";
import { Constants } from "./Constants";
import { Functions } from "./Functions";
import { Weapon } from "./Weapon";

export type ConstantDetailsState = {
  chips: Record<string, Chip>;
  weapons: Record<string, Weapon>;
  constants: Record<string, Constants>;
  functions: Record<string, Functions[]>;
  lang: Record<string, string>;
  version: number;
};

export type DocObj = {
  constants: Record<string, Constants>;
  functions: Record<string, Functions[]>;
  lang: Record<string, string>;
};

export type DocDef = Record<string, any>;
