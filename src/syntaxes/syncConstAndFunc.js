const fs = require('fs').promises;
const path = require('path');
const _got = require('got');

const got = _got.extend({
    prefixUrl: 'https://leekwars.com/api/',
});

const syntaxFile = path.join(__dirname , 'leekscript.tmLanguage.json');


async function getDoc(type) {
    const data = await got.get(`${type}/get-all`).json();    
    return data[`${type}s`];
}

async function updateConfigFile(consts, funcs) {
    file = await fs.readFile(syntaxFile);
    config = JSON.parse(file.toString());
    config.patterns[7].match = `\\b(${consts})`;
    config.patterns[8].match = `\\b(${funcs})`;
    await fs.writeFile(syntaxFile, Buffer.from(JSON.stringify(config)));
}

async function main() {
    funcs = await getDoc('function');
    funcsString = Array.from(new Set(funcs.map(func => func.name))).join('|');
    consts = await getDoc('constant');
    constsString = consts.map(const_ => const_.name).join('|');
    updateConfigFile(constsString, funcsString);
}

main();
