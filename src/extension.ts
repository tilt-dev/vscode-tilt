import net = require('net');
import { spawn } from 'child_process';

import { commands, window, workspace, ExtensionContext, OutputChannel, Disposable, } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient;
let disposeClient: Disposable;

export function activate(context: ExtensionContext) {
	const sharedArgs = ["start", "--builtin-paths=" + context.asAbsolutePath("data/api.py")]
	const outputChannel = window.createOutputChannel('Tiltfile LSP');

	registerCommands(context, outputChannel);

	const serverOptions: ServerOptions = () => {
		return isLspServerListening().then((listening: boolean) => new Promise((res) => {
			if (listening) {
				outputChannel.appendLine("Connect to existing server");
				const socket = net.connect({host: "127.0.0.1", port: defaultLspPort});
				res({writer: socket, reader: socket});
			} else {
				outputChannel.appendLine("Starting child process");
				res(spawn("starlark-lsp", sharedArgs.concat(["--verbose", "--debug"])));
			}
		}))
	};

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
	disposeClient = client.start();

	outputChannel.appendLine("Tiltfile LSP started");
	outputChannel.show(true);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

const defaultLspPort = 8765;
let wasListening = false;

function isLspServerListening(): Promise<boolean> {
	return new Promise((resolve) => {
		const checkListen = () => {
			var server = net.createServer(function(socket) {
				socket.write("\r\n");
				socket.pipe(socket);
			});
			server.on('error', function () {
				wasListening = true;
				resolve(true);
			});
			server.on('listening', function () {
				server.close();
				resolve(false);
			});
			server.listen(defaultLspPort, '127.0.0.1');
		}

		if (wasListening) {
			setTimeout(checkListen, 2500);
		} else {
			checkListen();
		}
	});
}

function registerCommands(context: ExtensionContext, ch: OutputChannel) {
	context.subscriptions.push(commands.registerCommand("tiltfile.restartServer", () => {
		ch.appendLine("Restarting server 1");
		client.stop().catch((e) => {
			ch.appendLine("Error restarting: " + e);
		}).then(() => {
			disposeClient.dispose();
			ch.appendLine("Restarting server 2");
			wasListening = false;
			disposeClient = client.start();
		});
	}));
}
