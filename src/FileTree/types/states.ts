import { AI, Folder } from "../../types/FileTree";

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
