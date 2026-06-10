"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const SidebarProvider_1 = require("./SidebarProvider");
function activate(context) {
    console.log('Atmosphere extension is now active!');
    const sidebarProvider = new SidebarProvider_1.SidebarProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("atmosphere.chatView", sidebarProvider));
    context.subscriptions.push(vscode.commands.registerCommand('atmosphere.startChat', () => {
        vscode.commands.executeCommand('workbench.view.extension.atmosphere-sidebar');
    }));
    const registerContextCommand = (commandId, actionName) => {
        return vscode.commands.registerCommand(commandId, () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showInformationMessage('No active editor found.');
                return;
            }
            const selection = editor.selection;
            const text = editor.document.getText(selection);
            if (!text || text.trim() === '') {
                vscode.window.showInformationMessage('Please select some code first.');
                return;
            }
            vscode.commands.executeCommand('workbench.view.extension.atmosphere-sidebar');
            sidebarProvider.postMessageToWebview({
                type: 'editorCommand',
                command: actionName,
                code: text
            });
        });
    };
    context.subscriptions.push(registerContextCommand('atmosphere.explainSelection', 'explain'), registerContextCommand('atmosphere.fixSelection', 'fix'), registerContextCommand('atmosphere.generateTests', 'generateTests'));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map