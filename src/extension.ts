import { ExtensionContext } from 'vscode';

import { TiltfileClient } from './tiltfile-client';

let client: TiltfileClient;

export function activate(context: ExtensionContext) {
	client = new TiltfileClient(context);
	client.start();
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

