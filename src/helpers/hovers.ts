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
  const spaces =
    "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
  const chipName = text.substr(5).toLocaleLowerCase();

  const chip = constantDetailsState.chips.find(c => c.name === chipName);
  if (!chip) {
    return [];
  }
  const cooldown = vscode.Uri.file(
    `${__dirname}/../images/cooldown.svg`
  ).fsPath;
  const star = vscode.Uri.file(`${__dirname}/../images/star.svg`).fsPath;
  const chipImg = vscode.Uri.file(
    `${__dirname}/../images/chip/${chipName}.png`
  ).fsPath;
  const img = vscode.Uri.file(
    `${__dirname}/../images/t${chip.launch_type}_${chip.min_range}_${chip.max_range}.svg`
  ).fsPath;

  let tmpStr = `![${chipName}](${chipImg})`;
  tmpStr += `&nbsp;&nbsp;${text} / Lvl ${chip.level}`;
  tmpStr += `&nbsp;&nbsp;&nbsp;&nbsp;![](${star}) ${chip.cost}`;
  tmpStr += `&nbsp;&nbsp;![](${cooldown}) ${chip.cooldown} (initial ${chip.initial_cooldown})&nbsp;&nbsp;`;
  message.push(tmpStr);

  tmpStr = "Effects:  \n  \n";
  chip.effects.forEach((e, i) => {
    const mods = getEffectModifiers(e.modifiers);
    const minDmg = e.value1;
    const maxDmg = e.value1 + e.value2;
    tmpStr += `**${EffectType[e.id]}** | `;
    tmpStr += minDmg > 0 ? `**${minDmg}` : `   &nbsp;   `;
    tmpStr +=
      minDmg > 0 && maxDmg !== minDmg
        ? ` - ${maxDmg}**`
        : minDmg > 0
          ? "**"
          : "";
    tmpStr += i === 0 ? `  \n:--- | :---  \n` : "  \n";
    if (mods.length) {
      tmpStr += `   &nbsp;   | _${mods.join("_, _")}_  \n`;
    }
  });
  message.push(tmpStr);

  tmpStr = `Range: ${chip.min_range}`;
  if (chip.min_range < chip.max_range) {
    tmpStr += ` to ${chip.max_range}`;
  }
  tmpStr += `&nbsp;&nbsp;&nbsp;&nbsp;${Area[chip.area]}`;
  message.push(`${tmpStr}  \n${spaces}![](${img})${spaces}`);

  return message;
}
