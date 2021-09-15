// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as leek from './leek';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	const conf = vscode.workspace.getConfiguration('leektool');
	if (!conf) {
		return vscode.window.showErrorMessage('Cannot load LeekTool configuration');
	}
	
	const username = conf.get('username') as string;
	const password = conf.get('password') as string;

	if (!username || !password) {
		const result = await vscode.window.showWarningMessage('Please enter your credentials under leektool.username and leektool.password', 'Go to configuration');
		if (result) {
			vscode.commands.executeCommand('workbench.action.openSettings2');
		}
		return;
	}

	try {
		const res = await leek.farmerLoginToken(username, password);
		context.workspaceState.update('token', res.token);
	} catch (e) {
		console.error(e);
	}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('leektool.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from leektool!');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
