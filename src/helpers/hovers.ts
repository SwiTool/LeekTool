import { constantDetailsState } from "../states/ConstantsDetailsState";
import { Area } from "../types/Area";
import { EffectModifier, EffectType } from "../types/Effect";
import * as vscode from "vscode";

function getEffectModifiers(modifiers: number) {
  const mods: string[] = [];
  for (const effect in EffectModifier) {
    if (+effect === 0) {
      continue;
    }
    if ((modifiers & +effect) === +effect) {
      mods.push(EffectModifier[effect]);
    }
  }
  return mods;
}

export function getChipHover(text: string): string[] {
  const message = [];
  const chipName = text.substr(5).toLocaleLowerCase();

  const chip = constantDetailsState.chips.find(c => c.name === chipName);
  if (!chip) {
    return [];
  }
  message.push(
    `${text} / Lvl ${chip.level} &nbsp;&nbsp; ![](https://leekwars.com/image/charac/small/tp.png) ${chip.cost}&nbsp;&nbsp;&nbsp;&nbsp;`
  );
  message.push(
    `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;![${chipName}](https://leekwars.com/image/chip/${chipName}.png)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`
  );
  let tmpStr = "Effects:  \n";
  chip.effects.forEach((e, i) => {
    const mods = getEffectModifiers(e.modifiers);
    const minDmg = e.value1;
    const maxDmg = e.value1 + e.value2;
    tmpStr += `${i + 1}. ${EffectType[e.id]} `;
    tmpStr += ` de ${minDmg} `;
    if (maxDmg !== minDmg) {
      tmpStr += ` à ${maxDmg} `;
    }
    if (mods.length) {
      tmpStr += `  \n - ${mods.join("  \n   - ")} `;
    }
    tmpStr += "  \n  \n";
  });
  message.push(Area[chip.area]);
  const img = vscode.Uri.file(
    `${__dirname}/../images/t${chip.launch_type}_${chip.min_range}_${chip.max_range}.svg`
  ).fsPath;
  message.push(
    `&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;![](${img})&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;`
  );
  message.push(tmpStr);
  return message;
}
