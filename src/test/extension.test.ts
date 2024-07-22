import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { CopilotLikeViewProvider } from "../CopilotLikeViewProvider";
import { OpenAI } from "openai";

suite("Copilot-like Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Extension should be present", () => {
    assert.ok(
      vscode.extensions.getExtension("suresofttech.vscode-extension-example"),
    );
  });

  test("Commands should be registered", async () => {
    const extension = vscode.extensions.getExtension(
      "suresofttech.vscode-extension-example",
    );
    await extension?.activate();

    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes("copilotLike.resetHistory"));
    assert.ok(commands.includes("copilotLike.showMessage"));
  });

  test("CopilotLikeViewProvider should handle messages", async () => {
    const mockContext = {
      subscriptions: [],
      extensionUri: vscode.Uri.file(__dirname),
      globalState: {
        get: sinon.stub().returns([]),
        update: sinon.stub(),
      },
    };

    const createStub = sinon.stub().resolves({
      choices: [{ message: { content: "Test response" } }],
    });

    const mockOpenAI = {
      chat: {
        completions: {
          create: createStub,
        },
      },
    } as unknown as OpenAI;

    const provider = new CopilotLikeViewProvider(
      mockContext.extensionUri,
      mockOpenAI,
      mockContext as any,
    );

    const mockWebview = {
      postMessage: sinon.stub(),
      onDidReceiveMessage: sinon.stub(),
      html: "",
      options: {},
      asWebviewUri: sinon
        .stub()
        .returns(vscode.Uri.parse("https://mock.webview.uri")),
    };

    const mockWebviewView = {
      webview: mockWebview,
    };

    // CopilotLikeViewProvider의 _getHtmlForWebview 메서드를 모의 구현으로 대체
    sinon
      .stub(provider, "_getHtmlForWebview" as any)
      .returns("<html><body>Mock HTML</body></html>");

    await provider.resolveWebviewView(
      mockWebviewView as any,
      {} as any,
      {} as any,
    );

    // Simulate receiving a message
    const messageHandler = mockWebview.onDidReceiveMessage.args[0][0];
    await messageHandler({
      type: "showMessage",
      value: "Test message",
    });

    assert.strictEqual(createStub.callCount, 1);
    assert.ok(
      mockWebview.postMessage.calledWith({
        type: "response",
        value: "Test response",
      }),
    );
  });
});
