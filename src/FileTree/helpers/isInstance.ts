import { FolderState, AIState } from "@/FileTree/types/states";

export function instanceOfFolderState(object: any): object is FolderState {
  const obj = object as FolderState;
  return obj.ais !== undefined && obj.folders !== undefined;
}

export function instanceOfAIState(object: any): object is AIState {
  const obj = object as AIState;
  return obj.parentFolder !== undefined;
}
