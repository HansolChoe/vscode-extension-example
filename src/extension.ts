import * as vscode from 'vscode';
import { CopilotLikeViewProvider } from './CopilotLikeViewProvider';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import path from 'path';

// dotenv를 사용해 환경 변수를 로드합니다.
dotenv.config({ path: path.resolve(__dirname, '../.env') });

if (!process.env.OPENAI_API_KEY) {
	throw new Error('OpenAI API key is not set');
}

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});

export function activate(context: vscode.ExtensionContext) {
  const provider = new CopilotLikeViewProvider(context.extensionUri, openai);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(CopilotLikeViewProvider.viewType, provider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('copilotLike.showMessage', () => {
      vscode.window.showInformationMessage('Message from Copilot-like extension!');
    })
  );
}

export function deactivate() {}