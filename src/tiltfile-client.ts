import net = require('net');
import { ChildProcess, spawn } from 'child_process';
import { commands, ExtensionContext, window, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient/node';

const debugLspPort  = 8760;
const extensionLang = 'tiltfile';
const extensionName = 'Tiltfile LSP';

export class TiltfileClient extends LanguageClient {
	private wasListening = false;

	public constructor(private context: ExtensionContext) {
		super(extensionLang, extensionName,
			  () => this.serverOptions(),
			  TiltfileClient.clientOptions());
		this.registerCommands();
	}

	static clientOptions(): LanguageClientOptions {
		const ch = window.createOutputChannel(extensionName);
		return {
			documentSelector: [{ scheme: 'file', language: extensionLang }],
			synchronize: {
				// Notify the server about file changes to relevant files contained in the workspace
				fileEvents: workspace.createFileSystemWatcher('**/Tiltfile')
			},
			outputChannel: ch,
			traceOutputChannel: ch
		};
	}

	async serverOptions(): Promise<ChildProcess|StreamInfo> {
		return this.isDebugLspServerListening().then((listening: boolean) => new Promise((res) => {
			if (listening) {
				this.info("Connect to debug server");
				const socket = net.connect({host: "127.0.0.1", port: debugLspPort});
				res({writer: socket, reader: socket});
			} else {
				const sharedArgs = ["start", "--builtin-paths=" + this.context.asAbsolutePath("data/api.py")]
				this.info("Starting child process");
				res(spawn("starlark-lsp", sharedArgs.concat(["--verbose", "--debug"])));
			}
		}));
	}

	isDebugLspServerListening(): Promise<boolean> {
		return new Promise((resolve) => {
			const checkListen = () => {
				var server = net.createServer(function(socket) {
					socket.write("\r\n");
					socket.pipe(socket);
				});
				server.on('error', () => {
					this.wasListening = true;
					resolve(true);
				});
				server.on('listening', () => {
					server.close();
					resolve(false);
				});
				server.listen(debugLspPort, '127.0.0.1');
			}

			if (this.wasListening) { // wait for server to restart
				setTimeout(checkListen, 2500);
			} else {
				checkListen();
			}
		});
	}

	public registerCommands() {
		this.context.subscriptions.push(commands.registerCommand("tiltfile.restartServer", () => {
			this.info("Restarting server");
			this.stop().catch(e => this.warn(e)).then(() => this.start());
		}));
	}
}
