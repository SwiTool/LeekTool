import * as vscode from "vscode";

export function getCellsArea(min: number, max: number, type: number) {
  const cells: boolean[][] = [];
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

export function renderMarkdownArea(min: number, max: number, type: number) {
  const cells = getCellsArea(min, max, type);
  const fullCell = vscode.Uri.file(
    `${__dirname}/../images/cellEmpty.png`
  ).fsPath;
  const emptyCell = vscode.Uri.file(
    `${__dirname}/../images/cellFull.png`
  ).fsPath;

  let cellString = "";
  for (const line of cells) {
    for (const column of line) {
      const bg = column ? fullCell : emptyCell;
      cellString += `![](${bg})&nbsp;&nbsp;`;
    }
    cellString += "  \n";
  }

  return cellString;
}
