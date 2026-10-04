//go:build windows

package main

import (
	"image"
	"unsafe"
)

// col is an ARGB color.
type col uint32

func rgbc(r, g, b uint8) col { return col(0xFF000000 | uint32(r)<<16 | uint32(g)<<8 | uint32(b)) }
func hex(v uint32) col       { return col(0xFF000000 | v) }

func (c col) alpha(a float64) col { return col(uint32(float64(0xFF)*a)<<24 | uint32(c)&0xFFFFFF) }

func (c col) mix(o col, t float64) col {
	if t <= 0 {
		return c
	}
	if t >= 1 {
		return o
	}
	ch := func(sh uint) uint32 {
		a, b := float64(uint32(c)>>sh&0xFF), float64(uint32(o)>>sh&0xFF)
		return uint32(a+(b-a)*t) << sh
	}
	return col(0xFF000000 | ch(16) | ch(8) | ch(0))
}

// colorref converts to a GDI COLORREF (0x00BBGGRR).
func (c col) colorref() uintptr {
	return uintptr((uint32(c)>>16)&0xFF | (uint32(c)>>8&0xFF)<<8 | (uint32(c)&0xFF)<<16)
}

// rect is in logical (96-dpi) units.
type rect struct{ x, y, w, h float64 }

func (r rect) has(px, py float64) bool { return px >= r.x && py >= r.y && px < r.x+r.w && py < r.y+r.h }
func (r rect) inset(d float64) rect    { return rect{r.x + d, r.y + d, r.w - 2*d, r.h - 2*d} }

var scale = 1.0

func S(v float64) float64 { return v * scale }

// gfx wraps a GDI+ Graphics plus a deferred list of GDI text ops.
type gfx struct {
	g     uintptr
	hdc   uintptr
	texts []textOp
}

type textOp struct {
	s     string
	r     rect
	font  uintptr
	color col
	flags uintptr
}

func newGfx(hdc uintptr) *gfx {
	x := &gfx{hdc: hdc}
	pGdipCreateFromHDC.Call(hdc, uintptr(unsafe.Pointer(&x.g)))
	pGdipSetSmoothingMode.Call(x.g, 4)
	pGdipSetPixelOffset.Call(x.g, 4)
	pGdipSetInterpolation.Call(x.g, 7)
	return x
}

func roundPath(r rect, rad float64) uintptr {
	var p uintptr
	pGdipCreatePath.Call(0, uintptr(unsafe.Pointer(&p)))
	x, y, w, h, d := S(r.x), S(r.y), S(r.w), S(r.h), S(rad)*2
	if d > w {
		d = w
	}
	if d > h {
		d = h
	}
	if d < 1 {
		d = 1
	}
	pGdipAddPathArc.Call(p, f32(x), f32(y), f32(d), f32(d), f32(180), f32(90))
	pGdipAddPathArc.Call(p, f32(x+w-d), f32(y), f32(d), f32(d), f32(270), f32(90))
	pGdipAddPathArc.Call(p, f32(x+w-d), f32(y+h-d), f32(d), f32(d), f32(0), f32(90))
	pGdipAddPathArc.Call(p, f32(x), f32(y+h-d), f32(d), f32(d), f32(90), f32(90))
	pGdipClosePathFigure.Call(p)
	return p
}

func (x *gfx) fillRound(r rect, rad float64, c col) {
	var b uintptr
	pGdipCreateSolidFill.Call(uintptr(c), uintptr(unsafe.Pointer(&b)))
	p := roundPath(r, rad)
	pGdipFillPath.Call(x.g, b, p)
	pGdipDeletePath.Call(p)
	pGdipDeleteBrush.Call(b)
}

func (x *gfx) fillRoundGrad(r rect, rad float64, c1, c2 col) {
	var b uintptr
	p1 := pointT{int32(S(r.x)), int32(S(r.y))}
	p2 := pointT{int32(S(r.x + r.w)), int32(S(r.y + r.h))}
	pGdipCreateLineBrushI.Call(uintptr(unsafe.Pointer(&p1)), uintptr(unsafe.Pointer(&p2)), uintptr(c1), uintptr(c2), 0, uintptr(unsafe.Pointer(&b)))
	p := roundPath(r, rad)
	pGdipFillPath.Call(x.g, b, p)
	pGdipDeletePath.Call(p)
	pGdipDeleteBrush.Call(b)
}

func (x *gfx) strokeRound(r rect, rad, width float64, c col) {
	var pen uintptr
	pGdipCreatePen1.Call(uintptr(c), f32(S(width)), 2, uintptr(unsafe.Pointer(&pen)))
	p := roundPath(r, rad)
	pGdipDrawPath.Call(x.g, pen, p)
	pGdipDeletePath.Call(p)
	pGdipDeletePen.Call(pen)
}

func (x *gfx) fillRect(r rect, c col) {
	var b uintptr
	pGdipCreateSolidFill.Call(uintptr(c), uintptr(unsafe.Pointer(&b)))
	pGdipFillRectangle.Call(x.g, b, f32(S(r.x)), f32(S(r.y)), f32(S(r.w)), f32(S(r.h)))
	pGdipDeleteBrush.Call(b)
}

func (x *gfx) circle(cx, cy, rad float64, c col) {
	var b uintptr
	pGdipCreateSolidFill.Call(uintptr(c), uintptr(unsafe.Pointer(&b)))
	pGdipFillEllipse.Call(x.g, b, f32(S(cx-rad)), f32(S(cy-rad)), f32(S(2*rad)), f32(S(2*rad)))
	pGdipDeleteBrush.Call(b)
}

func (x *gfx) image(img uintptr, r rect) {
	pGdipDrawImageRect.Call(x.g, img, f32(S(r.x)), f32(S(r.y)), f32(S(r.w)), f32(S(r.h)))
}

const (
	dtLeft     = 0x0
	dtCenter   = 0x1
	dtRight    = 0x2
	dtVCenter  = 0x4
	dtWrap     = 0x10
	dtSingle   = 0x20
	dtNoPrefix = 0x800
	dtEllipsis = 0x8000
)

func (x *gfx) text(s string, r rect, font uintptr, c col, flags uintptr) {
	x.texts = append(x.texts, textOp{s, r, font, c, flags})
}

// finish releases GDI+ and then draws the queued text with GDI (ClearType).
func (x *gfx) finish() {
	pGdipDeleteGraphics.Call(x.g)
	pSetBkMode.Call(x.hdc, 1)
	for _, t := range x.texts {
		pSelectObject.Call(x.hdc, t.font)
		pSetTextColor.Call(x.hdc, t.color.colorref())
		rc := rectT{int32(S(t.r.x)), int32(S(t.r.y)), int32(S(t.r.x + t.r.w)), int32(S(t.r.y + t.r.h))}
		pDrawTextW.Call(x.hdc, up(t.s), ^uintptr(0), uintptr(unsafe.Pointer(&rc)), t.flags|dtNoPrefix)
	}
}

// gdipBitmap converts an image to a GDI+ bitmap (32bpp PARGB). The pixel
// buffer is kept alive for the lifetime of the program.
var keep [][]byte

func gdipBitmap(img image.Image) uintptr {
	b := img.Bounds()
	w, h := b.Dx(), b.Dy()
	buf := make([]byte, w*h*4)
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			r, g, bl, a := img.At(b.Min.X+x, b.Min.Y+y).RGBA() // premultiplied
			i := (y*w + x) * 4
			buf[i], buf[i+1], buf[i+2], buf[i+3] = byte(bl>>8), byte(g>>8), byte(r>>8), byte(a>>8)
		}
	}
	keep = append(keep, buf)
	var bmp uintptr
	pGdipCreateBmpScan0.Call(uintptr(w), uintptr(h), uintptr(w*4), 0xE200B, uintptr(unsafe.Pointer(&buf[0])), uintptr(unsafe.Pointer(&bmp)))
	return bmp
}

func mkFont(px float64, weight int, face string) uintptr {
	f, _, _ := pCreateFontW.Call(uintptr(-int32(S(px))), 0, 0, 0, uintptr(weight), 0, 0, 0, 1, 0, 0, 5, 0, up(face))
	return f
}
