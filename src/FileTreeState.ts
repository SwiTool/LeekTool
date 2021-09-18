import { AI, Folder } from "./types/FileTree";

export type FolderState = Folder & {
  ais: AIState[];
  folders: FolderState[];
  path: string;
};

export type AIState = AI & {
  parentFolder: string;
  path: string;
};

export type FileTreeState = Record<string, FolderState | AIState>;

export function instanceOfFolderState(object: any): object is FolderState {
  const obj = object as FolderState;
  return obj.ais !== undefined && obj.folders !== undefined;
}

export function instanceOfAIState(object: any): object is AIState {
  const obj = object as AIState;
  return obj.parentFolder !== undefined;
}
