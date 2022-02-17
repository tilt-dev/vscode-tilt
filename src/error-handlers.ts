import { CloseAction, ErrorAction, ErrorHandler, Message } from "vscode-languageclient";
import { TiltfileClient } from "./tiltfile-client";

export class PlaceholderErrorHandler implements ErrorHandler {
	public delegate: ErrorHandler;

	error(error: Error, message: Message, count: number): ErrorAction {
		return this.delegate.error(error, message, count);
	}

	closed(): CloseAction {
		return this.delegate.closed();
	}
}

export class TiltfileErrorHandler implements ErrorHandler {
	private delegate: ErrorHandler

	constructor(private client: TiltfileClient, maxRestartCount: number) {
		this.delegate = this.client.createDefaultErrorHandler(maxRestartCount)
	}

    error(error: Error, message: Message, count: number): ErrorAction {
		return this.delegate.error(error, message, count);
    }

    closed(): CloseAction {
		if (this.client.usingDebugServer) { // always restart when using the debug server
			return CloseAction.Restart;
		}
		return this.delegate.closed();
    }
}
