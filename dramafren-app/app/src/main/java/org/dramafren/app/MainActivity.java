package org.dramafren.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.*;
import android.widget.FrameLayout;

public class MainActivity extends Activity {
    private static final String HOME = "https://dramafren.org/";
    private WebView web;
    private View fullView;
    private WebChromeClient.CustomViewCallback fullCb;
    private FrameLayout root;

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        root = new FrameLayout(this);
        web = new WebView(this);
        root.addView(web);
        setContentView(root);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, true);
        web.setWebViewClient(new WebViewClient());
        web.setWebChromeClient(new WebChromeClient() {
            // Full-screen video support
            @Override public void onShowCustomView(View v, CustomViewCallback cb) {
                fullView = v; fullCb = cb;
                root.addView(v); web.setVisibility(View.GONE);
                getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
            }
            @Override public void onHideCustomView() { exitFull(); }
            // Block pop-up ad windows
            @Override public boolean onCreateWindow(WebView v, boolean d, boolean g, android.os.Message m) { return false; }
        });
        if (b != null) web.restoreState(b); else web.loadUrl(HOME);
    }

    private void exitFull() {
        if (fullView == null) return;
        root.removeView(fullView); fullView = null;
        web.setVisibility(View.VISIBLE);
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        if (fullCb != null) fullCb.onCustomViewHidden();
    }

    @Override protected void onSaveInstanceState(Bundle o) { super.onSaveInstanceState(o); web.saveState(o); }

    @Override public void onBackPressed() {
        if (fullView != null) exitFull();
        else if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }
}
