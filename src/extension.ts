// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { DownloadRemoteFiles } from "../out/commands/DownloadRemoteFiles";
import { getAccount } from "./login";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const leekAccount = await getAccount(context);
  if (!leekAccount) {
    return;
  }
  console.log(leekAccount);
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "leektool.downloadRemoteFiles",
      DownloadRemoteFiles
    )
  );

  // vscode.workspace.onWillSaveTextDocument();
  // vscode.workspace.onWillDeleteFiles();
  // vscode.workspace.onWillCreateFiles();
  // vscode.workspace.onWillChangeWorkspaceFolders();
}

// this method is called when your extension is deactivated
// export function deactivate() { }
