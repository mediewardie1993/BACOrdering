//go:build windows

package main

import (
	"fmt"
	"math"
	"path/filepath"
	"syscall"
	"time"
	"unsafe"
)

const winW, winH = 760.0, 572.0

// Theme
var (
	cBg      = hex(0x0E0E14)
	cSurface = hex(0x16161F)
	cPad     = hex(0x1D1D28)
	cPadHov  = hex(0x252533)
	cBorder  = hex(0x272734)
	cText    = hex(0xF4F4F8)
	cMuted   = hex(0x8B8BA0)
	cFaint   = hex(0x55556A)
	cViolet  = hex(0x7C3AED)
	cViolet2 = hex(0x9F67FF)
	cCyan    = hex(0x22D3EE)
	cDanger  = hex(0xF43F5E)
	cGreen   = hex(0x34D399)
	cWaveBg  = hex(0x101017)
	cWaveOff = hex(0x34344A)
)

var padColors = [15]uint32{0x8B5CF6, 0x3B82F6, 0x06B6D4, 0x10B981, 0x84CC16, 0xF59E0B,
	0xF97316, 0xEF4444, 0xEC4899, 0xA855F7, 0x14B8A6, 0xF43F5E, 0x6366F1, 0xEAB308, 0x0EA5E9}

var (
	fTitle, fSub, fKey, fSmall, fBody, fBtn, fName, fCaps uintptr
	logoBmp                                               uintptr
	selected                                              = 7
	hoverID                                               string
	tracking                                              bool
	dragHandle                                            int // 0 none, 1 start, 2 end
	animating                                             bool
)

// Layout --------------------------------------------------------------------

func cellRect(c, r, w, h int) rect {
	const cw, ch, gap, ox, oy = 92.0, 84.0, 10.0, 24.0, 88.0
	return rect{ox + float64(c)*(cw+gap), oy + float64(r)*(ch+gap), float64(w)*cw + float64(w-1)*gap, float64(h)*ch + float64(h-1)*gap}
}

var padCells = map[int][4]int{
	14: {1, 0, 1, 1}, 10: {2, 0, 1, 1}, 12: {3, 0, 1, 1},
	7: {0, 1, 1, 1}, 8: {1, 1, 1, 1}, 9: {2, 1, 1, 1}, 11: {3, 1, 1, 2},
	4: {0, 2, 1, 1}, 5: {1, 2, 1, 1}, 6: {2, 2, 1, 1},
	1: {0, 3, 1, 1}, 2: {1, 3, 1, 1}, 3: {2, 3, 1, 1},
	0: {0, 4, 2, 1}, 13: {2, 4, 1, 1},
}

func padRect(i int) rect { c := padCells[i]; return cellRect(c[0], c[1], c[2], c[3]) }

var (
	rStopTop   = cellRect(0, 0, 1, 1)
	rStopEnter = cellRect(3, 3, 1, 2)
	rStopHdr   = rect{winW - 24 - 112, 22, 112, 34}
	rPanel     = rect{446, 88, 290, 460}
	rLoad      = rect{464, 202, 160, 36}
	rClear     = rect{632, 202, 86, 36}
	rWave      = rect{464, 282, 254, 112}
	rPreview   = rect{464, 406, 124, 36}
	rReset     = rect{594, 406, 124, 36}
)

func waveInner() rect { return rect{rWave.x + 10, rWave.y + 14, rWave.w - 20, rWave.h - 28} }

func hit(x, y float64) string {
	for i := range pads {
		if padRect(i).has(x, y) {
			return fmt.Sprintf("p%d", i)
		}
	}
	for id, r := range map[string]rect{"stop": rStopTop, "stopE": rStopEnter, "stopH": rStopHdr,
		"load": rLoad, "clear": rClear, "wave": rWave, "preview": rPreview, "reset": rReset} {
		if r.has(x, y) {
			return id
		}
	}
	return ""
}

func clickable(id string) bool {
	p := pads[selected]
	switch id {
	case "":
		return false
	case "clear", "preview", "reset", "wave":
		return p.loaded || (id == "clear" && p.path != "")
	}
	return true
}

// Painting ------------------------------------------------------------------

func measure(s string, font uintptr) float64 {
	hdc, _, _ := pGetDC.Call(mainWnd)
	defer pReleaseDC.Call(mainWnd, hdc)
	pSelectObject.Call(hdc, font)
	rc := rectT{}
	pDrawTextW.Call(hdc, up(s), ^uintptr(0), uintptr(unsafe.Pointer(&rc)), 0x400|dtSingle|dtNoPrefix) // DT_CALCRECT
	return float64(rc.r) / scale
}

func secs(ms int) string { return fmt.Sprintf("%.2fs", float64(ms)/1000) }

func flash(p *pad) float64 {
	return math.Max(0, 1-float64(time.Since(p.hitAt).Milliseconds())/420)
}

func paint(g *gfx) {
	g.fillRect(rect{0, 0, winW, winH}, cBg)

	// Header
	g.image(logoBmp, rect{24, 20, 38, 38})
	g.text("Medward", rect{74, 17, 200, 26}, fTitle, cText, dtSingle)
	mw := measure("Medward ", fTitle)
	g.text("TriggerPad", rect{74 + mw, 17, 200, 26}, fTitle, cViolet2, dtSingle)
	g.circle(78, 49, 3.5, cGreen)
	g.text("Hotkeys active  ·  works with NumLock on or off", rect{87, 41, 360, 18}, fSub, cMuted, dtSingle)
	stopBtn(g, rStopHdr, "■  Stop all", hoverID == "stopH")
	g.fillRect(rect{24, 74, winW - 48, 1}, cBorder)

	// Pads
	for i, p := range pads {
		drawPad(g, i, p)
	}
	stopCell(g, rStopTop, "Click", hoverID == "stop")
	stopCell(g, rStopEnter, "Num Enter", hoverID == "stopE")

	drawPanel(g)
}

func stopBtn(g *gfx, r rect, label string, hov bool) {
	bg := hex(0x2A1219)
	if hov {
		bg = hex(0x3A1622)
	}
	g.fillRound(r, r.h/2, bg)
	g.strokeRound(r.inset(0.5), r.h/2, 1, cDanger.alpha(0.45))
	g.text(label, r, fBtn, cDanger, dtCenter|dtVCenter|dtSingle)
}

func stopCell(g *gfx, r rect, hint string, hov bool) {
	bg := hex(0x1F1418)
	if hov {
		bg = hex(0x2C171F)
	}
	g.fillRound(r, 14, bg)
	g.strokeRound(r.inset(0.5), 14, 1, cDanger.alpha(0.25))
	g.text("■  STOP", rect{r.x, r.y + r.h/2 - 16, r.w, 20}, fBtn, cDanger, dtCenter|dtSingle)
	g.text(hint, rect{r.x, r.y + r.h/2 + 4, r.w, 16}, fSmall, cFaint, dtCenter|dtSingle)
}

func drawPad(g *gfx, i int, p *pad) {
	r := padRect(i)
	pc := p.color
	bg := cPad
	if hoverID == fmt.Sprintf("p%d", i) {
		bg = cPadHov
	}
	if p.loaded {
		bg = bg.mix(pc, 0.10)
	}
	f := flash(p)
	bg = bg.mix(pc, f*0.85)
	g.fillRound(r, 14, bg)
	if i == selected {
		g.strokeRound(r.inset(1), 13, 2, pc)
	} else {
		g.strokeRound(r.inset(0.5), 14, 1, cText.alpha(0.05))
	}

	g.text(p.key, rect{r.x + 12, r.y + 8, r.w - 24, 30}, fKey, cText, dtSingle)
	if p.loaded {
		g.circle(r.x+r.w-14, r.y+16, 4, pc.mix(cText, f))
	}
	name, nc := "Drop audio", cFaint
	if p.path != "" {
		name, nc = filepath.Base(p.path), cMuted.mix(cText, f)
		if !p.loaded {
			name, nc = "⚠ "+name, cDanger
		}
	}
	g.text(name, rect{r.x + 12, r.y + r.h - 32, r.w - 24, 16}, fSmall, nc, dtSingle|dtEllipsis)

	// progress bar
	bar := rect{r.x + 12, r.y + r.h - 12, r.w - 24, 3}
	if p.loaded {
		g.fillRound(bar, 1.5, cText.alpha(0.07))
		if p.playing {
			span := float64(p.end() - p.startMs)
			t := 0.0
			if span > 0 {
				t = math.Max(0, math.Min(1, float64(p.posMs-p.startMs)/span))
			}
			g.fillRound(rect{bar.x, bar.y, math.Max(3, bar.w*t), bar.h}, 1.5, pc)
		}
	}
}

func button(g *gfx, id string, r rect, label string, primary bool) {
	hov := hoverID == id
	enabled := clickable(id)
	if primary && enabled {
		c1, c2 := cViolet, hex(0x5B21B6)
		if hov {
			c1, c2 = cViolet2, cViolet
		}
		g.fillRoundGrad(r, 10, c1, c2)
		g.text(label, r, fBtn, cText, dtCenter|dtVCenter|dtSingle)
		return
	}
	bg := hex(0x22222E)
	if hov && enabled {
		bg = hex(0x2C2C3B)
	}
	g.fillRound(r, 10, bg)
	tc := cText
	if !enabled {
		tc = cFaint
	}
	g.text(label, r, fBtn, tc, dtCenter|dtVCenter|dtSingle)
}

func drawPanel(g *gfx) {
	p := pads[selected]
	g.fillRound(rPanel, 16, cSurface)
	g.strokeRound(rPanel.inset(0.5), 16, 1, cBorder)
	x, w := rPanel.x+18, rPanel.w-36

	g.text("SELECTED PAD", rect{x, 106, w, 16}, fCaps, cMuted, dtSingle)
	g.circle(x+6, 141, 6, p.color)
	g.text(p.label, rect{x + 20, 125, w - 20, 32}, fName, cText, dtSingle)
	file, info := "No audio assigned", "Click “Load audio” or drop a file on a pad"
	if p.path != "" {
		file = filepath.Base(p.path)
		info = "Length " + secs(p.lengthMs)
		if !p.loaded {
			info = "File missing or unreadable"
		}
	}
	g.text(file, rect{x, 160, w, 18}, fBody, cText, dtSingle|dtEllipsis)
	g.text(info, rect{x, 179, w, 16}, fSmall, cMuted, dtSingle|dtEllipsis)

	button(g, "load", rLoad, "Load audio…", true)
	button(g, "clear", rClear, "Clear", false)

	g.text("CROP", rect{x, 258, w, 16}, fCaps, cMuted, dtSingle)
	if p.loaded {
		g.text(fmt.Sprintf("%s  →  %s   (%s)", secs(p.startMs), secs(p.end()), secs(p.end()-p.startMs)),
			rect{x, 257, w, 16}, fSmall, cText, dtSingle|dtRight)
	}
	drawWave(g, p)

	button(g, "preview", rPreview, "▶  Preview", true)
	button(g, "reset", rReset, "Reset crop", false)

	g.text("Click a pad to play it, right-click to select it.\nDrag the handles on the waveform to crop.\nDrop several files to fill empty pads.",
		rect{x, 460, w, 70}, fSmall, cFaint, dtWrap)
}

func drawWave(g *gfx, p *pad) {
	g.fillRound(rWave, 10, cWaveBg)
	g.strokeRound(rWave.inset(0.5), 10, 1, cBorder)
	if !p.loaded || p.lengthMs <= 0 {
		g.text("Load audio to crop it", rWave, fSmall, cFaint, dtCenter|dtVCenter|dtSingle)
		return
	}
	ir := waveInner()
	peaksMu.Lock()
	peaks := p.peaks
	peaksMu.Unlock()
	ts, te := float64(p.startMs)/float64(p.lengthMs), float64(p.end())/float64(p.lengthMs)
	n := int(ir.w / 3)
	for j := 0; j < n; j++ {
		t0, t1 := float64(j)/float64(n), float64(j+1)/float64(n)
		v := 0.04
		if peaks != nil {
			for k := int(t0 * peakCount); k < int(t1*peakCount) && k < peakCount; k++ {
				v = math.Max(v, peaks[k])
			}
		}
		h := math.Max(2, v*ir.h)
		c := cWaveOff
		if (t0+t1)/2 >= ts && (t0+t1)/2 <= te {
			c = p.color
		}
		g.fillRound(rect{ir.x + float64(j)*3, ir.y + (ir.h-h)/2, 2, h}, 1, c)
	}
	xs, xe := ir.x+ts*ir.w, ir.x+te*ir.w
	for _, hx := range []float64{xs, xe} {
		g.fillRect(rect{hx - 1, rWave.y + 6, 2, rWave.h - 12}, cText)
		g.circle(hx, rWave.y+8, 5, cText)
		g.circle(hx, rWave.y+rWave.h-8, 5, cText)
	}
	if p.playing {
		px := ir.x + float64(p.posMs)/float64(p.lengthMs)*ir.w
		g.fillRect(rect{px - 0.75, rWave.y + 4, 1.5, rWave.h - 8}, cCyan)
	}
}

// Input ---------------------------------------------------------------------

func dragTo(x float64) {
	p := pads[selected]
	ir := waveInner()
	ms := int(math.Max(0, math.Min(1, (x-ir.x)/ir.w)) * float64(p.lengthMs))
	const gap = 50
	if dragHandle == 1 {
		p.startMs = min(ms, p.end()-gap)
		if p.startMs < 0 {
			p.startMs = 0
		}
	} else {
		e := max(ms, p.startMs+gap)
		if e >= p.lengthMs-5 {
			e = 0
		}
		p.endMs = e
	}
	invalidate()
}

func pickFile() string {
	buf := make([]uint16, 1024)
	filter := syscall.StringToUTF16("Audio (*.mp3;*.wav)\x00*.mp3;*.wav\x00All files\x00*.*\x00\x00")
	ofn := openFileName{hwndOwner: mainWnd, lpstrFilter: &filter[0], lpstrFile: &buf[0], nMaxFile: uint32(len(buf)),
		lpstrTitle: u16("Choose audio for " + pads[selected].label), flags: 0x1000 | 0x800 | 0x8}
	ofn.lStructSize = uint32(unsafe.Sizeof(ofn))
	if r, _, _ := pGetOpenFileNameW.Call(uintptr(unsafe.Pointer(&ofn))); r == 0 {
		return ""
	}
	return syscall.UTF16ToString(buf)
}

func assign(i int, path string) {
	pads[i].startMs, pads[i].endMs = 0, 0
	if !loadPad(i, path) {
		pMessageBoxW.Call(mainWnd, up("Couldn't open:\n"+path), up("Medward TriggerPad"), 0x30)
	}
}

func onClick(id string, right bool) {
	var i int
	if n, _ := fmt.Sscanf(id, "p%d", &i); n == 1 {
		selected = i
		if !right {
			play(i)
		}
		invalidate()
		return
	}
	if right || !clickable(id) {
		return
	}
	p := pads[selected]
	switch id {
	case "stop", "stopE", "stopH":
		stopAll()
	case "load":
		if f := pickFile(); f != "" {
			assign(selected, f)
			saveCfg()
		}
	case "clear":
		mci("close " + alias(selected))
		p.startMs, p.endMs = 0, 0
		loadPad(selected, "")
		saveCfg()
	case "preview":
		play(selected)
	case "reset":
		p.startMs, p.endMs = 0, 0
		saveCfg()
	}
	invalidate()
}

func onDrop(hDrop uintptr) {
	var pt pointT
	pDragQueryPoint.Call(hDrop, uintptr(unsafe.Pointer(&pt)))
	target := selected
	x, y := float64(pt.x)/scale, float64(pt.y)/scale
	for i := range pads {
		if padRect(i).has(x, y) {
			target = i
		}
	}
	n, _, _ := pDragQueryFileW.Call(hDrop, 0xFFFFFFFF, 0, 0)
	buf := make([]uint16, 1024)
	next := target
	for k := 0; k < int(n); k++ {
		pDragQueryFileW.Call(hDrop, uintptr(k), uintptr(unsafe.Pointer(&buf[0])), uintptr(len(buf)))
		path := syscall.UTF16ToString(buf)
		if k > 0 { // extra files go to the next empty pads
			next = -1
			for _, cand := range []int{7, 8, 9, 4, 5, 6, 1, 2, 3, 0, 13, 14, 10, 12, 11} {
				if pads[cand].path == "" {
					next = cand
					break
				}
			}
			if next < 0 {
				break
			}
		}
		assign(next, path)
	}
	pDragFinish.Call(hDrop)
	selected = target
	saveCfg()
	invalidate()
}

// padForKey maps a key to a pad index regardless of NumLock. -1 none, -2 stop.
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
	if !ext {
		m := map[uint32]int{0x2D: 0, 0x23: 1, 0x28: 2, 0x22: 3, 0x25: 4, 0x0C: 5, 0x27: 6, 0x24: 7, 0x26: 8, 0x21: 9, 0x2E: 13}
		if i, ok := m[vk]; ok {
			return i
		}
	}
	return -1
}

var keyDown = map[uint32]bool{}

func hookProc(code int, wp uintptr, lp uintptr) uintptr {
	if code == 0 {
		k := (*kbdHook)(unsafe.Pointer(lp))
		key := k.vk | (k.flags&1)<<16
		switch wp {
		case wmKeyDown, wmSysKeyDown:
			if !keyDown[key] {
				keyDown[key] = true
				if i := padForKey(k.vk, k.flags); i >= 0 {
					pPostMessageW.Call(mainWnd, wmPlay, uintptr(i), 0)
				} else if i == -2 {
					pPostMessageW.Call(mainWnd, wmStopAll, 0, 0)
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
	case wmStopAll:
		stopAll()
		return 0
	case wmPeaksReady:
		invalidate()
		return 0
	case wmTimer:
		playing := pollPlayback()
		flashing := false
		for _, p := range pads {
			if flash(p) > 0 {
				flashing = true
			}
		}
		if playing || flashing || animating {
			invalidate()
		}
		animating = playing || flashing
		return 0
	case wmEraseBkgnd:
		return 1
	case wmPaint:
		var ps paintStruct
		hdc, _, _ := pBeginPaint.Call(hwnd, uintptr(unsafe.Pointer(&ps)))
		w, h := uintptr(S(winW)+1), uintptr(S(winH)+1)
		mem, _, _ := pCreateCompatibleDC.Call(hdc)
		bmp, _, _ := pCreateCompatibleBmp.Call(hdc, w, h)
		old, _, _ := pSelectObject.Call(mem, bmp)
		g := newGfx(mem)
		paint(g)
		g.finish()
		pBitBlt.Call(hdc, 0, 0, w, h, mem, 0, 0, 0xCC0020)
		pSelectObject.Call(mem, old)
		pDeleteObject.Call(bmp)
		pDeleteDC.Call(mem)
		pEndPaint.Call(hwnd, uintptr(unsafe.Pointer(&ps)))
		return 0
	case wmSetCursor:
		if lp&0xFFFF == 1 { // HTCLIENT
			id := uintptr(32512)
			if clickable(hoverID) {
				id = 32649 // hand
			}
			c, _, _ := pLoadCursorW.Call(0, id)
			pSetCursor.Call(c)
			return 1
		}
	case wmMouseMove:
		x, y := float64(lo(lp))/scale, float64(hi(lp))/scale
		if dragHandle != 0 {
			dragTo(x)
			return 0
		}
		if id := hit(x, y); id != hoverID {
			hoverID = id
			invalidate()
		}
		if !tracking {
			tm := trackMouse{flags: 2, hwnd: hwnd}
			tm.cbSize = uint32(unsafe.Sizeof(tm))
			pTrackMouseEvent.Call(uintptr(unsafe.Pointer(&tm)))
			tracking = true
		}
		return 0
	case wmMouseLeave:
		tracking = false
		hoverID = ""
		invalidate()
		return 0
	case wmLButtonDown, wmRButtonDown:
		x, y := float64(lo(lp))/scale, float64(hi(lp))/scale
		id := hit(x, y)
		if id == "wave" && m == wmLButtonDown && clickable("wave") {
			p := pads[selected]
			ir := waveInner()
			xs := ir.x + float64(p.startMs)/float64(p.lengthMs)*ir.w
			xe := ir.x + float64(p.end())/float64(p.lengthMs)*ir.w
			dragHandle = 1
			if math.Abs(x-xe) < math.Abs(x-xs) {
				dragHandle = 2
			}
			pSetCapture.Call(hwnd)
			dragTo(x)
			return 0
		}
		onClick(id, m == wmRButtonDown)
		return 0
	case wmLButtonUp:
		if dragHandle != 0 {
			dragHandle = 0
			pReleaseCapture.Call()
			saveCfg()
		}
		return 0
	case wmDropFiles:
		onDrop(wp)
		return 0
	case wmDestroy:
		stopAll()
		pPostQuitMessage.Call(0)
		return 0
	}
	r, _, _ := pDefWindowProcW.Call(hwnd, uintptr(m), wp, lp)
	return r
}
