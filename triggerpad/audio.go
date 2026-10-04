//go:build windows

package main

import (
	"bufio"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
	"unsafe"

	"github.com/hajimehoshi/go-mp3"
)

const peakCount = 256

type pad struct {
	label    string
	key      string
	color    col
	path     string
	startMs  int
	endMs    int // 0 = play to end
	lengthMs int
	loaded   bool
	playing  bool
	posMs    int
	hitAt    time.Time
	peaks    []float64
}

var (
	pads    [15]*pad
	peaksMu sync.Mutex
	cfgPath string
)

func mci(cmd string) (string, uintptr) {
	buf := make([]uint16, 256)
	r, _, _ := pMciSendStringW.Call(up(cmd), uintptr(unsafe.Pointer(&buf[0])), 256, 0)
	return syscall.UTF16ToString(buf), r
}

func alias(i int) string { return fmt.Sprintf("mwpad%d", i) }

func (p *pad) end() int {
	if p.endMs > 0 {
		return p.endMs
	}
	return p.lengthMs
}

func loadPad(i int, path string) bool {
	p := pads[i]
	mci("close " + alias(i))
	p.loaded, p.lengthMs, p.playing = false, 0, false
	p.path = path
	peaksMu.Lock()
	p.peaks = nil
	peaksMu.Unlock()
	if path == "" {
		return false
	}
	if _, r := mci(fmt.Sprintf(`open "%s" type mpegvideo alias %s`, path, alias(i))); r != 0 {
		return false
	}
	mci("set " + alias(i) + " time format milliseconds")
	l, _ := mci("status " + alias(i) + " length")
	p.lengthMs, _ = strconv.Atoi(strings.TrimSpace(l))
	if p.startMs >= p.lengthMs {
		p.startMs = 0
	}
	if p.endMs > p.lengthMs {
		p.endMs = 0
	}
	p.loaded = true
	go computePeaks(i, path)
	return true
}

// computePeaks decodes the file in the background to draw its waveform.
func computePeaks(i int, path string) {
	if !strings.EqualFold(filepath.Ext(path), ".mp3") {
		return
	}
	f, err := os.Open(path)
	if err != nil {
		return
	}
	defer f.Close()
	d, err := mp3.NewDecoder(f)
	if err != nil {
		return
	}
	frames := d.Length() / 4
	if frames <= 0 {
		return
	}
	peaks := make([]float64, peakCount)
	per := frames/peakCount + 1
	buf := make([]byte, 4096*4)
	var n int64
	for {
		k, err := d.Read(buf)
		for j := 0; j+3 < k; j += 4 {
			l := float64(int16(uint16(buf[j]) | uint16(buf[j+1])<<8))
			r := float64(int16(uint16(buf[j+2]) | uint16(buf[j+3])<<8))
			v := (abs(l) + abs(r)) / 2 / 32768
			b := int(n / per)
			if b < peakCount && v > peaks[b] {
				peaks[b] = v
			}
			n++
		}
		if err == io.EOF || err != nil {
			break
		}
	}
	mx := 0.0
	for _, v := range peaks {
		if v > mx {
			mx = v
		}
	}
	if mx > 0 {
		for j := range peaks {
			peaks[j] /= mx
		}
	}
	peaksMu.Lock()
	if pads[i].path == path {
		pads[i].peaks = peaks
	}
	peaksMu.Unlock()
	pPostMessageW.Call(mainWnd, wmPeaksReady, 0, 0)
}

func abs(v float64) float64 {
	if v < 0 {
		return -v
	}
	return v
}

func play(i int) {
	p := pads[i]
	p.hitAt = time.Now()
	if !p.loaded {
		invalidate()
		return
	}
	cmd := fmt.Sprintf("play %s from %d", alias(i), p.startMs)
	if p.endMs > p.startMs {
		cmd += fmt.Sprintf(" to %d", p.endMs)
	}
	mci(cmd)
	p.playing, p.posMs = true, p.startMs
	invalidate()
}

func stopAll() {
	for i, p := range pads {
		if p.loaded {
			mci("stop " + alias(i))
			p.playing = false
		}
	}
	invalidate()
}

// pollPlayback refreshes play state; returns true if anything is playing.
func pollPlayback() bool {
	any := false
	for i, p := range pads {
		if !p.playing {
			continue
		}
		mode, _ := mci("status " + alias(i) + " mode")
		if mode != "playing" {
			p.playing = false
			continue
		}
		pos, _ := mci("status " + alias(i) + " position")
		p.posMs, _ = strconv.Atoi(strings.TrimSpace(pos))
		any = true
	}
	return any
}

func saveCfg() {
	os.MkdirAll(filepath.Dir(cfgPath), 0755)
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
