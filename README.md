# Official Tiltfile VSCode Extension

The `Tiltfile` extension provides an improved editing experience for `Tiltfile` authors.

![](assets/vscode-extension.gif)

This extension is currently in alpha state and might feel a bit buggy here and there. If you've encountered any issues, please check the [known issues](https://github.com/tilt-dev/vscode-tilt/issues) first and give the appropriate one a 👍‍. If your issue has not previously been reported, please [add a new one](https://github.com/tilt-dev/vscode-tilt).

## Features

- Starlark syntax highlighting
- Autocomplete for `Tiltfile` functions
- Signature support for `Tiltfile` functions
- Hover support for docstrings
- When Tilt is running, highlight Tiltfile execution errors in VSCode
- VSCode status bar button to open the Tilt UI in a browser

## Requirements

- Tilt version >[v0.26.0](https://github.com/tilt-dev/tilt/releases/tag/v0.26.0)

## Dev Mode

- To run the VSCode extension locally, check out our [CONTRIBUTING][contributing] guide

## Extension Settings

This extension contributes the following settings:

### Tiltfile

- `tiltfile.trace.server`: Control the logging level for language server requests/responses (valid values: `off` (default), `verbose`, `debug`).
- `tiltfile.server.port`: Set the number of the port where an existing Tilt language server is running. For use while [developing the Tiltfile extension][contributing].
- `tiltfile.tilt.path`: Set the path of the Tilt executable to use as the language server. Defaults to using the `tilt` binary that is found in the environment.
- `tiltfile.showStatusBarButton`: Show a button in the VSCode status bar to open the Tilt WebUI. (default true)
- `tiltfile.tilt.webui.port`: When opening the Tilt WebUI, the port to use (default 10350)

[contributing]: https://github.com/tilt-dev/vscode-tilt/blob/main/CONTRIBUTING.md
