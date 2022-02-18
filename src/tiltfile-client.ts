import net = require('net');
import { ChildProcess, spawn } from 'child_process';
import { commands, Disposable, ExtensionContext, window, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient/node';

import { PlaceholderErrorHandler, TiltfileErrorHandler } from './error-handlers';

const debugLspPort  = 8760;
const extensionLang = 'tiltfile';
const extensionName = 'Tiltfile LSP';
const maxRestartCount = 5;

export class TiltfileClient extends LanguageClient {
	private _usingDebugServer = false;

	public constructor(private context: ExtensionContext) {
		super(extensionLang, extensionName,
			  () => this.serverOptions(),
			  TiltfileClient.clientOptions());
		this.registerCommands();
		this.installErrorHandler();
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
			traceOutputChannel: ch,
			errorHandler: new PlaceholderErrorHandler(),
		};
	}

	public get usingDebugServer() {
		return this._usingDebugServer;
	}

	public start(): Disposable {
		const disp = super.start()
		this.info("Tiltfile LSP started");
		return disp
	}

	public registerCommands() {
		this.context.subscriptions.push(commands.registerCommand("tiltfile.restartServer", () => {
			this.info("Restarting server");
			this.stop().catch(e => this.warn(e)).then(() => this.start());
		}));
	}

	private async serverOptions(): Promise<ChildProcess|StreamInfo> {
		return this.isDebugLspServerListening().then((listening: boolean) => new Promise((res) => {
			if (listening) {
				this.info("Connect to debug server");
				this._usingDebugServer = true;
				this.outputChannel.show(true);
				const socket = net.connect({host: "127.0.0.1", port: debugLspPort});
				res({writer: socket, reader: socket});
			} else {
				const sharedArgs = ["start", "--builtin-paths=" + this.context.asAbsolutePath("data/api.py")]
				this.info("Starting child process");
				res(spawn("starlark-lsp", sharedArgs.concat(["--verbose", "--debug"])));
			}
		}));
	}

	private isDebugLspServerListening(): Promise<boolean> {
		return new Promise((resolve) => {
			const checkListen = () => {
				var server = net.createServer();
				server.on('error', () => resolve(true));
				server.on('listening', () => { server.close(); resolve(false); });
				server.listen(debugLspPort, '127.0.0.1');
			}

			if (this.usingDebugServer) { // wait for server to restart
				setTimeout(checkListen, 2500);
			} else {
				checkListen();
			}
		});
	}

	private installErrorHandler() {
		const placeholder = this.clientOptions.errorHandler as PlaceholderErrorHandler;
		placeholder.delegate = new TiltfileErrorHandler(this, maxRestartCount);
	}
}
