import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Atmosphere extension is now active!');

    const sidebarProvider = new SidebarProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            "atmosphere.chatView",
            sidebarProvider
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('atmosphere.startChat', () => {
            vscode.commands.executeCommand('workbench.view.extension.atmosphere-sidebar');
        })
    );

    const registerContextCommand = (commandId: string, actionName: string) => {
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

    context.subscriptions.push(
        registerContextCommand('atmosphere.explainSelection', 'explain'),
        registerContextCommand('atmosphere.fixSelection', 'fix'),
        registerContextCommand('atmosphere.generateTests', 'generateTests')
    );
}

export function deactivate() {}
