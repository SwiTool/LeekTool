import * as vscode from "vscode";
import { Api } from "../LeekApi";
import { FarmerAIs } from "../types/Farmer";
import {
  FileTreeState,
  FolderState,
  AIState,
  instanceOfFolderState
} from "../states/FileTreeState";
import { setToWorkspaceState } from "../helpers/fileTreeState";
import { debug } from "../debug";

const state: FileTreeState = {};

async function createDirectories(farmerAis: FarmerAIs) {
  const files = await vscode.workspace.fs.readDirectory(
    vscode.Uri.file(vscode.workspace.workspaceFolders![0].uri.path)
  );
  for (const [name] of files) {
    await vscode.workspace.fs.delete(
      vscode.Uri.file(
        `${vscode.workspace.workspaceFolders?.[0]?.uri.path}/${name}`
      ),
      {
        recursive: true
      }
    );
  }

  const baseFolderState: FolderState = {
    id: 0,
    folder: -1,
    name: "",
    path: "",
    folders: [],
    ais: []
  };

  const folders = farmerAis.folders.reduce((value, c) => {
    value[c.id] = { ...c, path: c.name, ais: [], folders: [] };
    return value;
  }, {} as Record<number, FolderState>);
  folders[0] = baseFolderState;
  debug(folders);

  function myRecFunc(folder: FolderState): string {
    debug(folder.folder);

    if (
      folders[folder.folder].folders.findIndex(f => f.id === folder.id) === -1
    ) {
      folders[folder.folder].folders.push(folder);
    }
    if (folder.folder) {
      return `${myRecFunc(folders[folder.folder])}/${folder.name}`;
    }
    return folder.path;
  }

  const sortedFolders = Object.values(folders)
    .map(v => {
      v.path = v.folder > -1 ? myRecFunc(v) : v.name;
      return v;
    })
    .sort((a, b) => a.path.split("/").length - b.path.split("/").length);

  for (const v of sortedFolders) {
    const folderToCreate = `${vscode.workspace.workspaceFolders?.[0]?.uri.path}/${v.path}`;
    state[v.path] = v;
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(folderToCreate));
  }
}

async function createFiles(farmerAis: FarmerAIs) {
  for (const ai of farmerAis.ais) {
    const file = await Api.aiGetFarmerAi(ai.id);

    const folder = Object.values(state).find(f => {
      if (instanceOfFolderState(f)) {
        return f.id === ai.folder;
      }
      return false;
    });
    if (!folder || !instanceOfFolderState(folder)) {
      return;
    }
    if (!file.ai.name.endsWith(".leek")) {
      file.ai.name += ".leek";
    }
    const path = (folder.path ? folder.path + "/" : "") + file.ai.name;
    const aiState = { ...ai, parentFolder: folder.path, path } as AIState;
    if (folder.ais.findIndex(a => a.id === ai.id) === -1) {
      folder.ais.push(aiState);
    }
    state[path] = aiState;
    const fileToCreate = `${vscode.workspace.workspaceFolders?.[0]?.uri.path}/${path}`;
    vscode.workspace.fs.writeFile(
      vscode.Uri.file(fileToCreate),
      Buffer.from(file.ai.code)
    );
  }
}

export async function DownloadRemoteFiles(context: vscode.ExtensionContext) {
  const ais = await Api.aiGetFarmerAis();

  await createDirectories(ais);
  await createFiles(ais);
  await setToWorkspaceState(context, state);

  console.dir(state, { depth: null });
  return state;
}
