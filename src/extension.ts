/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { window, workspace, ExtensionContext } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	const sharedArgs = ["start", "--builtin-paths=" + context.asAbsolutePath("data/api.py")]

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	const serverOptions: ServerOptions = {
		run: {
			command: "starlark-lsp",
			args: sharedArgs.concat(["--verbose"]),
			transport: TransportKind.stdio
		},
		debug: {
			command: "starlark-lsp",
			args: sharedArgs.concat(["--debug"]),
			transport: TransportKind.stdio
		}
	};

	let outputChannel = window.createOutputChannel('Tiltfile LSP');

	// Options to control the language client
	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: 'file', language: 'tiltfile' }],
		synchronize: {
			// Notify the server about file changes to relevant files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/Tiltfile')
		},
		outputChannel: outputChannel,
		traceOutputChannel: outputChannel
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'tiltfile',
		'Tiltfile LSP',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();

	outputChannel.appendLine("Tiltfile LSP started");
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
