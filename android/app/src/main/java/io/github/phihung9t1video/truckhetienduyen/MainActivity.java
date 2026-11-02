package io.github.phihung9t1video.truckhetienduyen;

import android.app.AppOpsManager;
import android.app.PictureInPictureParams;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Process;
import android.provider.Settings;
import android.util.Rational;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.PluginHandle;

public class MainActivity extends BridgeActivity {
    private SharedPreferences prefs;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(TKNativePlugin.class);
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("tk", MODE_PRIVATE);
        getWindow().getDecorView().setBackgroundColor(Color.BLACK);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            getWindow().getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        hideBars();
        // xin quyền thông báo (để hiện "đang chạy nền" khi bấm Ẩn) một lần
        if (Build.VERSION.SDK_INT >= 33 && !prefs.getBoolean("askedNotif", false) && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            prefs.edit().putBoolean("askedNotif", true).apply();
            try { requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 7); } catch (Exception ignored) { }
        }
    }

    boolean autoPipOn() { return prefs == null || prefs.getBoolean("autoPip", true); }
    void setAutoPip(boolean on) { prefs.edit().putBoolean("autoPip", on).apply(); }

    // máy có cho phép app dùng "Hình trong hình" không (một số máy tắt sẵn)
    boolean pipAllowed() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false;
        try {
            AppOpsManager ops = (AppOpsManager) getSystemService(APP_OPS_SERVICE);
            int m = ops.checkOpNoThrow(AppOpsManager.OPSTR_PICTURE_IN_PICTURE, Process.myUid(), getPackageName());
            return m == AppOpsManager.MODE_ALLOWED;
        } catch (Exception e) { return true; }
    }

    void openPipSettings() {
        try {
            Intent i = new Intent("android.settings.PICTURE_IN_PICTURE_SETTINGS", Uri.parse("package:" + getPackageName()));
            startActivity(i);
        } catch (Exception e) {
            try { startActivity(new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + getPackageName()))); } catch (Exception ignored) { }
        }
    }

    // Thu nhỏ game thành cửa sổ nổi: game vẫn chạy (tự đánh, giữ tổ đội) trong khi dùng ứng dụng khác
    boolean enterPip() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false;
        try {
            PictureInPictureParams p = new PictureInPictureParams.Builder().setAspectRatio(new Rational(16, 9)).build();
            return enterPictureInPictureMode(p);
        } catch (Exception e) { return false; }
    }

    // Ẩn hẳn xuống nền (không cửa sổ nổi), game vẫn chạy nhờ dịch vụ nền
    private boolean hiding = false;
    void hideToBackground() {
        hiding = true;
        try {
            Intent s = new Intent(this, KeepAliveService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) startForegroundService(s); else startService(s);
        } catch (Exception ignored) { }
        moveTaskToBack(true);
    }

    @Override
    public void onResume() {
        super.onResume();
        hiding = false;
        try { stopService(new Intent(this, KeepAliveService.class)); } catch (Exception ignored) { }
    }

    // Bấm nút Home / chuyển ứng dụng: tự thu nhỏ thành cửa sổ nổi (tắt được trong Cài đặt của game)
    @Override
    protected void onUserLeaveHint() {
        super.onUserLeaveHint();
        if (autoPipOn() && !hiding) enterPip();
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
        try {
            PluginHandle h = getBridge().getPlugin("TKNative");
            if (h != null) ((TKNativePlugin) h.getInstance()).notifyPip(inPip);
        } catch (Exception ignored) { }
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
