import { ExtensionContext } from 'vscode';
import { TiltfileErrorWatcher } from './tiltfile-error-watcher';

import { TiltfileLspClient } from './tiltfile-lsp-client';

let client: TiltfileLspClient;
let tiltfileErrorWatcher: TiltfileErrorWatcher;

export function activate(context: ExtensionContext) {
	client = new TiltfileLspClient(context);
	client.start();
	tiltfileErrorWatcher = new TiltfileErrorWatcher(context);
	tiltfileErrorWatcher.start();

}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

