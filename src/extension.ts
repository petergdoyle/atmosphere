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
}

export function deactivate() {}
