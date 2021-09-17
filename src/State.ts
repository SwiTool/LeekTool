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
/*


state = {
  "$path": Folder | AI
}

/User/.../leekscript/.../folder

state[old_path] => folder
state[new_path] => folder

state[new_path] = state.pop(old_path)





function update_folder_path(folder, new_path) {
  folder.path = new_path/folder.name;
  for (const ai of folder.ais) {
    delete state[ai.path];
    ai.path = folder.path/ai.name.leek
    state[ai.path] = ai;
  }

  for (const folder of folder.folders) {
    update_folder_path(folder, folder.path);
  }
}

update_folder_path()




*/
