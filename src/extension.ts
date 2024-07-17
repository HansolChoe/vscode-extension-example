import * as vscode from 'vscode';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-extension-example" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('vscode-extension-example.helloWorld', () => {
		// Create and show a new webview
		const panel = vscode.window.createWebviewPanel(
			'vscode-extension-example', 
			'Hello World', 
			vscode.ViewColumn.One, 
			{
				enableScripts: true
			}
		);

		// Set the HTML content for the webview
		panel.webview.html = getWebviewContent(panel.webview, context.extensionUri);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
	const reactAppPathOnDisk = vscode.Uri.joinPath(extensionUri, 'dist', 'bundle.js');
	const reactAppUri = webview.asWebviewUri(reactAppPathOnDisk);

	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Hello React</title>
	</head>
	<body>
		<div id="root"></div>
		<script src="${reactAppUri}"></script>
	</body>
	</html>`;
}
