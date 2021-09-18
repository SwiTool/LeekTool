import * as vscode from "vscode";
import { Api } from "../LeekApi";
import {
  AIState,
  FileTreeState,
  FolderState,
  instanceOfFolderState
} from "../FileTreeState";
import { AIContent } from "../types/FileTree";
import { setToWorkspaceState, getFileInfo } from "../helpers/fileTreeState";
import { getElementPath } from "../helpers/workspace";
import { debug } from "../debug";

function addAIToTreeState(
  state: FileTreeState,
  folderPath: string,
  ai: AIContent
): string {
  if (!state[folderPath] || !instanceOfFolderState(state[folderPath])) {
    return "";
  }
  const parentFolder = folderPath ? folderPath + "/" : "";
  const path = `${parentFolder}${ai.name}.leek`;
  const aiState = <AIState>{
    id: ai.id,
    name: ai.name,
    valid: ai.valid,
    total_lines: ai.total_lines,
    entrypoints: [],
    folder: state[folderPath].id,
    total_chars: 0,
    parentFolder: folderPath,
    path: path
  };
  state[path] = aiState;
  (state[folderPath] as FolderState).ais.push(aiState);
  return path;
}

function removeAIFromTreeState(
  state: FileTreeState,
  folderPath: string,
  fileName: string
) {
  if (!state[folderPath] || !instanceOfFolderState(state[folderPath])) {
    return "";
  }
  const path = `${folderPath ? folderPath + "/" : ""}${fileName}`;
  const aiIndex = (state[folderPath] as FolderState).ais.findIndex(
    (a: AIState) => a.name === fileName
  );
  if (aiIndex !== -1) {
    (state[folderPath] as FolderState).ais.splice(aiIndex, 1);
  }
  if (state[path]) {
    delete state[path];
  }
}

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
