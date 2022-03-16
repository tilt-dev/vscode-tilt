import { Uri, window, workspace } from "vscode";

export const TILT = 'tilt';
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

export function getTiltPath(): string {
	const path = getConfig().get<string>('tilt.path');
	if (path === null) return TILT;
	return path;
}
