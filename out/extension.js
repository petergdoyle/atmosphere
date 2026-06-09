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
}
function deactivate() { }
//# sourceMappingURL=extension.js.map