import { debug } from "./debug";
import * as vscode from "vscode";
import { Api } from "./LeekApi";

export async function login(context: vscode.ExtensionContext) {
  const conf = vscode.workspace.getConfiguration("leektool");
  const username = conf.get("username") as string;
  const password = conf.get("password") as string;

  if (!conf) {
    vscode.window.showErrorMessage("Cannot load LeekTool configuration");
    return null;
  }

  if (!username || !password) {
    const result = await vscode.window.showWarningMessage(
      "Please enter your credentials under leektool.username and leektool.password",
      "Go to configuration"
    );
    if (result) {
      vscode.commands.executeCommand("workbench.action.openSettings2");
    }
    return null;
  }

  try {
    const leekAccount = await Api.farmerLoginToken(username, password);
    if (leekAccount) {
      Api.setToken(leekAccount.token);
      context.workspaceState.update("token", leekAccount.token);
    }
    return leekAccount;
  } catch (e: any) {
    vscode.window.showErrorMessage(e?.message);
    console.error(e?.message);
    return null;
  }
}

export async function getAccount(context: vscode.ExtensionContext) {
  const token = context.workspaceState.get<string>("token");

  if (token) {
    Api.setToken(token);
    try {
      return await Api.farmerGetFromToken();
    } catch (err) {
      debug(`Invalid token, retrying with username/password`);
    }
  }
  return login(context);
}
