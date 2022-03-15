import { Uri, window, workspace } from "vscode";

const SECTION = 'tiltfile';

export function getConfig(uri?: Uri) {
	if (!uri) {
		if (window.activeTextEditor) {
			uri = window.activeTextEditor.document.uri;
		} else {
			uri = null;
		}
	}
	return workspace.getConfiguration(SECTION, uri);
}

export type Port = number | null;
export function getServerPort(): Port {
	return getConfig().get<Port>('server.port');
}

export function getTrace(): string {
	return getConfig().get<string>('trace.server');
}
