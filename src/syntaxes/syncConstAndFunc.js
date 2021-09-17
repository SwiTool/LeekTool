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
    const file = await fs.readFile(syntaxFile);
    const config = JSON.parse(file.toString());
    config.patterns[7].match = `\\b(${consts})\\b`;
    config.patterns[8].match = `\\b(${funcs})\\b`;
    await fs.writeFile(syntaxFile, Buffer.from(JSON.stringify(config)));
}

async function main() {
    const funcs = await getDoc('function');
    const funcsString = Array.from(new Set(funcs.map(func => func.name))).join('|');
    const consts = await getDoc('constant');
    const constsString = Array.from(new Set(consts.map(const_ => const_.name))).join('|');
    updateConfigFile(constsString, funcsString);
}

main();
