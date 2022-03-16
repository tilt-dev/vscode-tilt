import { spawn } from 'child_process';
import { BaseLanguageClient } from 'vscode-languageclient';
import { getTiltPath } from './config';

type SemVersion = { major: number, minor: number, patch: number, extra: string };

function versionString(ver: SemVersion): string {
	return `${ver.major}.${ver.minor}.${ver.patch}${ver.extra}`;
}

const versionRegexp = /^v(\d+)\.(\d+)\.(\d+)([^ ,]?)/;

export async function checkTiltVersion(client: BaseLanguageClient): Promise<string> {
	const tiltPath = getTiltPath();
	let error: Error;
	try {
		const version = await tiltVersion(tiltPath);
		if (compatibleVersion(version)) {
			client.info(`Found Tilt version ${versionString(version)}`);
			return tiltPath;
		}
		error = new Error(`Tilt version ${versionString(version)} not compatible.`);
	} catch (e) {
		error = e;
	}

	throw error;
}

function tiltVersion(path: string): Promise<SemVersion> {
	return new Promise((res, rej) => {
		const proc = spawn(path, ["version"]);
		let output = "";
		proc.stdout.on('data', data => {
			output = output + data;
		})
		proc.on('error', err => {
			rej(err);
		});
		proc.on('close', code => {
			if (code !== 0) {
				rej(new Error(`${path} exited with non-zero status`));
			}
			const version = output.match(versionRegexp);
			if (version === null) {
				rej(new Error(`${path} gave unexpected version output`));
			}
			res({
				major: parseInt(version[1]),
				minor: parseInt(version[2]),
				patch: parseInt(version[3]),
				extra: version[4]
			});
		})
	});
}

function compatibleVersion(version: SemVersion): boolean {
	return version.major > 0 ||
		(version.major === 0 && version.minor >= 26);
}
