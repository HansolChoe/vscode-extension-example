import * as vscode from 'vscode';
import { OpenAI } from 'openai';

export class CopilotLikeViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'copilotLikeView';

  private _view?: vscode.WebviewView;
  private chatHistory: { role: 'system' | 'user' | 'assistant', content: string }[] = [
    { role: 'system', content: 'You are a friendly assistant.' }
  ];

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly openai: OpenAI
  ) { }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ): Promise<void> {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async data => {
        switch (data.type) {
          case 'showMessage':
            try {
                this.chatHistory.push({ role: 'user', content: data.value });
                const completion = await this.openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: this.chatHistory,
                });
                const reply = completion.choices[0].message.content;
                if (reply) {
                    this.chatHistory.push({ role: 'assistant', content: reply });
                    webviewView.webview.postMessage({ type: 'response', value: reply });
                } else {
                    throw new Error('No reponse from OpenAI');
                }
            } catch (error) {
                console.error('Error calling OpenAI API:', error);
                webviewView.webview.postMessage({ type: 'response', value: 'Error calling OpenAI API' });
            }
            break;
        }
      });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'bundle.js'));

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Copilot-like View</title>
      </head>
      <body>
        <div id="root"></div>
        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}