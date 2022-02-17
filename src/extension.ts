import { ExtensionContext } from 'vscode';

import { TiltfileClient } from './tiltfile-client';

let client: TiltfileClient;

export function activate(context: ExtensionContext) {
	const client = new TiltfileClient(context);
	client.start();
	client.outputChannel.appendLine("Tiltfile LSP started");
	client.outputChannel.show(true);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

