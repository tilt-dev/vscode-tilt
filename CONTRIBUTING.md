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

The extension is published via CircleCI.

To create a new release $VERSION (e.g., v0.0.3):
1. Edit package.json and bump the "version" field to $VERSION. Commit that change to master.
2. `git tag -a $VERSION -m $VERSION && git push origin $VERSION`
3. A CircleCI job will detect the tag and build and publish the new version of the extension. You can observe that here: https://app.circleci.com/pipelines/github/tilt-dev/vscode-tilt

### Updating the token used for CI publishing

CI authenticates via a VSCode Personal Access Token (PAT). These have a max lifetime of 1 year. When authentication fails due to expiry (nb: the auth error probably won't specify it's due to expiry), to update the token:

1. Make sure you're a member of the Tilt Dev org. Go
   [here](https://dev.azure.com/tilt-dev/_usersSettings/tokens). If you get an
   error, your account needs to be added by email address.
   
2. Make sure you're a member of the Tilt Dev publisher. Go
   [here](https://marketplace.visualstudio.com/manage/publishers/tilt-dev). If
   you get an error, your account needs to be added by account id. 
   Go to https://marketplace.visualstudio.com/vs and 
   mouse over your name/email in the upper right to get your account id.
   
3. Generate a new token
   [here](https://dev.azure.com/tilt-dev/_usersSettings/tokens) using [these
   instructions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token).

4. Update the value of the `VSCE_PAT` environment variable in
   [circleci](https://app.circleci.com/settings/organization/github/tilt-dev/contexts/e2b4fe60-602e-4bcb-8be9-b7865ee6af95)
