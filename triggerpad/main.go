// TriggerPad: a numpad sampler for Windows. Assign an MP3 to each numpad key,
// optionally crop it (start/end), and trigger it by clicking or pressing the key.
// Hotkeys work globally, with NumLock on or off.
package main

import (
	"bufio"
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"syscall"
	"unsafe"
)

var (
	user32   = syscall.NewLazyDLL("user32.dll")
	kernel32 = syscall.NewLazyDLL("kernel32.dll")
	gdi32    = syscall.NewLazyDLL("gdi32.dll")
	winmm    = syscall.NewLazyDLL("winmm.dll")
	comdlg32 = syscall.NewLazyDLL("comdlg32.dll")

	pRegisterClassExW  = user32.NewProc("RegisterClassExW")
	pCreateWindowExW   = user32.NewProc("CreateWindowExW")
	pDefWindowProcW    = user32.NewProc("DefWindowProcW")
	pGetMessageW       = user32.NewProc("GetMessageW")
	pTranslateMessage  = user32.NewProc("TranslateMessage")
	pDispatchMessageW  = user32.NewProc("DispatchMessageW")
	pPostQuitMessage   = user32.NewProc("PostQuitMessage")
	pPostMessageW      = user32.NewProc("PostMessageW")
	pSendMessageW      = user32.NewProc("SendMessageW")
	pSetWindowTextW    = user32.NewProc("SetWindowTextW")
	pGetWindowTextW    = user32.NewProc("GetWindowTextW")
	pLoadCursorW       = user32.NewProc("LoadCursorW")
	pLoadIconW         = user32.NewProc("LoadIconW")
	pSetWindowsHookExW = user32.NewProc("SetWindowsHookExW")
	pCallNextHookEx    = user32.NewProc("CallNextHookEx")
	pUnhookWindowsHook = user32.NewProc("UnhookWindowsHookEx")
	pMessageBoxW       = user32.NewProc("MessageBoxW")
	pGetModuleHandleW  = kernel32.NewProc("GetModuleHandleW")
	pCreateFontW       = gdi32.NewProc("CreateFontW")
	pMciSendStringW    = winmm.NewProc("mciSendStringW")
	pGetOpenFileNameW  = comdlg32.NewProc("GetOpenFileNameW")
)

const (
	wsOverlapped   = 0x00CA0000 | 0x00010000 | 0x00020000 // caption, sysmenu, border, minimize
	wsVisible      = 0x10000000
	wsChild        = 0x40000000
	wsTabStop      = 0x00010000
	bsMultiline    = 0x2000
	esAutoHScroll  = 0x80
	wsExClientEdge = 0x200

	wmDestroy  = 0x0002
	wmSetFont  = 0x0030
	wmCommand  = 0x0111
	wmKeyDown  = 0x0100
	wmSysKeyDn = 0x0104
	wmKeyUp    = 0x0101
	wmSysKeyUp = 0x0105
	wmPlay     = 0x8001
	wmStop     = 0x8002

	idPad     = 100
	idStop    = 200
	idLoad    = 300
	idClear   = 301
	idPreview = 302
	idSave    = 303
	idStart   = 310
	idEnd     = 311
)

type wndClassEx struct {
	cbSize, style                      uint32
	lpfnWndProc                        uintptr
	cbClsExtra, cbWndExtra             int32
	hInstance, hIcon, hCursor, hbrBack uintptr
	lpszMenuName, lpszClassName        *uint16
	hIconSm                            uintptr
}

type msg struct {
	hwnd           uintptr
	message        uint32
	wParam, lParam uintptr
	time           uint32
	x, y           int32
	priv           uint32
}

type kbdHook struct {
	vk, scan, flags, time uint32
	extra                 uintptr
}

type openFileName struct {
	lStructSize                    uint32
	hwndOwner, hInstance           uintptr
	lpstrFilter, lpstrCustomFilter *uint16
	nMaxCustFilter, nFilterIndex   uint32
	lpstrFile                      *uint16
	nMaxFile                       uint32
	lpstrFileTitle                 *uint16
	nMaxFileTitle                  uint32
	lpstrInitialDir, lpstrTitle    *uint16
	flags                          uint32
	nFileOffset, nFileExtension    uint16
	lpstrDefExt                    *uint16
	lCustData, lpfnHook            uintptr
	lpTemplateName                 *uint16
	pvReserved                     uintptr
	dwReserved, flagsEx            uint32
}

type pad struct {
	label    string
	path     string
	startMs  int
	endMs    int // 0 = play to end
	lengthMs int
	loaded   bool
	btn      uintptr
}

var (
	hInst, mainWnd, font                    uintptr
	pads                                    [15]*pad
	selected                                = 7
	lblSel, lblFile, lblLen, edStart, edEnd uintptr
	keyDown                                 = map[uint32]bool{}
	cfgPath                                 string
)

func u16(s string) *uint16 { p, _ := syscall.UTF16PtrFromString(s); return p }

func mci(cmd string) (string, uintptr) {
	buf := make([]uint16, 256)
	r, _, _ := pMciSendStringW.Call(uintptr(unsafe.Pointer(u16(cmd))), uintptr(unsafe.Pointer(&buf[0])), 256, 0)
	return syscall.UTF16ToString(buf), r
}

func alias(i int) string { return fmt.Sprintf("pad%d", i) }

func create(class, text string, style uintptr, ex uintptr, x, y, w, h int, id uintptr) uintptr {
	hw, _, _ := pCreateWindowExW.Call(ex, uintptr(unsafe.Pointer(u16(class))), uintptr(unsafe.Pointer(u16(text))),
		style|wsChild|wsVisible, uintptr(x), uintptr(y), uintptr(w), uintptr(h), mainWnd, id, hInst, 0)
	pSendMessageW.Call(hw, wmSetFont, font, 1)
	return hw
}

func setText(h uintptr, s string) { pSetWindowTextW.Call(h, uintptr(unsafe.Pointer(u16(s)))) }

func getText(h uintptr) string {
	buf := make([]uint16, 64)
	pGetWindowTextW.Call(h, uintptr(unsafe.Pointer(&buf[0])), 64)
	return syscall.UTF16ToString(buf)
}

func secs(ms int) string { return strconv.FormatFloat(float64(ms)/1000, 'f', 2, 64) }

func parseSecs(s string) int {
	f, err := strconv.ParseFloat(strings.TrimSpace(strings.Replace(s, ",", ".", 1)), 64)
	if err != nil || f < 0 {
		return 0
	}
	return int(f * 1000)
}

func loadPad(i int, path string) bool {
	p := pads[i]
	mci("close " + alias(i))
	p.loaded, p.lengthMs = false, 0
	p.path = path
	if path == "" {
		return false
	}
	if _, r := mci(fmt.Sprintf(`open "%s" type mpegvideo alias %s`, path, alias(i))); r != 0 {
		return false
	}
	mci("set " + alias(i) + " time format milliseconds")
	l, _ := mci("status " + alias(i) + " length")
	p.lengthMs, _ = strconv.Atoi(strings.TrimSpace(l))
	p.loaded = true
	return true
}

func refreshPad(i int) {
	p := pads[i]
	name := "(empty)"
	if p.path != "" {
		name = filepath.Base(p.path)
		if len(name) > 18 {
			name = name[:16] + "…"
		}
		if !p.loaded {
			name = "⚠ " + name
		}
	}
	setText(p.btn, p.label+"\r\n"+name)
}

func refreshEditor() {
	p := pads[selected]
	setText(lblSel, "Selected pad:  "+p.label)
	if p.path == "" {
		setText(lblFile, "No file — click “Load MP3…”")
	} else {
		setText(lblFile, p.path)
	}
	setText(lblLen, "Length: "+secs(p.lengthMs)+" s")
	setText(edStart, secs(p.startMs))
	setText(edEnd, secs(p.endMs))
}

func play(i int) {
	p := pads[i]
	if !p.loaded {
		return
	}
	cmd := fmt.Sprintf("play %s from %d", alias(i), p.startMs)
	if p.endMs > p.startMs {
		cmd += fmt.Sprintf(" to %d", p.endMs)
	}
	mci(cmd)
}

func stopAll() {
	for i := range pads {
		if pads[i].loaded {
			mci("stop " + alias(i))
		}
	}
}

func saveCfg() {
	f, err := os.Create(cfgPath)
	if err != nil {
		return
	}
	defer f.Close()
	for i, p := range pads {
		if p.path != "" {
			fmt.Fprintf(f, "%d\t%d\t%d\t%s\n", i, p.startMs, p.endMs, p.path)
		}
	}
}

func loadCfg() {
	f, err := os.Open(cfgPath)
	if err != nil {
		return
	}
	defer f.Close()
	sc := bufio.NewScanner(f)
	for sc.Scan() {
		parts := strings.SplitN(sc.Text(), "\t", 4)
		if len(parts) != 4 {
			continue
		}
		i, _ := strconv.Atoi(parts[0])
		if i < 0 || i >= len(pads) {
			continue
		}
		pads[i].startMs, _ = strconv.Atoi(parts[1])
		pads[i].endMs, _ = strconv.Atoi(parts[2])
		loadPad(i, parts[3])
	}
}

func pickFile() string {
	buf := make([]uint16, 1024)
	filter := syscall.StringToUTF16("Audio (*.mp3;*.wav)\x00*.mp3;*.wav\x00All files\x00*.*\x00\x00")
	ofn := openFileName{
		hwndOwner:   mainWnd,
		lpstrFilter: &filter[0],
		lpstrFile:   &buf[0],
		nMaxFile:    uint32(len(buf)),
		lpstrTitle:  u16("Choose a sound for " + pads[selected].label),
		flags:       0x1000 | 0x800 | 0x8,
	}
	ofn.lStructSize = uint32(unsafe.Sizeof(ofn))
	if r, _, _ := pGetOpenFileNameW.Call(uintptr(unsafe.Pointer(&ofn))); r == 0 {
		return ""
	}
	return syscall.UTF16ToString(buf)
}

func applyCrop() {
	p := pads[selected]
	s, e := parseSecs(getText(edStart)), parseSecs(getText(edEnd))
	if p.lengthMs > 0 {
		if s > p.lengthMs {
			s = 0
		}
		if e > p.lengthMs {
			e = p.lengthMs
		}
	}
	if e != 0 && e <= s {
		e = 0
	}
	p.startMs, p.endMs = s, e
	saveCfg()
	refreshEditor()
}

// Maps a key event to a pad index, regardless of NumLock state. -1 = none, -2 = stop.
func padForKey(vk, flags uint32) int {
	ext := flags&1 != 0
	switch {
	case vk >= 0x60 && vk <= 0x69:
		return int(vk - 0x60)
	case vk == 0x6A:
		return 10
	case vk == 0x6B:
		return 11
	case vk == 0x6D:
		return 12
	case vk == 0x6E:
		return 13
	case vk == 0x6F:
		return 14
	case vk == 0x0D && ext:
		return -2
	}
	if !ext { // numpad with NumLock off
		m := map[uint32]int{0x2D: 0, 0x23: 1, 0x28: 2, 0x22: 3, 0x25: 4, 0x0C: 5, 0x27: 6, 0x24: 7, 0x26: 8, 0x21: 9, 0x2E: 13}
		if i, ok := m[vk]; ok {
			return i
		}
	}
	return -1
}

func hookProc(code int, wp uintptr, lp uintptr) uintptr {
	if code == 0 {
		k := (*kbdHook)(unsafe.Pointer(lp))
		key := k.vk | (k.flags&1)<<16
		switch wp {
		case wmKeyDown, wmSysKeyDn:
			if !keyDown[key] {
				keyDown[key] = true
				if i := padForKey(k.vk, k.flags); i >= 0 {
					pPostMessageW.Call(mainWnd, wmPlay, uintptr(i), 0)
				} else if i == -2 {
					pPostMessageW.Call(mainWnd, wmStop, 0, 0)
				}
			}
		case wmKeyUp, wmSysKeyUp:
			keyDown[key] = false
		}
	}
	r, _, _ := pCallNextHookEx.Call(0, uintptr(code), wp, lp)
	return r
}

func wndProc(hwnd uintptr, m uint32, wp, lp uintptr) uintptr {
	switch m {
	case wmPlay:
		play(int(wp))
		return 0
	case wmStop:
		stopAll()
		return 0
	case wmCommand:
		id := int(wp & 0xFFFF)
		switch {
		case id >= idPad && id < idPad+len(pads):
			selected = id - idPad
			refreshEditor()
			play(selected)
		case id == idStop:
			stopAll()
		case id == idLoad:
			if f := pickFile(); f != "" {
				pads[selected].startMs, pads[selected].endMs = 0, 0
				if !loadPad(selected, f) {
					pMessageBoxW.Call(hwnd, uintptr(unsafe.Pointer(u16("Couldn't open that file."))), uintptr(unsafe.Pointer(u16("TriggerPad"))), 0x30)
				}
				saveCfg()
				refreshPad(selected)
				refreshEditor()
			}
		case id == idClear:
			pads[selected].startMs, pads[selected].endMs = 0, 0
			loadPad(selected, "")
			saveCfg()
			refreshPad(selected)
			refreshEditor()
		case id == idSave:
			applyCrop()
		case id == idPreview:
			applyCrop()
			play(selected)
		}
		return 0
	case wmDestroy:
		stopAll()
		pPostQuitMessage.Call(0)
		return 0
	}
	r, _, _ := pDefWindowProcW.Call(hwnd, uintptr(m), wp, lp)
	return r
}

func main() {
	runtime.LockOSThread()
	exe, _ := os.Executable()
	cfgPath = filepath.Join(filepath.Dir(exe), "triggerpad.cfg")

	hInst, _, _ = pGetModuleHandleW.Call(0)
	font, _, _ = pCreateFontW.Call(^uintptr(15), 0, 0, 0, 400, 0, 0, 0, 1, 0, 0, 5, 0, uintptr(unsafe.Pointer(u16("Segoe UI"))))
	cursor, _, _ := pLoadCursorW.Call(0, 32512)
	icon, _, _ := pLoadIconW.Call(0, 32512)
	wc := wndClassEx{
		lpfnWndProc:   syscall.NewCallback(wndProc),
		hInstance:     hInst,
		hIcon:         icon,
		hCursor:       cursor,
		hbrBack:       16, // COLOR_BTNFACE+1
		lpszClassName: u16("TriggerPadWnd"),
	}
	wc.cbSize = uint32(unsafe.Sizeof(wc))
	pRegisterClassExW.Call(uintptr(unsafe.Pointer(&wc)))

	mainWnd, _, _ = pCreateWindowExW.Call(0, uintptr(unsafe.Pointer(u16("TriggerPadWnd"))), uintptr(unsafe.Pointer(u16("TriggerPad"))),
		wsOverlapped|wsVisible, 200, 120, 512, 640, 0, 0, hInst, 0)

	// Numpad layout: col, row, width(cells), height(cells)
	const bw, bh, gap, ox, oy = 112, 72, 6, 12, 12
	cell := func(c, r, w, h int) (int, int, int, int) {
		return ox + c*(bw+gap), oy + r*(bh+gap), w*bw + (w-1)*gap, h*bh + (h-1)*gap
	}
	layout := map[int][4]int{
		14: {1, 0, 1, 1}, 10: {2, 0, 1, 1}, 12: {3, 0, 1, 1},
		7: {0, 1, 1, 1}, 8: {1, 1, 1, 1}, 9: {2, 1, 1, 1}, 11: {3, 1, 1, 2},
		4: {0, 2, 1, 1}, 5: {1, 2, 1, 1}, 6: {2, 2, 1, 1},
		1: {0, 3, 1, 1}, 2: {1, 3, 1, 1}, 3: {2, 3, 1, 1},
		0: {0, 4, 2, 1}, 13: {2, 4, 1, 1},
	}
	labels := map[int]string{10: "Num *", 11: "Num +", 12: "Num -", 13: "Num .", 14: "Num /"}
	for i := range pads {
		l, ok := labels[i]
		if !ok {
			l = fmt.Sprintf("Num %d", i)
		}
		pads[i] = &pad{label: l}
		g := layout[i]
		x, y, w, h := cell(g[0], g[1], g[2], g[3])
		pads[i].btn = create("BUTTON", l, bsMultiline|wsTabStop, 0, x, y, w, h, uintptr(idPad+i))
	}
	x, y, w, h := cell(0, 0, 1, 1)
	create("BUTTON", "■ STOP ALL\r\n(click)", bsMultiline, 0, x, y, w, h, idStop)
	x, y, w, h = cell(3, 3, 1, 2)
	create("BUTTON", "Enter\r\n■ STOP ALL", bsMultiline, 0, x, y, w, h, idStop)

	// Editor panel
	py := oy + 5*(bh+gap) + 6
	create("BUTTON", "Load MP3…", wsTabStop, 0, 300, py-4, 90, 26, idLoad)
	create("BUTTON", "Clear", wsTabStop, 0, 396, py-4, 82, 26, idClear)
	lblFile = create("STATIC", "", 0, 0, ox, py+26, 466, 20, 0)
	cy := py + 56
	create("STATIC", "Crop start (s):", 0, 0, ox, cy+3, 90, 20, 0)
	edStart = create("EDIT", "", esAutoHScroll|wsTabStop, wsExClientEdge, ox+92, cy, 60, 24, idStart)
	create("STATIC", "End (s, 0 = full):", 0, 0, ox+165, cy+3, 105, 20, 0)
	edEnd = create("EDIT", "", esAutoHScroll|wsTabStop, wsExClientEdge, ox+272, cy, 60, 24, idEnd)
	lblLen = create("STATIC", "", 0, 0, ox+346, cy+3, 130, 20, 0)
	create("BUTTON", "▶ Preview", wsTabStop, 0, ox, cy+32, 120, 28, idPreview)
	create("BUTTON", "Save crop", wsTabStop, 0, ox+126, cy+32, 120, 28, idSave)
	create("STATIC", "Click a pad to select + play. Numpad keys work anywhere.", 0, 0, ox+254, cy+30, 214, 34, 0)

	loadCfg()
	for i := range pads {
		refreshPad(i)
	}
	refreshEditor()

	hook, _, _ := pSetWindowsHookExW.Call(13, syscall.NewCallback(hookProc), hInst, 0)
	defer pUnhookWindowsHook.Call(hook)

	var m msg
	for {
		r, _, _ := pGetMessageW.Call(uintptr(unsafe.Pointer(&m)), 0, 0, 0)
		if int32(r) <= 0 {
			break
		}
		pTranslateMessage.Call(uintptr(unsafe.Pointer(&m)))
		pDispatchMessageW.Call(uintptr(unsafe.Pointer(&m)))
	}
}
