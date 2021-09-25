import * as vscode from "vscode";
import got from "got";
import {
  ConstantDetailsState,
  DocObj,
  DocDef
} from "@/GameDefinitions/types/ConstantDetails";
import { Api } from "@/LeekAPI";
import { Chip } from "@/GameDefinitions/types/Chip";
import { Weapon } from "@/GameDefinitions/types/Weapon";
import { Constants } from "@/GameDefinitions/types/Constants";
import { Functions } from "@/GameDefinitions/types/Functions";

export const constantDetailsState: ConstantDetailsState = {
  chips: {},
  weapons: {},
  constants: {},
  functions: {},
  lang: {},
  version: 0
};

export async function loadAllConstantDetails() {
  const { chips } = await Api.chipGetAll();
  const { weapons } = await Api.weaponGetAll();
  constantDetailsState.chips = Object.values(chips).reduce((v, chip) => {
    v[chip.name] = chip;
    return v;
  }, {} as Record<string, Chip>);
  constantDetailsState.weapons = Object.values(weapons).reduce((v, weapon) => {
    v[weapon.name] = weapon;
    return v;
  }, {} as Record<string, Weapon>);
}

async function getDocDescription() {
  const data: DocDef = await got
    .get(
      `https://raw.githubusercontent.com/leek-wars/leek-wars/master/src/lang/doc.fr.lang`,
      {
        headers: {
          accept: "application/json"
        }
      }
    )
    .json();

  const result: DocObj = {
    constants: {},
    functions: {},
    lang: {}
  };
  for (const index of Object.keys(data)) {
    if (index.substr(0, 5) === "const") {
      result.constants[index] = data[index] as Constants;
    } else if (index.substr(0, 4) === "func") {
      result.functions[index] = data[index] as Functions[];
    } else {
      result.lang[index] = data[index];
    }
  }
  return result;
}

function docArrayToObj(docDefinitions: DocDef) {
  const docObj: DocObj = {
    constants: {},
    functions: {},
    lang: {}
  };
  for (const defType of Object.keys(docDefinitions)) {
    for (const def of docDefinitions[defType]) {
      // def.type = def.type ? "constant" : "function";
      if (defType === "functions") {
        def.arguments = [];
        if (def.arguments_names && def.arguments_names.length) {
          for (const index in def.arguments_names) {
            def.arguments.push({
              name: def.arguments_names[index],
              type: def.arguments_types[index],
              description: null
            });
          }
        }
        def.return = {};
        if (def.return_type && def.return_name) {
          def.return = {
            name: def.return_name,
            type: def.return_type,
            description: null
          };
        }

        delete def.arguments_names;
        delete def.arguments_types;
        delete def.return_name;
        delete def.return_type;
        if (!docObj.functions[def.name]) {
          docObj.functions[def.name] = [def];
        } else {
          docObj.functions[def.name].push(def);
        }
      } else {
        docObj.constants[def.name] = def;
      }
    }
  }
  return docObj;
}

function addDescription(docObj: DocObj, docDesc: DocDef) {
  for (const [name, value] of Object.entries(docObj.constants)) {
    const objKey = `const_${name}`;
    value.description = docDesc.constants[objKey];
    delete docDesc.constants[objKey];
  }

  for (const funcObj of Object.keys(docObj.functions)) {
    for (const [index, value] of docObj.functions[funcObj].entries()) {
      const objKey = `func_${funcObj}${index === 0 ? "" : `_${index + 1}`}`;
      value.description = docDesc.functions[objKey];
      delete docDesc.functions[objKey];

      const objReturnKey = `${objKey}_return`;
      if (docDesc.functions[objReturnKey]) {
        value.return.description = docDesc.functions[objReturnKey];
        delete docDesc.functions[objReturnKey];
      }

      for (const argsIndex in value.arguments) {
        const argKey = `${objKey}_arg_${+argsIndex + 1}`;
        if (docDesc.functions[argKey]) {
          value.arguments[argsIndex].description = docDesc.functions[argKey];
          delete docDesc.functions[argKey];
        }
      }
    }
  }
}

async function loadLang(docDesc: DocDef) {
  const { lang } = await Api.langGet("effect");
  for (const [k, value] of Object.entries(
    docDesc.lang as Record<string, string>
  )) {
    constantDetailsState.lang[k] = value;
  }
  for (const [k, value] of Object.entries(lang)) {
    constantDetailsState.lang[k] = value;
  }
}

export async function syncLeekwarsVersion(context: vscode.ExtensionContext) {
  const { version } = await Api.leekWarsVersion();
  const state =
    context.workspaceState.get<ConstantDetailsState>("gameConstants");
  if (state && state.version === version) {
    constantDetailsState.functions = state.functions;
    constantDetailsState.constants = state.constants;
    constantDetailsState.weapons = state.weapons;
    constantDetailsState.chips = state.chips;
    constantDetailsState.lang = state.lang;
    constantDetailsState.version = state.version;
    return;
  }
  loadAllConstantDetails();
  constantDetailsState.version = version;
  const docDesc = await getDocDescription();
  const funcDefinitions = (await Api.functionGetAll()).functions;
  const constDefinitions = (await Api.constantGetAll()).constants;
  const docObj = docArrayToObj({
    constants: constDefinitions,
    functions: funcDefinitions
  });
  addDescription(docObj, docDesc);
  loadLang(docDesc);
  constantDetailsState.constants = docObj.constants;
  constantDetailsState.functions = docObj.functions;
  await context.workspaceState.update("gameConstants", constantDetailsState);
}
