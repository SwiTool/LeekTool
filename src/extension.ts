import * as vscode from "vscode";
import { debounce } from "./commons/helpers/debounce";
import { debug } from "./commons/helpers/debug";
import {
  createRemoteFile,
  deleteRemoteFile,
  updateRemoteFileOnSave
} from "@/FileTree/events/files";
import { DownloadRemoteFiles } from "./FileTree/commands/DownloadRemoteFiles";
import { getFromWorkspaceState } from "./FileTree/helpers/workspace";
import { LeekAPI } from "./LeekAPI";
import { getAccount } from "./LeekAPI/helpers/login";
import { getChipHover } from "./Provider/hover/helpers/hovers";
import { syncLeekwarsVersion } from "./GameDefinitions/commands/syncLeekwarsVersion";
import IntellisenseProvider from "./Provider/completion/CompletionProvider";

export async function activate(context: vscode.ExtensionContext) {
  LeekAPI.context = context;
  await syncLeekwarsVersion(context);
  const leekAccount = await getAccount(context);
  if (!leekAccount) {
    return;
  }
  debug(leekAccount);

  const state = await getFromWorkspaceState(context);
  debug("begin state", state);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "leektool.downloadRemoteFiles",
      DownloadRemoteFiles.bind(null, context)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "leektool.syncLeekwarsVersion",
      syncLeekwarsVersion.bind(null, context)
    )
  );

  vscode.languages.registerCompletionItemProvider(
    IntellisenseProvider.languageSelector,
    new IntellisenseProvider()
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
