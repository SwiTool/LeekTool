import { Api } from "../LeekApi";
import { Chip } from "../types/Chip";
import { Weapon } from "../types/Weapon";

export type ConstantDetailsState = { chips: Chip[]; weapons: Weapon[] };

export const constantDetailsState: ConstantDetailsState = {
  chips: [],
  weapons: []
};

export async function loadAllConstantDetails() {
  const { chips } = await Api.chipGetAll();
  const { weapons } = await Api.weaponGetAll();
  constantDetailsState.chips = Object.values(chips);
  constantDetailsState.weapons = Object.values(weapons);
}
