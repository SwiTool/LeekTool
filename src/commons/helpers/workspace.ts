import * as vscode from "vscode";

export function getElementPath(fsPath: string) {
  const paths = vscode.workspace.workspaceFolders![0].uri.path.split("/");
  const currentFolder = paths[paths.length - 1];
  const elementPath = fsPath.split(currentFolder)[1].substr(1);
  return elementPath;
}
