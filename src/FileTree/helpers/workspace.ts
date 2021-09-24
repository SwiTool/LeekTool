import * as vscode from "vscode";
import { debug } from "@/commons/helpers/debug";
import { FileTreeState } from "@/FileTree/types/states";
import { instanceOfFolderState } from "@/FileTree/helpers/isInstance";
import { DownloadRemoteFiles } from "@/FileTree/commands/DownloadRemoteFiles";

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
