# Medward TriggerPad

A numpad sampler for Windows: assign audio to each numpad key, crop it on a waveform, and trigger it from anywhere.

**Download:** `dist/MedwardTriggerPad-Setup-2.0.0.exe` (installer) or `dist/MedwardTriggerPad.exe` (portable).

## Build (from Linux or Windows)

```sh
go run ./tools/genassets                       # icon, splash, installer art
go-winres make --in winres/winres.json --arch amd64
GOOS=windows GOARCH=amd64 go build -ldflags="-s -w -H windowsgui" -o dist/MedwardTriggerPad.exe .
makensis installer/installer.nsi               # -> dist/MedwardTriggerPad-Setup-2.0.0.exe
```

Settings are stored in `%APPDATA%\Medward TriggerPad\pads.cfg`.
