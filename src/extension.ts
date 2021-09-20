import * as vscode from "vscode";
import { DownloadRemoteFiles } from "./commands/DownloadRemoteFiles";
import { getAccount } from "./login";
import { getFromWorkspaceState } from "./helpers/fileTreeState";
import { debug } from "./debug";
import { loadAllConstantDetails } from "./states/ConstantsDetailsState";
import { getChipHover } from "./helpers/hovers";
import { debounce } from "./helpers/debounce";
import {
  createRemoteFile,
  deleteRemoteFile,
  updateRemoteFileOnSave
} from "./events/fileEvents";

export async function activate(context: vscode.ExtensionContext) {
  const leekAccount = await getAccount(context);
  if (!leekAccount) {
    return;
  }
  debug(leekAccount);

  const state = await getFromWorkspaceState(context);
  debug("begin state", state);

  await loadAllConstantDetails();

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "leektool.downloadRemoteFiles",
      DownloadRemoteFiles.bind(null, context)
    )
  );

  vscode.languages.registerHoverProvider("leekscript v1.1", {
    provideHover(document, position) {
      const range = document.getWordRangeAtPosition(position);
      const text = document.getText(range);
      const message: string[] = [];
      if (text.startsWith("CHIP_")) {
        message.push(...getChipHover(text));
      }
      return new vscode.Hover(message.map(m => new vscode.MarkdownString(m)));
    }
  });

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

// export function deactivate() { }
