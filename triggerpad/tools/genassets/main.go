// genassets renders the Medward TriggerPad icon, splash screen and installer
// artwork. Run from the triggerpad directory: go run ./tools/genassets
package main

import (
	"bytes"
	"encoding/binary"
	"image"
	"image/color"
	"image/png"
	"math"
	"os"

	"golang.org/x/image/bmp"
	"golang.org/x/image/font"
	"golang.org/x/image/font/gofont/gobold"
	"golang.org/x/image/font/gofont/goregular"
	"golang.org/x/image/font/opentype"
	"golang.org/x/image/math/fixed"
)

type rgb struct{ r, g, b float64 }

var (
	violet = rgb{124, 58, 237}
	cyan   = rgb{6, 182, 212}
	white  = rgb{255, 255, 255}
)

func mix(a, b rgb, t float64) rgb {
	t = clamp(t)
	return rgb{a.r + (b.r-a.r)*t, a.g + (b.g-a.g)*t, a.b + (b.b-a.b)*t}
}

func clamp(v float64) float64 { return math.Max(0, math.Min(1, v)) }

// canvas holds premultiplied RGBA in 0..1.
type canvas struct {
	w, h int
	px   []float64
}

func newCanvas(w, h int) *canvas { return &canvas{w, h, make([]float64, w*h*4)} }

func (c *canvas) over(x, y int, col rgb, a float64) {
	if a <= 0 || x < 0 || y < 0 || x >= c.w || y >= c.h {
		return
	}
	i := (y*c.w + x) * 4
	c.px[i] = col.r/255*a + c.px[i]*(1-a)
	c.px[i+1] = col.g/255*a + c.px[i+1]*(1-a)
	c.px[i+2] = col.b/255*a + c.px[i+2]*(1-a)
	c.px[i+3] = a + c.px[i+3]*(1-a)
}

func (c *canvas) shade(f func(x, y float64) (rgb, float64)) {
	for y := 0; y < c.h; y++ {
		for x := 0; x < c.w; x++ {
			col, a := f(float64(x)+0.5, float64(y)+0.5)
			c.over(x, y, col, a)
		}
	}
}

// rrect returns the signed distance to a rounded rectangle.
func rrect(px, py, x, y, w, h, r float64) float64 {
	cx, cy := x+w/2, y+h/2
	qx := math.Abs(px-cx) - w/2 + r
	qy := math.Abs(py-cy) - h/2 + r
	return math.Hypot(math.Max(qx, 0), math.Max(qy, 0)) + math.Min(math.Max(qx, qy), 0) - r
}

func cov(d float64) float64 { return clamp(0.5 - d) }

// drawIcon paints the app icon at (ox,oy) with the given size.
func drawIcon(c *canvas, ox, oy, s float64) {
	k := s / 256
	m := 8 * k
	c.shade(func(x, y float64) (rgb, float64) {
		d := rrect(x, y, ox+m, oy+m, s-2*m, s-2*m, 58*k)
		t := ((x - ox) + (y - oy)) / (2 * s)
		col := mix(violet, cyan, t)
		hl := clamp(1-(y-oy)/(s*0.55)) * 0.16
		col = mix(col, white, hl)
		return col, cov(d / math.Max(k, 0.35))
	})
	// 3x3 pad grid, one lit pad with a glow.
	cell, gap := 46*k, 14*k
	start := (s - (3*cell + 2*gap)) / 2
	lit := 2
	for i := 0; i < 9; i++ {
		gx := ox + start + float64(i%3)*(cell+gap)
		gy := oy + start + float64(i/3)*(cell+gap)
		if i == lit {
			c.shade(func(x, y float64) (rgb, float64) {
				d := rrect(x, y, gx, gy, cell, cell, 12*k)
				if d > 0 {
					return white, 0.45 * math.Exp(-d/(12*k))
				}
				return white, 0
			})
		}
		a := 0.30
		if i == lit {
			a = 1
		}
		c.shade(func(x, y float64) (rgb, float64) {
			return white, a * cov(rrect(x, y, gx, gy, cell, cell, 12*k)/math.Max(k, 0.35))
		})
	}
}

func (c *canvas) rgba() *image.RGBA {
	img := image.NewRGBA(image.Rect(0, 0, c.w, c.h))
	for i := 0; i < c.w*c.h; i++ {
		for j := 0; j < 4; j++ {
			img.Pix[i*4+j] = uint8(clamp(c.px[i*4+j])*255 + 0.5)
		}
	}
	return img
}

// nrgba un-premultiplies, for PNG/ICO output.
func (c *canvas) nrgba() *image.NRGBA {
	img := image.NewNRGBA(image.Rect(0, 0, c.w, c.h))
	for i := 0; i < c.w*c.h; i++ {
		a := c.px[i*4+3]
		for j := 0; j < 3; j++ {
			v := 0.0
			if a > 0 {
				v = c.px[i*4+j] / a
			}
			img.Pix[i*4+j] = uint8(clamp(v)*255 + 0.5)
		}
		img.Pix[i*4+3] = uint8(clamp(a)*255 + 0.5)
	}
	return img
}

func face(ttf []byte, size float64) font.Face {
	f, _ := opentype.Parse(ttf)
	fc, _ := opentype.NewFace(f, &opentype.FaceOptions{Size: size, DPI: 72, Hinting: font.HintingFull})
	return fc
}

// text draws a string with a per-pixel color function.
func (c *canvas) text(fc font.Face, s string, x, y float64, colf func(x, y float64) rgb, alpha float64) float64 {
	mask := image.NewAlpha(image.Rect(0, 0, c.w, c.h))
	d := &font.Drawer{Dst: mask, Src: image.NewUniform(color.Alpha{255}), Face: fc,
		Dot: fixed.Point26_6{X: fixed.Int26_6(x * 64), Y: fixed.Int26_6(y * 64)}}
	d.DrawString(s)
	for py := 0; py < c.h; py++ {
		for px := 0; px < c.w; px++ {
			if a := mask.Pix[py*c.w+px]; a > 0 {
				c.over(px, py, colf(float64(px), float64(py)), float64(a)/255*alpha)
			}
		}
	}
	return float64(d.Dot.X)/64 - x
}

func solid(col rgb) func(x, y float64) rgb { return func(x, y float64) rgb { return col } }

func splash(sc float64) *canvas {
	W, H := 560*sc, 340*sc
	c := newCanvas(int(W), int(H))
	m, r := 20*sc, 22*sc
	cw, ch := W-2*m, H-2*m
	// soft shadow
	c.shade(func(x, y float64) (rgb, float64) {
		d := rrect(x, y, m, m+6*sc, cw, ch, r)
		if d < 0 {
			return rgb{}, 0.5
		}
		return rgb{}, 0.5 * math.Pow(clamp(1-d/(18*sc)), 2)
	})
	bg1, bg2 := rgb{25, 22, 36}, rgb{13, 13, 19}
	c.shade(func(x, y float64) (rgb, float64) {
		d := rrect(x, y, m, m, cw, ch, r)
		col := mix(bg1, bg2, (y-m)/ch)
		g1 := 0.38 * math.Exp(-math.Pow(math.Hypot(x-130*sc, y-90*sc)/(190*sc), 2))
		g2 := 0.22 * math.Exp(-math.Pow(math.Hypot(x-500*sc, y-300*sc)/(170*sc), 2))
		col = mix(mix(col, violet, g1), cyan, g2)
		// hairline border
		b := clamp(1-math.Abs(d+0.75*sc)/sc) * 0.10
		col = mix(col, white, b)
		return col, cov(d)
	})
	drawIcon(c, 58*sc, 98*sc, 132*sc)
	bold, reg := face(gobold.TTF, 46*sc), face(goregular.TTF, 46*sc)
	c.text(bold, "Medward", 222*sc, 150*sc, solid(white), 1)
	grad := func(x, y float64) rgb { return mix(rgb{167, 139, 250}, rgb{34, 211, 238}, (x-222*sc)/(250*sc)) }
	c.text(reg, "TriggerPad", 222*sc, 202*sc, grad, 1)
	c.text(face(goregular.TTF, 15*sc), "Numpad sampler   ·   Version 2.0", 224*sc, 236*sc, solid(rgb{150, 150, 172}), 1)
	c.text(face(goregular.TTF, 12*sc), "Loading your pads…", 58*sc, 288*sc, solid(rgb{120, 120, 140}), 1)
	c.shade(func(x, y float64) (rgb, float64) {
		d := rrect(x, y, 58*sc, 296*sc, 444*sc, 3*sc, 1.5*sc)
		return mix(violet, cyan, (x-58*sc)/(444*sc)), cov(d)
	})
	c.text(face(goregular.TTF, 11*sc), "© 2026 Medward", 420*sc, 288*sc, solid(rgb{100, 100, 120}), 1)
	return c
}

func savePNG(path string, img image.Image) {
	f, err := os.Create(path)
	if err != nil {
		panic(err)
	}
	defer f.Close()
	png.Encode(f, img)
}

func icon(size int) *canvas {
	c := newCanvas(size, size)
	drawIcon(c, 0, 0, float64(size))
	return c
}

// writeICO builds a .ico with 32-bit DIB entries (and PNG for 256).
func writeICO(path string, sizes []int) {
	var entries [][]byte
	for _, s := range sizes {
		img := icon(s).nrgba()
		if s >= 256 {
			var b bytes.Buffer
			png.Encode(&b, img)
			entries = append(entries, b.Bytes())
			continue
		}
		var b bytes.Buffer
		binary.Write(&b, binary.LittleEndian, []uint32{40, uint32(s), uint32(s * 2)})
		binary.Write(&b, binary.LittleEndian, []uint16{1, 32})
		binary.Write(&b, binary.LittleEndian, []uint32{0, uint32(s * s * 4), 0, 0, 0, 0})
		for y := s - 1; y >= 0; y-- {
			for x := 0; x < s; x++ {
				p := img.Pix[(y*s+x)*4:]
				b.Write([]byte{p[2], p[1], p[0], p[3]})
			}
		}
		maskRow := ((s + 31) / 32) * 4
		b.Write(make([]byte, maskRow*s))
		entries = append(entries, b.Bytes())
	}
	var out bytes.Buffer
	binary.Write(&out, binary.LittleEndian, []uint16{0, 1, uint16(len(sizes))})
	off := 6 + 16*len(sizes)
	for i, s := range sizes {
		d := uint8(s)
		if s >= 256 {
			d = 0
		}
		out.Write([]byte{d, d, 0, 0})
		binary.Write(&out, binary.LittleEndian, []uint16{1, 32})
		binary.Write(&out, binary.LittleEndian, []uint32{uint32(len(entries[i])), uint32(off)})
		off += len(entries[i])
	}
	for _, e := range entries {
		out.Write(e)
	}
	os.WriteFile(path, out.Bytes(), 0644)
}

// flatten composites onto an opaque background for BMP output.
func flatten(c *canvas, bg rgb) image.Image {
	img := image.NewRGBA(image.Rect(0, 0, c.w, c.h))
	for i := 0; i < c.w*c.h; i++ {
		a := c.px[i*4+3]
		img.Pix[i*4] = uint8(clamp(c.px[i*4]+bg.r/255*(1-a))*255 + .5)
		img.Pix[i*4+1] = uint8(clamp(c.px[i*4+1]+bg.g/255*(1-a))*255 + .5)
		img.Pix[i*4+2] = uint8(clamp(c.px[i*4+2]+bg.b/255*(1-a))*255 + .5)
		img.Pix[i*4+3] = 255
	}
	return img
}

func saveBMP(path string, img image.Image) {
	f, _ := os.Create(path)
	defer f.Close()
	bmp.Encode(f, img)
}

func main() {
	os.MkdirAll("assets", 0755)
	os.MkdirAll("winres", 0755)
	os.MkdirAll("installer", 0755)

	savePNG("winres/icon.png", icon(256).nrgba())
	savePNG("assets/logo.png", icon(128).nrgba())
	savePNG("assets/splash.png", splash(1).nrgba())
	savePNG("assets/splash@2x.png", splash(2).nrgba())
	writeICO("installer/icon.ico", []int{16, 24, 32, 48, 64, 256})

	// Installer welcome/finish side image (164x314).
	w := newCanvas(164, 314)
	w.shade(func(x, y float64) (rgb, float64) {
		col := mix(rgb{30, 20, 60}, rgb{12, 12, 20}, y/314)
		col = mix(col, violet, 0.45*math.Exp(-math.Pow(math.Hypot(x-40, y-60)/140, 2)))
		col = mix(col, cyan, 0.25*math.Exp(-math.Pow(math.Hypot(x-150, y-300)/120, 2)))
		return col, 1
	})
	drawIcon(w, 34, 56, 96)
	w.text(face(gobold.TTF, 20), "Medward", 82-50, 196, solid(white), 1)
	w.text(face(goregular.TTF, 20), "TriggerPad", 82-52, 222, func(x, y float64) rgb { return mix(rgb{167, 139, 250}, rgb{34, 211, 238}, (x-30)/104) }, 1)
	w.text(face(goregular.TTF, 11), "Version 2.0", 82-30, 246, solid(rgb{150, 150, 172}), 1)
	saveBMP("installer/welcome.bmp", flatten(w, rgb{}))

	// Installer header image (150x57), white background.
	h := newCanvas(150, 57)
	drawIcon(h, 100, 6, 44)
	h.text(face(gobold.TTF, 13), "Medward", 14, 26, solid(rgb{40, 30, 70}), 1)
	h.text(face(goregular.TTF, 13), "TriggerPad", 14, 42, solid(violet), 1)
	saveBMP("installer/header.bmp", flatten(h, white))
}
