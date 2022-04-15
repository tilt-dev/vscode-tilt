import * as vscode from "vscode"
import { getShowStatusBarButton, getTiltWebUIPort } from "./config"

let statusBarItem: vscode.StatusBarItem

export function addTiltLinkToStatusBar({
  subscriptions,
}: vscode.ExtensionContext) {
  const commandId = "tilt.openWebUI"
  subscriptions.push(
    vscode.commands.registerCommand(commandId, () => {
      console.log(`port: ${getTiltWebUIPort()}`)
      vscode.env.openExternal(
        vscode.Uri.parse(`http://localhost:${getTiltWebUIPort()}`)
      )
    })
  )

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  )
  statusBarItem.text = "$(globe) Tilt"
  statusBarItem.tooltip = "Open the Tilt WebUI"
  statusBarItem.command = commandId
  subscriptions.push(statusBarItem)
  subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(() => {
      console.log("workspace configuration changed")
      updateStatusBarItem()
    })
  )
  updateStatusBarItem()
}

function updateStatusBarItem() {
  const b = getShowStatusBarButton()
  if (getShowStatusBarButton()) {
    statusBarItem.show()
  } else {
    statusBarItem.hide()
  }
}
