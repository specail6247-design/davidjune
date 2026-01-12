# davidjune

A simple HTML/JS/CSS starter template

## AI tool auto-install/update

Daily auto-install/update scripts live in `scripts/`. Edit `scripts/ai-tools.conf` if your install commands differ.
To check whether the tools are installed, run:

```bash
./scripts/ai-tools-status.sh
```

### macOS (LaunchAgent)

Run once to set a daily schedule (defaults to 03:00):

```bash
./scripts/install-macos-launchagent.sh 3 0
```

Logs land in `~/.local/state/ai-tools-update.log`.

### Firebase Studio (startup script)

Use this as the workspace startup command:

```bash
bash /path/to/your/repo/scripts/firebase-startup.sh
```
