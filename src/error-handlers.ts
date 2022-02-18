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

export class TiltfileErrorHandler extends PlaceholderErrorHandler {
	constructor(private client: TiltfileClient, maxRestartCount: number) {
		super();
		this.delegate = this.client.createDefaultErrorHandler(maxRestartCount);
	}

    closed(): CloseAction {
		// default error handler backs off after several restarts;
		// always restart when using the debug server
		if (this.client.usingDebugServer) {
			return CloseAction.Restart;
		}
		return this.delegate.closed();
    }
}
