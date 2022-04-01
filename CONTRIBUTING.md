# Contributing

## Development

1. [Install Tilt](https://docs.tilt.dev/install.html)
2. Open this project (`vscode-tilt`) in Visual Studio Code
3. Press `F5` or `Run > Start Debugging`

To reload the extension, use `Ctrl-R` (`⌘-R`). To reload the language server process only, use the command palette and run the "Restart Tiltfile LSP Server" command.

### Language server

The language server functionality is built into Tilt itself via the `tilt lsp` command. If you want to work on the language server, most of it is implemented by the [tilt-dev/starlark-lsp][starlark-lsp] library. To develop the language server:

1. Configure the Tiltfile VS Code extension to communicate with a development LSP server by setting the port in the Tiltfile extension settings (`tiltfile.server.port`) to `8760`
2. Ensure you have Go 1.17 or higher installed
3. Clone [tilt-dev/starlark-lsp][starlark-lsp] and run `tilt up` in the repository directory

[starlark-lsp]: https://github.com/tilt-dev/starlark-lsp

The [`Tiltfile` in the starlark-lsp repository](/tilt-dev/starlark-lsp/blob/main/Tiltfile) is set up to run the language server and automatically recompile on changes. The VS Code extension has extra handling to detect when the language server stops or disconnects and automatically reconnects to it. If it fails to reconnect (for example, due to a compile error), use the "Restart Tiltfile LSP Server" command (mentioned above) to reconnect to your development language server.

## Publishing the extension to the VSCode Marketplace

The extension is published via `vsce publish`.
Setup:
1. Install vsce (per vs docs above) ([docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#installation).
2. Get access to the tilt-dev VSCode Marketplace publisher
  1. Log into VSCode Marketplace and get your user ID as described [here](https://docs.microsoft.com/en-us/visualstudio/extensibility/walkthrough-publishing-a-visual-studio-extension?view=vs-2022#troubleshoot-adding-a-user-to-the-publisher-account).
  2. Ask a team member who already has access to the publisher to add your user ID to the publisher [here](https://marketplace.visualstudio.com/manage/publishers/tilt-dev).
3. Set up a Personal Access Token ([docs](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token).
