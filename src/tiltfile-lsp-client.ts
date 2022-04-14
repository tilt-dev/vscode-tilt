import net = require("net")
import { ChildProcess, spawn } from "child_process"
import {
  commands,
  Disposable,
  ExtensionContext,
  OutputChannel,
  workspace,
} from "vscode"
import {
  LanguageClient,
  LanguageClientOptions,
  StreamInfo,
} from "vscode-languageclient/node"

import { PlaceholderErrorHandler, TiltfileErrorHandler } from "./error-handlers"
import { getServerPort, getTrace, Port } from "./config"
import { checkTiltVersion } from "./tilt-version"

const extensionLang = "tiltfile"
const extensionName = "Tiltfile"
const maxRestartCount = 5
const tiltUnavailableNotification = "Tilt language server could not be started"
const tiltUnavailableMessage =
  "Could not find a version of Tilt to use with the Tiltfile extension. " +
  "Please visit https://docs.tilt.dev/install.html to install Tilt v0.26 or higher. " +
  "Autocomplete will not function without a compatible version of Tilt installed."

export class TiltfileLspClient extends LanguageClient {
  private _usingDebugServer = false

  public constructor(private context: ExtensionContext, ch: OutputChannel) {
    super(
      extensionLang,
      extensionName,
      () => this.startServer(),
      TiltfileLspClient.clientOptions(ch)
    )
    this.registerCommands()
    this.installErrorHandler()
  }

  static clientOptions(ch: OutputChannel): LanguageClientOptions {
    return {
      documentSelector: [{ scheme: "file", language: extensionLang }],
      synchronize: {
        // Notify the server about file changes to relevant files contained in the workspace
        fileEvents: workspace.createFileSystemWatcher("**/Tiltfile"),
      },
      outputChannel: ch,
      traceOutputChannel: ch,
      errorHandler: new PlaceholderErrorHandler(),
    }
  }

  public get usingDebugServer() {
    return this._usingDebugServer
  }

  public start(): Disposable {
    const disp = super.start()
    this.info("Tiltfile LSP started")
    return disp
  }

  public registerCommands() {
    this.context.subscriptions.push(
      commands.registerCommand("tiltfile.restartServer", () => {
        this.info("Restarting server")
        this.restart()
      })
    )
  }

  public restart(): void {
    this.stop()
      .catch((e) => this.warn(e))
      .then(() => this.start())
  }

  private async startServer(): Promise<ChildProcess | StreamInfo> {
    const port = await this.checkForDebugLspServer()
    if (port) {
      this.info("Connect to debug server")
      this._usingDebugServer = true
      this.outputChannel.show(true)
      const socket = net.connect({ host: "127.0.0.1", port })
      return { writer: socket, reader: socket }
    }

    try {
      const tiltPath = await checkTiltVersion(this)
      const args = ["lsp", "start"]
      this.info("Starting child process")
      const trace = getTrace()
      switch (trace) {
        case "verbose":
          args.push("--verbose")
          break
        case "debug":
          this.outputChannel.show(true)
          args.push("--debug")
          break
      }
      return spawn(tiltPath, args)
    } catch (e) {
      this.warn(tiltUnavailableMessage)
      this.outputChannel.show()
      window.showErrorMessage(tiltUnavailableNotification)
      throw e.toString()
    }
  }

  private async checkForDebugLspServer(): Promise<Port> {
    const port = getServerPort()
    if (!port) {
      return null
    }
    return new Promise((resolve) => {
      const checkListen = () => {
        var server = net.createServer()
        server.on("error", () => resolve(port))
        server.on("listening", () => {
          server.close()
          resolve(null)
        })
        server.listen(port, "127.0.0.1")
      }

      if (this.usingDebugServer) {
        // wait for server to restart
        setTimeout(checkListen, 2500)
      } else {
        checkListen()
      }
    })
  }

  private installErrorHandler() {
    const placeholder = this.clientOptions
      .errorHandler as PlaceholderErrorHandler
    placeholder.delegate = new TiltfileErrorHandler(this, maxRestartCount)
  }
}
