import * as vscode from "vscode";
import { Api } from "../LeekApi";
import { FileTreeState } from "../State";

export async function UpdateRemoteFileOnSave(
  state: FileTreeState,
  e: vscode.TextDocumentWillSaveEvent
) {
  // console.log(e.document.uri);
  const paths = vscode.workspace.workspaceFolders![0].uri.path.split("/");
  const currentFolder = paths[paths.length - 1];
  const filePath = e.document.uri.path.split(currentFolder)[1].substr(1);
  if (state[filePath]) {
    const ai = state[filePath];
    await Api.aiSave(ai.id, e.document.getText());
  }
}
