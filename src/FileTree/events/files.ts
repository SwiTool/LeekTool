import * as vscode from "vscode";
import { Api } from "@/LeekAPI";
import { FileTreeState } from "@/FileTree/types/states";
import { getElementPath } from "@/commons/helpers/workspace";
import { debug } from "@/commons/helpers/debug";
import { setToWorkspaceState } from "@/FileTree/helpers/workspace";
import { getFileInfo } from "@/FileTree/helpers/fileInfo";
import {
  addAIToTreeState,
  removeAIFromTreeState
} from "@/FileTree/helpers/treeManagement";

async function updateRemoteFile(ai_id: number, code: string) {
  await Api.aiSave(ai_id, code);
}
export async function updateRemoteFileOnSave(
  state: FileTreeState,
  e: vscode.TextDocumentWillSaveEvent
) {
  const filePath = getElementPath(e.document.uri.path);

  if (state[filePath]) {
    const ai = state[filePath];
    await Api.aiSave(ai.id, e.document.getText());
  }
}

export async function createRemoteFile(
  context: vscode.ExtensionContext,
  state: FileTreeState,
  e: vscode.FileCreateEvent
) {
  e.files.forEach(async (file: vscode.Uri) => {
    const { folderPath, officialName } = getFileInfo(file);
    const folderId = state[folderPath].id;
    const code =
      "/**\n *\n * This file was created using LeekTool 😎\n * \n**/\n\n";

    const aiContent = (await Api.aiNewName(folderId, 0, officialName)).ai;
    const ai = (await Api.aiGetFarmerAi(aiContent.id)).ai;
    ai.code = code;

    addAIToTreeState(state, folderPath, ai);
    await vscode.workspace.fs.writeFile(file, Buffer.from(code));
    await updateRemoteFile(ai.id, code);
    setToWorkspaceState(context, state);
    // debug(state);
  });
}

export async function deleteRemoteFile(
  context: vscode.ExtensionContext,
  state: FileTreeState,
  e: vscode.FileDeleteEvent
) {
  e.files.forEach(async (file: vscode.Uri) => {
    const { folderPath, fileName } = getFileInfo(file);
    const path = `${folderPath ? folderPath + "/" : ""}${fileName}`;
    debug("before delete", path, state);
    const ai = state[path];
    debug("ai", ai);
    await Api.aiDelete(ai.id);
    removeAIFromTreeState(state, folderPath, fileName);
    debug("after delete", state);
    setToWorkspaceState(context, state);
  });
}
