//go:build windows

package main

import (
	"math"
	"syscall"
	"unsafe"
)

var (
	user32   = syscall.NewLazyDLL("user32.dll")
	kernel32 = syscall.NewLazyDLL("kernel32.dll")
	gdi32    = syscall.NewLazyDLL("gdi32.dll")
	gdiplus  = syscall.NewLazyDLL("gdiplus.dll")
	winmm    = syscall.NewLazyDLL("winmm.dll")
	comdlg32 = syscall.NewLazyDLL("comdlg32.dll")
	shell32  = syscall.NewLazyDLL("shell32.dll")
	dwmapi   = syscall.NewLazyDLL("dwmapi.dll")

	pRegisterClassExW    = user32.NewProc("RegisterClassExW")
	pCreateWindowExW     = user32.NewProc("CreateWindowExW")
	pDestroyWindow       = user32.NewProc("DestroyWindow")
	pDefWindowProcW      = user32.NewProc("DefWindowProcW")
	pGetMessageW         = user32.NewProc("GetMessageW")
	pPeekMessageW        = user32.NewProc("PeekMessageW")
	pTranslateMessage    = user32.NewProc("TranslateMessage")
	pDispatchMessageW    = user32.NewProc("DispatchMessageW")
	pPostQuitMessage     = user32.NewProc("PostQuitMessage")
	pPostMessageW        = user32.NewProc("PostMessageW")
	pShowWindow          = user32.NewProc("ShowWindow")
	pSetForegroundWindow = user32.NewProc("SetForegroundWindow")
	pFindWindowW         = user32.NewProc("FindWindowW")
	pLoadCursorW         = user32.NewProc("LoadCursorW")
	pSetCursor           = user32.NewProc("SetCursor")
	pLoadImageW          = user32.NewProc("LoadImageW")
	pSetWindowsHookExW   = user32.NewProc("SetWindowsHookExW")
	pCallNextHookEx      = user32.NewProc("CallNextHookEx")
	pUnhookWindowsHookEx = user32.NewProc("UnhookWindowsHookEx")
	pMessageBoxW         = user32.NewProc("MessageBoxW")
	pInvalidateRect      = user32.NewProc("InvalidateRect")
	pBeginPaint          = user32.NewProc("BeginPaint")
	pEndPaint            = user32.NewProc("EndPaint")
	pGetDC               = user32.NewProc("GetDC")
	pReleaseDC           = user32.NewProc("ReleaseDC")
	pSetTimer            = user32.NewProc("SetTimer")
	pSetCapture          = user32.NewProc("SetCapture")
	pReleaseCapture      = user32.NewProc("ReleaseCapture")
	pTrackMouseEvent     = user32.NewProc("TrackMouseEvent")
	pGetSystemMetrics    = user32.NewProc("GetSystemMetrics")
	pAdjustWindowRectEx  = user32.NewProc("AdjustWindowRectEx")
	pUpdateLayeredWindow = user32.NewProc("UpdateLayeredWindow")
	pDrawTextW           = user32.NewProc("DrawTextW")
	pScreenToClient      = user32.NewProc("ScreenToClient")
	pGetModuleHandleW    = kernel32.NewProc("GetModuleHandleW")
	pCreateMutexW        = kernel32.NewProc("CreateMutexW")
	pCreateFontW         = gdi32.NewProc("CreateFontW")
	pCreateCompatibleDC  = gdi32.NewProc("CreateCompatibleDC")
	pCreateCompatibleBmp = gdi32.NewProc("CreateCompatibleBitmap")
	pCreateDIBSection    = gdi32.NewProc("CreateDIBSection")
	pSelectObject        = gdi32.NewProc("SelectObject")
	pDeleteObject        = gdi32.NewProc("DeleteObject")
	pDeleteDC            = gdi32.NewProc("DeleteDC")
	pBitBlt              = gdi32.NewProc("BitBlt")
	pSetBkMode           = gdi32.NewProc("SetBkMode")
	pSetTextColor        = gdi32.NewProc("SetTextColor")
	pGetDeviceCaps       = gdi32.NewProc("GetDeviceCaps")
	pMciSendStringW      = winmm.NewProc("mciSendStringW")
	pGetOpenFileNameW    = comdlg32.NewProc("GetOpenFileNameW")
	pDragAcceptFiles     = shell32.NewProc("DragAcceptFiles")
	pDragQueryFileW      = shell32.NewProc("DragQueryFileW")
	pDragQueryPoint      = shell32.NewProc("DragQueryPoint")
	pDragFinish          = shell32.NewProc("DragFinish")
	pDwmSetWindowAttr    = dwmapi.NewProc("DwmSetWindowAttribute")

	pGdiplusStartup       = gdiplus.NewProc("GdiplusStartup")
	pGdipCreateFromHDC    = gdiplus.NewProc("GdipCreateFromHDC")
	pGdipDeleteGraphics   = gdiplus.NewProc("GdipDeleteGraphics")
	pGdipSetSmoothingMode = gdiplus.NewProc("GdipSetSmoothingMode")
	pGdipSetPixelOffset   = gdiplus.NewProc("GdipSetPixelOffsetMode")
	pGdipSetInterpolation = gdiplus.NewProc("GdipSetInterpolationMode")
	pGdipCreateSolidFill  = gdiplus.NewProc("GdipCreateSolidFill")
	pGdipCreateLineBrushI = gdiplus.NewProc("GdipCreateLineBrushI")
	pGdipDeleteBrush      = gdiplus.NewProc("GdipDeleteBrush")
	pGdipCreatePen1       = gdiplus.NewProc("GdipCreatePen1")
	pGdipDeletePen        = gdiplus.NewProc("GdipDeletePen")
	pGdipCreatePath       = gdiplus.NewProc("GdipCreatePath")
	pGdipDeletePath       = gdiplus.NewProc("GdipDeletePath")
	pGdipAddPathArc       = gdiplus.NewProc("GdipAddPathArc")
	pGdipClosePathFigure  = gdiplus.NewProc("GdipClosePathFigure")
	pGdipFillPath         = gdiplus.NewProc("GdipFillPath")
	pGdipDrawPath         = gdiplus.NewProc("GdipDrawPath")
	pGdipFillEllipse      = gdiplus.NewProc("GdipFillEllipse")
	pGdipFillRectangle    = gdiplus.NewProc("GdipFillRectangle")
	pGdipCreateBmpScan0   = gdiplus.NewProc("GdipCreateBitmapFromScan0")
	pGdipDrawImageRect    = gdiplus.NewProc("GdipDrawImageRect")
)

const (
	wmDestroy     = 0x0002
	wmClose       = 0x0010
	wmPaint       = 0x000F
	wmEraseBkgnd  = 0x0014
	wmSetCursor   = 0x0020
	wmTimer       = 0x0113
	wmMouseMove   = 0x0200
	wmLButtonDown = 0x0201
	wmLButtonUp   = 0x0202
	wmRButtonDown = 0x0204
	wmMouseLeave  = 0x02A3
	wmDropFiles   = 0x0233
	wmKeyDown     = 0x0100
	wmKeyUp       = 0x0101
	wmSysKeyDown  = 0x0104
	wmSysKeyUp    = 0x0105
	wmPlay        = 0x8001
	wmStopAll     = 0x8002
	wmPeaksReady  = 0x8003
)

type wndClassEx struct {
	cbSize, style                      uint32
	lpfnWndProc                        uintptr
	cbClsExtra, cbWndExtra             int32
	hInstance, hIcon, hCursor, hbrBack uintptr
	lpszMenuName, lpszClassName        *uint16
	hIconSm                            uintptr
}

type msgT struct {
	hwnd           uintptr
	message        uint32
	wParam, lParam uintptr
	time           uint32
	x, y           int32
	priv           uint32
}

type rectT struct{ l, t, r, b int32 }
type pointT struct{ x, y int32 }

type paintStruct struct {
	hdc       uintptr
	erase     int32
	rc        rectT
	restore   int32
	incUpdate int32
	reserved  [32]byte
}

type kbdHook struct {
	vk, scan, flags, time uint32
	extra                 uintptr
}

type trackMouse struct {
	cbSize, flags uint32
	hwnd          uintptr
	hover         uint32
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

type bitmapInfo struct {
	size                   uint32
	width, height          int32
	planes, bitCount       uint16
	compression, sizeImage uint32
	xppm, yppm             int32
	clrUsed, clrImportant  uint32
	colors                 uint32
}

func u16(s string) *uint16  { p, _ := syscall.UTF16PtrFromString(s); return p }
func up(s string) uintptr   { return uintptr(unsafe.Pointer(u16(s))) }
func f32(v float64) uintptr { return uintptr(math.Float32bits(float32(v))) }

func lo(v uintptr) int32 { return int32(int16(v & 0xFFFF)) }
func hi(v uintptr) int32 { return int32(int16((v >> 16) & 0xFFFF)) }

func invalidate() { pInvalidateRect.Call(mainWnd, 0, 0) }
