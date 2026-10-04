// TriggerPad: plays MP3s from the "sounds" folder when numpad keys are pressed.
// Works even when the window is not focused. Keep NumLock ON.
package main

import (
	"fmt"
	"os"
	"path/filepath"
	"syscall"
	"time"
	"unsafe"
)

var (
	user32           = syscall.NewLazyDLL("user32.dll")
	winmm            = syscall.NewLazyDLL("winmm.dll")
	getAsyncKeyState = user32.NewProc("GetAsyncKeyState")
	mciSendStringW   = winmm.NewProc("mciSendStringW")
)

type pad struct {
	vk    uintptr
	name  string
	file  string
	alias string
	ok    bool
	down  bool
}

func mci(cmd string) uintptr {
	p, _ := syscall.UTF16PtrFromString(cmd)
	r, _, _ := mciSendStringW.Call(uintptr(unsafe.Pointer(p)), 0, 0, 0)
	return r
}

func main() {
	exe, _ := os.Executable()
	dir := filepath.Join(filepath.Dir(exe), "sounds")
	os.MkdirAll(dir, 0755)

	pads := []*pad{}
	for i := 0; i <= 9; i++ {
		pads = append(pads, &pad{vk: uintptr(0x60 + i), name: fmt.Sprintf("Num %d", i), file: fmt.Sprintf("%d.mp3", i)})
	}
	pads = append(pads,
		&pad{vk: 0x6A, name: "Num *", file: "multiply.mp3"},
		&pad{vk: 0x6B, name: "Num +", file: "plus.mp3"},
		&pad{vk: 0x6D, name: "Num -", file: "minus.mp3"},
		&pad{vk: 0x6E, name: "Num .", file: "dot.mp3"},
		&pad{vk: 0x6F, name: "Num /", file: "divide.mp3"},
	)

	fmt.Println("=== TriggerPad ===")
	fmt.Println("Sounds folder:", dir)
	fmt.Println("Keep NumLock ON. Close this window to quit.")
	fmt.Println("Press Enter to STOP all sounds.\n")
	for i, p := range pads {
		p.alias = fmt.Sprintf("pad%d", i)
		path := filepath.Join(dir, p.file)
		status := "(missing)"
		if _, err := os.Stat(path); err == nil {
			if mci(fmt.Sprintf(`open "%s" type mpegvideo alias %s`, path, p.alias)) == 0 {
				p.ok = true
				status = "loaded"
			} else {
				status = "(failed to open)"
			}
		}
		fmt.Printf("  %-6s -> %-14s %s\n", p.name, p.file, status)
	}
	fmt.Println("\nTip: add/rename MP3s in the sounds folder, then restart.")

	var enterDown bool
	for {
		for _, p := range pads {
			r, _, _ := getAsyncKeyState.Call(p.vk)
			pressed := r&0x8000 != 0
			if pressed && !p.down && p.ok {
				mci("play " + p.alias + " from 0")
				fmt.Println("▶", p.name, p.file)
			}
			p.down = pressed
		}
		// Numpad Enter shares VK_RETURN; use it as stop-all.
		r, _, _ := getAsyncKeyState.Call(0x0D)
		e := r&0x8000 != 0
		if e && !enterDown {
			for _, p := range pads {
				if p.ok {
					mci("stop " + p.alias)
				}
			}
			fmt.Println("■ stop all")
		}
		enterDown = e
		time.Sleep(8 * time.Millisecond)
	}
}
