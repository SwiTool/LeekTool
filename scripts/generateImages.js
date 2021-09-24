const fs = require("fs");
const got = require("got");
const sharp = require("sharp");

const SQUARE_SIZE = 10;

function getCellsArea(type, min, max) {
  const cells = [];
  for (let i = 0; i < max * 2 + 1; ++i) {
    cells[i] = [];
    for (let j = 0; j < max * 2 + 1; ++j) {
      const x = Math.abs(i - max);
      const y = Math.abs(j - max);
      if (type === 2) {
        cells[i][j] = x === y;
      } else if (type === 3) {
        cells[i][j] = x <= max || y <= max;
      } else {
        cells[i][j] =
          x + y <= max && x + y >= min && (type === 1 || x === 0 || y === 0);
      }
    }
  }
  return cells;
}

function generateAllTypes(cb) {
  const r = [];
  for (let z = 0; z < 4; ++z) {
    for (let x = 0; x < 15; ++x) {
      for (let y = 0; y < 15; ++y) {
        if (x <= y) {
          r.push(cb(z, x, y));
        }
      }
    }
  }
  return r;
}

const results = generateAllTypes((type, min, max) => {
  const cells = getCellsArea(type, min, max);

  const size = SQUARE_SIZE * (max * 2 + 1) + (max + 1) * 2;
  const restrainedSize = size > 200 ? 200 : size;
  let svg = `<svg viewBox="0 0 ${size} ${size}" width="${restrainedSize}" height="${restrainedSize}" xmlns="http://www.w3.org/2000/svg">`;
  cells.forEach((line, lineIndex) => {
    line.forEach((filled, columnIndex) => {
      const x = columnIndex * SQUARE_SIZE + columnIndex + 1;
      const y = lineIndex * SQUARE_SIZE + lineIndex + 1;
      const color = filled ? "#eee" : "#323232";
      svg += `<rect x="${x}" y="${y}" width="${SQUARE_SIZE}" height="${SQUARE_SIZE}" rx="3" ry="3" style="fill: ${color}" />`;
    });
  });
  svg += "</svg>";
  return {
    type,
    min,
    max,
    svg
  };
});

// GENERATE AREAS SVG

console.log("Generating area svg...");
fs.mkdirSync("../src/images/area", { recursive: true });
results.forEach(res => {
  fs.writeFileSync(
    `../src/images/area/t${res.type}_${res.min}_${res.max}.svg`,
    res.svg
  );
});

// GENERATE CHIPS IMG

console.log("Downloading chips...");
fs.mkdirSync("../src/images/chip", { recursive: true });
got
  .get("https://leekwars.com/api/chip/get-all")
  .json()
  .then(data => {
    Object.values(data.chips).forEach(c => {
      got
        .get(`https://leekwars.com/image/chip/${c.name}.png`)
        .buffer()
        .then(r => {
          sharp(r).resize(32, 32).toFile(`../src/images/chip/${c.name}.png`);
        });
    });
  });
