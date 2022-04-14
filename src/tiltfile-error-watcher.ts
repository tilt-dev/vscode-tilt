import * as vscode from "vscode"
import { spawn, ChildProcessWithoutNullStreams } from "child_process"
import { Disposable, ExtensionContext } from "vscode"
import split2 from "split2"
import { parseTiltfileError, Location } from "./tiltfile-error-parser"

// path to print tiltfile errors from the Tilt API Session object, one error per line
const tiltfileErrorJsonPath =
  "{.status.targets[?(@.name=='tiltfile:update')].state.terminated}{'\\n'}"

const reconnectIntervalMS = 5000

// watches the Tilt session for errors in the (Tiltfile) resource and reports them to vscode as error diagnostics
export class TiltfileErrorWatcher implements Disposable {
  private diagnostics: vscode.DiagnosticCollection
  private tiltWatch: ChildProcessWithoutNullStreams
  private reconnectTimeout: NodeJS.Timeout | undefined
  private output: vscode.OutputChannel

  public constructor(
    private context: ExtensionContext,
    ch: vscode.OutputChannel
  ) {
    this.output = ch
    this.diagnostics = vscode.languages.createDiagnosticCollection("tiltfile")
    context.subscriptions.push(this.diagnostics)
  }

  start() {
    const p = spawn("tilt", [
      "get",
      `-ojsonpath=${tiltfileErrorJsonPath}`,
      "--watch",
      "session",
      "Tiltfile",
    ])
    p.stderr.setEncoding("utf8")
    p.stderr.on("data", (data) => {
      this.output.appendLine(`tilt session api stderr: ${data}`)
    })
    p.stdout.setEncoding("utf8")

    p.stdout.pipe(split2()).on("data", (data) => {
      if (data.length > 0) {
        try {
          const terminated = JSON.parse(data)
          const result = parseTiltfileError(terminated.error)
          this.diagnostics.clear()
          if (result) {
            const { message, locations } = result
            locations.forEach((location) => {
              const uri = vscode.Uri.file(location.path)
              this.diagnostics.set(uri, [
                tiltfileErrorToDiagnostic(message, location),
              ])
            })
          }
        } catch (error) {
          this.output.appendLine(
            `tilt session watch: error processing session json: ${error}`
          )
        }
      }
    })
    p.on("close", (code) => {
      this.output.appendLine(`tilt session watch exited w/ code ${code}`)
      this.tiltWatch = null
      this.ensureReconnecting()
    })
    p.on("error", (error) => {
      this.output.appendLine(`tilt session watch errored: ${error}`)
      this.tiltWatch = null
      this.ensureReconnecting()
    })
    this.tiltWatch = p
  }

  private ensureReconnecting() {
    if (!this.reconnectTimeout) {
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectTimeout = null
        this.start()
      }, reconnectIntervalMS)
    }
  }

  dispose() {
    if (this.tiltWatch) {
      this.tiltWatch.kill("SIGINT")
    }
  }
}

function tiltfileErrorToDiagnostic(
  message: string,
  location: Location
): vscode.Diagnostic {
  const line = location.line
  const col = location.col
  return {
    message: message,
    range: new vscode.Range(line - 1, col - 1, line - 1, col - 1),
    severity: vscode.DiagnosticSeverity.Error,
  }
}
