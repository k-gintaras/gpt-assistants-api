Terminal check utilities

Run the terminal check script to verify the integrated terminal shell, PATH, and simple timed output.

Usage (in VS Code integrated terminal set to Git Bash):

```bash
./tools/terminal-check.sh
cat tools/terminal-check-output.txt
```

What it checks:
- Prints detected SHELL and Bash version
- Checks if `git` and `bash` are on PATH
- Runs a 3-step timed tick test to verify waiting and output capture

If you want, I can add a VS Code task to run this from the Command Palette.
