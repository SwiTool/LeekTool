import * as vscode from "vscode";
import { getElementPath } from "./workspace";
import { DownloadRemoteFiles } from "../commands/DownloadRemoteFiles";
import { FileTreeState, instanceOfFolderState } from "../FileTreeState";
import { debug } from "../debug";

export function getFileInfo(file: vscode.Uri) {
  const filePath = getElementPath(file.path);
  const cutPath = filePath.split("/");
  const fileName = cutPath.pop();
  if (!fileName) {
    return {
      fileName: "",
      folderPath: "",
      officialName: ""
    };
  }
  let officialName = fileName;
  if (fileName.endsWith(".leek")) {
    officialName = fileName.replace(new RegExp(".leek$"), "");
  }
  const folderPath = cutPath.join("/");

  return {
    officialName,
    folderPath,
    fileName
  };
}

export async function getFromWorkspaceState(context: vscode.ExtensionContext) {
  let state = context.workspaceState.get<FileTreeState>("fileTree");
  if (state === undefined) {
    state = await DownloadRemoteFiles(context);
  }
  state = <FileTreeState>state;
  for (const folder of Object.values(state)) {
    if (!instanceOfFolderState(folder)) {
      continue;
    }
    for (const ai of folder.ais) {
      state[ai.path] = ai;
    }
  }
  return state;
}

export async function setToWorkspaceState(
  context: vscode.ExtensionContext,
  state: FileTreeState
) {
  const tmpState: FileTreeState = {};
  for (const [key, entry] of Object.entries(state)) {
    if (!instanceOfFolderState(entry)) {
      continue;
    }
    tmpState[key] = entry;
  }
  debug("storing workspaceState", tmpState);

  await context.workspaceState.update("fileTree", tmpState);
}
