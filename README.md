# Official Tiltfile VSCode Extension

The `Tiltfile` extension provides an improved editing experience for `Tiltfile` authors.

![](assets/vscode-extension.gif)

This extension is currently in alpha state and might feel a bit buggy here and there. If you've encountered any issues, please check the [known issues](https://github.com/tilt-dev/vscode-tilt/issues) first and give the appropriate one a 👍‍. If your issue has not previously been reported, please [add a new one](https://github.com/tilt-dev/vscode-tilt).

## Features

- Starlark syntax highlighting
- Autocomplete for `Tiltfile` functions
- Signature support for `Tiltfile` functions

## Requirements

- Tilt version >[v0.26.0](https://github.com/tilt-dev/tilt/releases/tag/v0.26.0)

## Dev Mode
- To run the VSCode extension locally, check out our [CONTRIBUTING](https://github.com/tilt-dev/vscode-tilt/blob/main/CONTRIBUTING.md) guide

## Extension Settings

This extension contributes the following settings:

### LSP

* `tiltfile.trace.server`: controls logging level for LSP requests/responses (valid values: `off`, `messages`, `compact`, `verbose`)
