const fs = require("fs").promises;
const path = require("path");
const _got = require("got");

const got = _got.extend({
  prefixUrl: "https://leekwars.com/"
});

const snippetFile = path.join(__dirname, "leekscript.json");

async function getDocDefinition(type) {
  const data = await got.get(`api/${type}/get-all`).json();
  return data[`${type}s`];
}

async function getDocDescription() {
  const data = await got.get(`api/lang/get/documentation/fr`).json();
  return data.lang;
}

async function updateSnippetFile(docObj) {
  const snippetObj = {};
  for (const key in docObj) {
    for (const [index, value] of docObj[key].entries()) {
      const keyName = index > 0 ? `${key}_${index}` : key;
      snippetObj[keyName] = {
        prefix: value.name,
        body:
          value.type === "constant"
            ? value.name
            : `${value.name}(${value.arguments.map(a => a.name).join(", ")})`,
        description: value.description
      };
    }
  }
  await fs.writeFile(
    snippetFile,
    Buffer.from(JSON.stringify(snippetObj, null, 2))
  );
}

function docArrayToObj(docDefinitions) {
  const docObj = {};
  for (const def of docDefinitions) {
    def.type = def.type ? "constant" : "function";
    if (def.type === "function") {
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
    }

    if (!docObj[def.name]) {
      docObj[def.name] = [def];
    } else {
      docObj[def.name].push(def);
    }
  }
  return docObj;
}

function addDescription(docObj, docDesc) {
  for (const key in docObj) {
    const arg = docObj[key];

    for (const [index, value] of arg.entries()) {
      const keyword = value.type === "function" ? "func" : "const";
      const objKey = `${keyword}_${key}${index === 0 ? "" : `_${index + 1}`}`;
      value.description = docDesc[objKey];
      delete docDesc[objKey];

      const objReturnKey = `${objKey}_return`;
      if (docDesc[objReturnKey]) {
        value.return.description = docDesc[objReturnKey];
        delete docDesc[objReturnKey];
      }

      for (const argsIndex in value.arguments) {
        const argKey = `${objKey}_arg_${+argsIndex + 1}`;
        if (docDesc[argKey]) {
          value.arguments[argsIndex].description = docDesc[argKey];
          delete docDesc[argKey];
        }
      }
    }
  }
}

async function main() {
  const docDesc = await getDocDescription();
  const funcDefinitions = await getDocDefinition("function");
  const constDefinitions = await getDocDefinition("constant");
  const docDefinitions = [...constDefinitions, ...funcDefinitions];
  const docObj = docArrayToObj(docDefinitions);
  addDescription(docObj, docDesc);
  updateSnippetFile(docObj);
}

main();
