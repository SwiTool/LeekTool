import * as vscode from "vscode";
import { Api } from "../LeekApi";
import { FarmerAIs } from "../types/Farmer";

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

  const folders: Record<number, any> = {};

  farmerAis.folders.forEach((v: any) => {
    v.path = v.name;
    folders[v.id] = v;
  });

  function myRecFunc(folder: any): string {
    if (folder.folder) {
      return `${myRecFunc(folders[folder.folder])}/${folder.name}`;
    }
    return folder.path;
  }

  farmerAis.folders = Object.values(folders)
    .map(v => {
      if (v.folder) {
        v.path = myRecFunc(v);
      }
      return v;
    })
    .sort((a, b) => a.path.split("/").length - b.path.split("/").length);

  for (const v of farmerAis.folders) {
    const folderToCreate = `${vscode.workspace.workspaceFolders?.[0]?.uri.path}/${v.path}`;
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(folderToCreate));
  }
}

async function createFiles(farmerAis: FarmerAIs) {
  farmerAis.ais.forEach(async ai => {
    const file = await Api.aiGetFarmerAi(ai.id);
    let path = "";

    if (ai.folder) {
      path = "/" + farmerAis.folders.find(f => f.id === ai.folder)?.path;
    }

    file.ai.name += ".leek";

    const fileToCreate = `${vscode.workspace.workspaceFolders?.[0]?.uri.path}${path}/${file.ai.name}`;
    vscode.workspace.fs.writeFile(
      vscode.Uri.file(fileToCreate),
      Buffer.from(file.ai.code)
    );
  });
}

export async function DownloadRemoteFiles() {
  const ais = await Api.aiGetFarmerAis();

  await createDirectories(ais);
  await createFiles(ais);
}
