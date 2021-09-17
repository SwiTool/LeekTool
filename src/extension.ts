// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { DownloadRemoteFiles } from "./commands/DownloadRemoteFiles";
import { getAccount } from "./login";
import { FileTreeState } from "./State";
import { Api } from "./LeekApi";
import { UpdateRemoteFileOnSave } from "./events/UpdateRemoteFileOnSave";
import { debounce } from "./utils/debounce";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // console.log(context.globalStorageUri, context.storageUri);
  const leekAccount = await getAccount(context);
  if (!leekAccount) {
    return;
  }
  console.log(leekAccount);

  let state = context.workspaceState.get<FileTreeState>("fileTree");
  if (state === undefined) {
    state = await DownloadRemoteFiles(context);
  }

  console.log("begin state", state);

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "leektool.downloadRemoteFiles",
      DownloadRemoteFiles.bind(null, context)
    )
  );

  vscode.workspace.onWillSaveTextDocument(
    debounce(UpdateRemoteFileOnSave.bind(null, state!), 5000)
  );
  // vscode.workspace.onWillDeleteFiles();
  // vscode.workspace.onWillCreateFiles();
  vscode.workspace.onWillRenameFiles((e: vscode.FileWillRenameEvent) => {
    console.log(e.files);
  });
}

// this method is called when your extension is deactivated
// export function deactivate() { }
