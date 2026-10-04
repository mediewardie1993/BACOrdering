//go:build windows

// Medward TriggerPad: a numpad sampler for Windows.
package main

import (
	"bytes"
	_ "embed"
	"fmt"
	"image"
	"image/draw"
	"image/png"
	"os"
	"path/filepath"
	"runtime"
	"syscall"
	"time"
	"unsafe"
)

//go:embed assets/splash.png
var splashPNG []byte

//go:embed assets/splash@2x.png
var splash2xPNG []byte

//go:embed assets/logo.png
var logoPNG []byte

const className = "MedwardTriggerPad"

var hInst, mainWnd uintptr

func decodePNG(b []byte) *image.RGBA {
	img, _ := png.Decode(bytes.NewReader(b))
	rgba := image.NewRGBA(img.Bounds())
	draw.Draw(rgba, rgba.Bounds(), img, image.Point{}, draw.Src) // premultiplied
	return rgba
}

func pump() bool {
	var m msgT
	for {
		r, _, _ := pPeekMessageW.Call(uintptr(unsafe.Pointer(&m)), 0, 0, 0, 1)
		if r == 0 {
			return true
		}
		if m.message == 0x0012 { // WM_QUIT
			return false
		}
		pTranslateMessage.Call(uintptr(unsafe.Pointer(&m)))
		pDispatchMessageW.Call(uintptr(unsafe.Pointer(&m)))
	}
}

// splashWindow shows a per-pixel-alpha splash and returns a setter for its opacity.
func splashWindow() (hwnd uintptr, setAlpha func(a byte)) {
	src := splashPNG
	if scale >= 1.5 {
		src = splash2xPNG
	}
	img := decodePNG(src)
	w, h := img.Bounds().Dx(), img.Bounds().Dy()

	wc := wndClassEx{lpfnWndProc: pDefWindowProcW.Addr(), hInstance: hInst, lpszClassName: u16("MedwardSplash")}
	wc.cbSize = uint32(unsafe.Sizeof(wc))
	pRegisterClassExW.Call(uintptr(unsafe.Pointer(&wc)))
	sw, _, _ := pGetSystemMetrics.Call(0)
	sh, _, _ := pGetSystemMetrics.Call(1)
	x, y := (int(sw)-w)/2, (int(sh)-h)/2
	hwnd, _, _ = pCreateWindowExW.Call(0x80000|0x8|0x80, up("MedwardSplash"), up("Medward TriggerPad"),
		0x80000000, uintptr(x), uintptr(y), uintptr(w), uintptr(h), 0, 0, hInst, 0)

	screen, _, _ := pGetDC.Call(0)
	mem, _, _ := pCreateCompatibleDC.Call(screen)
	bi := bitmapInfo{size: 40, width: int32(w), height: -int32(h), planes: 1, bitCount: 32}
	var bits uintptr
	dib, _, _ := pCreateDIBSection.Call(mem, uintptr(unsafe.Pointer(&bi)), 0, uintptr(unsafe.Pointer(&bits)), 0, 0)
	px := unsafe.Slice((*byte)(unsafe.Pointer(bits)), w*h*4)
	for i := 0; i < w*h; i++ {
		px[i*4], px[i*4+1], px[i*4+2], px[i*4+3] = img.Pix[i*4+2], img.Pix[i*4+1], img.Pix[i*4], img.Pix[i*4+3]
	}
	pSelectObject.Call(mem, dib)
	pReleaseDC.Call(0, screen)

	setAlpha = func(a byte) {
		dst := pointT{int32(x), int32(y)}
		size := pointT{int32(w), int32(h)}
		srcPt := pointT{}
		blend := [4]byte{0, 0, a, 1}
		pUpdateLayeredWindow.Call(hwnd, 0, uintptr(unsafe.Pointer(&dst)), uintptr(unsafe.Pointer(&size)), mem,
			uintptr(unsafe.Pointer(&srcPt)), 0, uintptr(unsafe.Pointer(&blend)), 2)
	}
	setAlpha(0)
	pShowWindow.Call(hwnd, 4) // SW_SHOWNOACTIVATE
	return hwnd, setAlpha
}

func fade(set func(byte), from, to float64, d time.Duration) {
	start := time.Now()
	for {
		t := float64(time.Since(start)) / float64(d)
		if t > 1 {
			t = 1
		}
		set(byte((from + (to-from)*t) * 255))
		pump()
		if t >= 1 {
			return
		}
		time.Sleep(12 * time.Millisecond)
	}
}

func main() {
	runtime.LockOSThread()

	// Single instance: focus the running copy instead.
	if _, _, err := pCreateMutexW.Call(0, 0, up("Local\\MedwardTriggerPadMutex")); err == syscall.Errno(183) {
		if h, _, _ := pFindWindowW.Call(up(className), 0); h != 0 {
			pShowWindow.Call(h, 9)
			pSetForegroundWindow.Call(h)
		}
		return
	}

	cfgDir, err := os.UserConfigDir()
	if err != nil {
		exe, _ := os.Executable()
		cfgDir = filepath.Dir(exe)
	}
	cfgPath = filepath.Join(cfgDir, "Medward TriggerPad", "pads.cfg")

	hInst, _, _ = pGetModuleHandleW.Call(0)
	screen, _, _ := pGetDC.Call(0)
	dpi, _, _ := pGetDeviceCaps.Call(screen, 88)
	pReleaseDC.Call(0, screen)
	if dpi > 0 {
		scale = float64(dpi) / 96
	}

	var token uintptr
	in := struct {
		version          uint32
		cb               uintptr
		noBgThread, noCd int32
	}{version: 1}
	pGdiplusStartup.Call(uintptr(unsafe.Pointer(&token)), uintptr(unsafe.Pointer(&in)), 0)

	splash, setSplash := splashWindow()
	fade(setSplash, 0, 1, 220*time.Millisecond)
	shown := time.Now()

	fTitle = mkFont(20, 600, "Segoe UI")
	fSub = mkFont(12, 400, "Segoe UI")
	fKey = mkFont(24, 600, "Segoe UI")
	fSmall = mkFont(12, 400, "Segoe UI")
	fBody = mkFont(13, 400, "Segoe UI")
	fBtn = mkFont(13, 600, "Segoe UI")
	fName = mkFont(22, 600, "Segoe UI")
	fCaps = mkFont(11, 700, "Segoe UI")
	logoBmp = gdipBitmap(decodePNG(logoPNG))

	labels := map[int][2]string{10: {"Num *", "*"}, 11: {"Num +", "+"}, 12: {"Num −", "−"}, 13: {"Num .", "."}, 14: {"Num /", "/"}}
	for i := range pads {
		l, ok := labels[i]
		if !ok {
			l = [2]string{fmt.Sprintf("Num %d", i), fmt.Sprint(i)}
		}
		pads[i] = &pad{label: l[0], key: l[1], color: hex(padColors[i])}
	}

	icon, _, _ := pLoadImageW.Call(hInst, up("APP"), 1, 0, 0, 0x40)
	iconSm, _, _ := pLoadImageW.Call(hInst, up("APP"), 1, uintptr(S(16)), uintptr(S(16)), 0)
	cursor, _, _ := pLoadCursorW.Call(0, 32512)
	wc := wndClassEx{lpfnWndProc: syscall.NewCallback(wndProc), hInstance: hInst, hIcon: icon, hIconSm: iconSm,
		hCursor: cursor, lpszClassName: u16(className)}
	wc.cbSize = uint32(unsafe.Sizeof(wc))
	pRegisterClassExW.Call(uintptr(unsafe.Pointer(&wc)))

	const style = 0x00C00000 | 0x00080000 | 0x00020000 // caption | sysmenu | minimize
	rc := rectT{0, 0, int32(S(winW)), int32(S(winH))}
	pAdjustWindowRectEx.Call(uintptr(unsafe.Pointer(&rc)), style, 0, 0)
	ww, wh := rc.r-rc.l, rc.b-rc.t
	sw, _, _ := pGetSystemMetrics.Call(0)
	sh, _, _ := pGetSystemMetrics.Call(1)
	mainWnd, _, _ = pCreateWindowExW.Call(0x10, up(className), up("Medward TriggerPad"), style,
		uintptr((int32(sw)-ww)/2), uintptr((int32(sh)-wh)/2), uintptr(ww), uintptr(wh), 0, 0, hInst, 0)

	one := int32(1)
	pDwmSetWindowAttr.Call(mainWnd, 20, uintptr(unsafe.Pointer(&one)), 4) // dark title bar
	capCol := uint32(cBg.colorref())
	pDwmSetWindowAttr.Call(mainWnd, 35, uintptr(unsafe.Pointer(&capCol)), 4)
	pDragAcceptFiles.Call(mainWnd, 1)

	loadCfg()

	for time.Since(shown) < 1400*time.Millisecond {
		pump()
		time.Sleep(15 * time.Millisecond)
	}
	fade(setSplash, 1, 0, 260*time.Millisecond)
	pDestroyWindow.Call(splash)

	pShowWindow.Call(mainWnd, 1)
	pSetForegroundWindow.Call(mainWnd)
	pSetTimer.Call(mainWnd, 1, 33, 0)

	hook, _, _ := pSetWindowsHookExW.Call(13, syscall.NewCallback(hookProc), hInst, 0)
	defer pUnhookWindowsHookEx.Call(hook)

	var m msgT
	for {
		r, _, _ := pGetMessageW.Call(uintptr(unsafe.Pointer(&m)), 0, 0, 0)
		if int32(r) <= 0 {
			break
		}
		pTranslateMessage.Call(uintptr(unsafe.Pointer(&m)))
		pDispatchMessageW.Call(uintptr(unsafe.Pointer(&m)))
	}
}
