import { Area } from "@/GameDefinitions/types/Area";
import {
  Effect,
  EffectModifier,
  EffectType
} from "@/GameDefinitions/types/Effect";
import { constantDetailsState } from "@/GameDefinitions/commands/syncLeekwarsVersion";
import * as vscode from "vscode";

const areaToRange: Record<string, string | null> = {
  SINGLE_CELL: null,
  LASER_LINE: null,
  CIRCLE1: "t1_0_1",
  CIRCLE2: "t1_0_2",
  CIRCLE3: "t1_0_3",
  PLUS_2: "t0_0_2",
  PLUS_3: "t0_0_3",
  X_1: "t2_0_1",
  X_2: "t2_0_2",
  X_3: "t2_0_3",
  SQUARE_1: "t3_0_1",
  SQUARE_2: "t3_0_2",
  FIRST_INLINE: null
};

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

function getEffectTypeLang(effect: Effect) {
  const minDmg = effect.value1;
  const maxDmg = effect.value1 + effect.value2;
  const type = effect.id;
  const fixed = minDmg === maxDmg;
  const lang =
    constantDetailsState.lang[`type_${type}${fixed ? "_fixed" : ""}`];

  if (!lang) {
    return EffectType[type];
  }

  let str = lang.replace("%d", minDmg.toString());
  if (!fixed) {
    str = str.replace("%d", maxDmg.toString());
  }
  return str;
}

function getEffectTargets(target: number) {
  const ts = Object.values(constantDetailsState.constants).filter(v =>
    v.name.includes("EFFECT_TARGET_")
  );
  if (!ts.length || target === 31) {
    return "";
  }
  const descs: string[] = [];
  ts.forEach(t => {
    if ([0, 4].includes(+t.value)) {
      return;
    }
    if ((target & +t.value) === +t.value) {
      descs.push(t.description);
    }
  });
  return descs.join("  \n");
}

export function getChipHover(text: string): string[] {
  const message = [];
  const chipName = text.substr(5).toLocaleLowerCase();

  const chip = constantDetailsState.chips[chipName];
  if (!chip) {
    return [];
  }
  const imgFolder = `${__dirname}/../../../images`;
  const cooldown = vscode.Uri.file(`${imgFolder}/cooldown.svg`).fsPath;
  const star = vscode.Uri.file(`${imgFolder}/star.svg`).fsPath;
  const chipImg = vscode.Uri.file(`${imgFolder}/chip/${chipName}.png`).fsPath;
  const img = vscode.Uri.file(
    `${imgFolder}/area/t${chip.launch_type}_${chip.min_range}_${chip.max_range}.svg`
  ).fsPath;
  const area = areaToRange[Area[chip.area]];
  const areaImg = area
    ? vscode.Uri.file(`${imgFolder}/area/${area}.svg`).fsPath
    : null;

  let tmpStr = `![${chipName}](${chipImg})`;
  tmpStr += `&nbsp;&nbsp;${text} / Lvl ${chip.level}`;
  tmpStr += `&nbsp;&nbsp;&nbsp;&nbsp;![](${star}) ${chip.cost}`;
  tmpStr += `&nbsp;&nbsp;![](${cooldown}) ${chip.cooldown} (initial ${chip.initial_cooldown})&nbsp;&nbsp;`;
  message.push(tmpStr);

  tmpStr = "Effects:  \n  \n";
  chip.effects.forEach(e => {
    const mods = getEffectModifiers(e.modifiers);
    tmpStr += `**${getEffectTypeLang(e)}**  \n`;
    tmpStr += `${getEffectTargets(e.targets)}  \n`;
    if (mods.length) {
      tmpStr += ` &nbsp; | _${mods.join("_, _")}_  \n`;
    }
  });
  message.push(tmpStr);

  tmpStr = `Range: ${chip.min_range}`;
  if (chip.min_range < chip.max_range) {
    tmpStr += ` to ${chip.max_range}`;
  }

  tmpStr = `${tmpStr}  \n  \n![](${img})`;
  if (areaImg) {
    tmpStr += ` | &nbsp;&nbsp;&nbsp;&nbsp;![](${areaImg})&nbsp;&nbsp;&nbsp;&nbsp; |  \n --- | ---`;
  }
  message.push(tmpStr);

  return message;
}
