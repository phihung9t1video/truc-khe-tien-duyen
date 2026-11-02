package io.github.phihung9t1video.truckhetienduyen;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

// Giữ game chạy khi bị ẩn xuống nền: hiện một thông báo "đang chạy nền", bấm vào để mở lại game
public class KeepAliveService extends Service {
    static final String CH = "tk_bg";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && nm.getNotificationChannel(CH) == null) {
            NotificationChannel c = new NotificationChannel(CH, "Chạy nền", NotificationManager.IMPORTANCE_LOW);
            c.setDescription("Giữ game chạy khi ẩn xuống nền");
            nm.createNotificationChannel(c);
        }
        Intent open = new Intent(this, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        PendingIntent pi = PendingIntent.getActivity(this, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        Notification.Builder b = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O ? new Notification.Builder(this, CH) : new Notification.Builder(this);
        Notification n = b.setContentTitle("Trúc Khê Tiên Duyên đang chạy nền")
            .setContentText("Nhân vật vẫn đang luyện công. Bấm để mở lại game.")
            .setSmallIcon(R.mipmap.ic_launcher).setContentIntent(pi).setOngoing(true).build();
        try {
            if (Build.VERSION.SDK_INT >= 34) startForeground(1, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
            else startForeground(1, n);
        } catch (Exception e) { stopSelf(); }
        return START_NOT_STICKY;
    }

    @Override
    public IBinder onBind(Intent i) { return null; }
}
