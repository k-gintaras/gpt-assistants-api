# Copilot Instructions

## Terminal Commands
Always append `; echo ""` to terminal commands to ensure Copilot detects the command end by forcing a newline after the output.

Example: `npm run test; echo ""`

## Long-Running or Noisy Commands
For commands that produce a lot of output or run for a long time, redirect output to a file to avoid prompt detection issues:

`command > output.log 2>&1`

Then use the `read_file` tool to read the output.

Example: `go test ./mypkg > /tmp/output.log 2>&1`

## Shell Recommendations
- Use minimal bash (no .bashrc or themes) for most stability.
- On Windows, prefer PowerShell over Git Bash if possible.
- If using PowerShell, ensure PSReadLine is enabled: `Import-Module PSReadLine`
- Avoid zsh with custom themes like powerlevel10k.

## VS Code Settings (Windows)
If PSReadLine is disabled, add to settings.json:
```json
{
  "accessibility.signals.terminalCommandFailed": { "sound": "off" },
  "accessibility.signals.terminalCommandSucceeded": { "sound": "off" },
  "accessibility.verbosity.terminal": false
}
```
Restart VS Code and run `Import-Module PSReadLine`.

## Fallback
If stuck, manually paste the output to Copilot with: "Your last command gave the output: <paste here>"