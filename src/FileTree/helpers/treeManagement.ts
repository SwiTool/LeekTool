import { AIState, FileTreeState, FolderState } from "@/FileTree/types/states";
import { instanceOfFolderState } from "@/FileTree/helpers/isInstance";
import { AIContent } from "@/types/FileTree";

export function addAIToTreeState(
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

export function removeAIFromTreeState(
  state: FileTreeState,
  folderPath: string,
  fileName: string
) {
  if (!state[folderPath] || !instanceOfFolderState(state[folderPath])) {
    return;
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
