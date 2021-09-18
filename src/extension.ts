// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { DownloadRemoteFiles } from "./commands/DownloadRemoteFiles";
import { getAccount } from "./login";
import {
  createRemoteFile,
  updateRemoteFileOnSave,
  deleteRemoteFile
} from "./events/fileEvents";
import { debounce } from "./helpers/debounce";
import { getFromWorkspaceState } from "./helpers/fileTreeState";
import { debug } from "./debug";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // debug(context.globalStorageUri, context.storageUri);
  const leekAccount = await getAccount(context);
  if (!leekAccount) {
    return;
  }
  debug(leekAccount);

  const state = await getFromWorkspaceState(context);
  debug("begin state", state);

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
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    debounce(updateRemoteFileOnSave.bind(null, state!), 5000)
  );
  vscode.workspace.onDidCreateFiles(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    createRemoteFile.bind(null, context, state!)
  );
  vscode.workspace.onDidDeleteFiles(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    deleteRemoteFile.bind(null, context, state!)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  );
  vscode.workspace.onWillRenameFiles((e: vscode.FileWillRenameEvent) => {
    debug(e.files);
  });
}

// this method is called when your extension is deactivated
// export function deactivate() { }
