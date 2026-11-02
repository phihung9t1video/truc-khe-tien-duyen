package io.github.phihung9t1video.truckhetienduyen;

import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// Cầu nối game <-> Android: thu nhỏ thành cửa sổ nổi (hình trong hình)
@CapacitorPlugin(name = "TKNative")
public class TKNativePlugin extends Plugin {
    @PluginMethod
    public void info(PluginCall call) {
        MainActivity a = (MainActivity) getActivity();
        JSObject r = new JSObject();
        r.put("canPip", Build.VERSION.SDK_INT >= Build.VERSION_CODES.O);
        r.put("autoPip", a.autoPipOn());
        r.put("pipAllowed", a.pipAllowed());
        call.resolve(r);
    }

    @PluginMethod
    public void pip(PluginCall call) {
        MainActivity a = (MainActivity) getActivity();
        a.runOnUiThread(() -> {
            JSObject r = new JSObject();
            r.put("ok", a.enterPip());
            r.put("pipAllowed", a.pipAllowed());
            call.resolve(r);
        });
    }

    @PluginMethod
    public void setAutoPip(PluginCall call) {
        ((MainActivity) getActivity()).setAutoPip(call.getBoolean("on", true));
        call.resolve();
    }

    @PluginMethod
    public void hide(PluginCall call) {
        MainActivity a = (MainActivity) getActivity();
        a.runOnUiThread(a::hideToBackground);
        call.resolve();
    }

    // mở trang cài đặt "Hình trong hình" của app (khi máy đang chặn)
    @PluginMethod
    public void openPipSettings(PluginCall call) {
        ((MainActivity) getActivity()).openPipSettings();
        call.resolve();
    }

    public void notifyPip(boolean inPip) {
        JSObject r = new JSObject();
        r.put("inPip", inPip);
        notifyListeners("pipChange", r);
    }
}
