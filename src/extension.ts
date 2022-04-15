import { ExtensionContext, window } from "vscode"
import { addTiltLinkToStatusBar } from "./tilt-link"
import { TiltfileErrorWatcher } from "./tiltfile-error-watcher"
import { TiltfileLspClient } from "./tiltfile-lsp-client"

const extensionName = "tiltfile"

let client: TiltfileLspClient
let tiltfileErrorWatcher: TiltfileErrorWatcher

export function activate(context: ExtensionContext) {
  const ch = window.createOutputChannel(extensionName)
  client = new TiltfileLspClient(context, ch)
  client.start()
  tiltfileErrorWatcher = new TiltfileErrorWatcher(context, ch)
  tiltfileErrorWatcher.start()
  addTiltLinkToStatusBar(context)
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined
  }
  return client.stop()
}
