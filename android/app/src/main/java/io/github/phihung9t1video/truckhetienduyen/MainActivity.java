package io.github.phihung9t1video.truckhetienduyen;

import android.app.PictureInPictureParams;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.Rational;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private SharedPreferences prefs;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("tk", MODE_PRIVATE);
        getWindow().getDecorView().setBackgroundColor(Color.BLACK);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        hideBars();
        // Cho game gọi: TKNative.pip() để thu nhỏ thành cửa sổ nổi; TKNative.setAutoPip(true/false)
        WebView wv = getBridge().getWebView();
        wv.addJavascriptInterface(new Object() {
            @JavascriptInterface public void pip() { runOnUiThread(() -> enterPip()); }
            @JavascriptInterface public boolean canPip() { return Build.VERSION.SDK_INT >= Build.VERSION_CODES.O; }
            @JavascriptInterface public void setAutoPip(boolean on) { prefs.edit().putBoolean("autoPip", on).apply(); }
            @JavascriptInterface public boolean autoPip() { return prefs.getBoolean("autoPip", true); }
        }, "TKNative");
    }

    // Thu nhỏ game thành cửa sổ nổi: game vẫn chạy (tự đánh, giữ tổ đội) trong khi dùng ứng dụng khác
    private void enterPip() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                PictureInPictureParams p = new PictureInPictureParams.Builder().setAspectRatio(new Rational(16, 9)).build();
                enterPictureInPictureMode(p);
            } catch (Exception ignored) { }
        }
    }

    // Bấm nút Home / chuyển ứng dụng: tự thu nhỏ thành cửa sổ nổi (tắt được trong Cài đặt của game)
    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        if (prefs.getBoolean("autoPip", true)) enterPip();
    }

    // Không để WebView bị tạm dừng khi ở cửa sổ nổi hoặc chạy nền ngắn
    @Override
    public void onPause() {
        super.onPause();
        try { getBridge().getWebView().onResume(); getBridge().getWebView().resumeTimers(); } catch (Exception ignored) { }
    }

    @Override
    public void onPictureInPictureModeChanged(boolean inPip, Configuration cfg) {
        super.onPictureInPictureModeChanged(inPip, cfg);
        try { getBridge().getWebView().evaluateJavascript("window.onPipChange&&window.onPipChange(" + inPip + ")", null); } catch (Exception ignored) { }
        if (!inPip) hideBars();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideBars();
    }

    // Chơi toàn màn hình: ẩn thanh trạng thái và thanh điều hướng (vuốt từ mép để hiện tạm)
    private void hideBars() {
        WindowInsetsControllerCompat c = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        c.hide(WindowInsetsCompat.Type.systemBars());
        c.setSystemBarsBehavior(WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
    }
}
