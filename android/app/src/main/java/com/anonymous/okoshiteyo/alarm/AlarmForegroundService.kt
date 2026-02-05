package com.anonymous.okoshiteyo.alarm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.ActivityOptions
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.anonymous.okoshiteyo.BuildConfig
import com.anonymous.okoshiteyo.R

private const val TAG = "AlarmForegroundService"

class AlarmForegroundService : Service() {
    private val alarmAudioAttributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_ALARM)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()
    private var mediaPlayer: MediaPlayer? = null
    private var audioManager: AudioManager? = null
    private var focusRequest: AudioFocusRequest? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var vibrator: Vibrator? = null
    private val vibrationHandler = Handler(Looper.getMainLooper())
    private var vibrationRunning = false
    private val vibrationRunnable = object : Runnable {
        override fun run() {
            if (!vibrationRunning) {
                return
            }
            vibrateOnce()
            vibrationHandler.postDelayed(this, VIBRATE_MS + VIBRATE_PAUSE_MS)
        }
    }
    private val audioFocusListener = AudioManager.OnAudioFocusChangeListener { focusChange ->
        if (focusChange == AudioManager.AUDIOFOCUS_GAIN) {
            mediaPlayer?.let { player ->
                if (!player.isPlaying) {
                    player.start()
                }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == AlarmConstants.ACTION_STOP) {
            stopSelf()
            return START_NOT_STICKY
        }
        val payload = intent?.extras
        if (BuildConfig.DEBUG) {
            val keys = payload?.keySet()?.joinToString(",") ?: ""
            Log.d(TAG, "onStartCommand action=${intent?.action} extrasKeys=[$keys]")
        }
        ensureChannel()

        val fullScreenPending = createFullScreenPendingIntent(payload)

        val notification = NotificationCompat.Builder(this, AlarmConstants.CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(payload?.getString(AlarmConstants.EXTRA_TITLE) ?: "Alarm")
            .setContentText("ここをタップ！！")
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setAutoCancel(false)
            .setContentIntent(fullScreenPending)
            .setFullScreenIntent(fullScreenPending, true)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .build()

        startForeground(AlarmConstants.NOTIFICATION_ID, notification)
        startRingtone()
        startVibration()
        launchAlarmActivity(fullScreenPending)
        acquireWakeLock()
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        stopRingtone()
        stopVibration()
        releaseWakeLock()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }
        val manager = getSystemService(NotificationManager::class.java)
        val channel = NotificationChannel(
            AlarmConstants.CHANNEL_ID,
            AlarmConstants.CHANNEL_NAME,
            NotificationManager.IMPORTANCE_HIGH
        )
        val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
        channel.setSound(alarmUri, alarmAudioAttributes)
        channel.enableVibration(true)
        channel.setBypassDnd(true)
        manager.createNotificationChannel(channel)
    }

    private fun startRingtone() {
        val alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
        audioManager = getSystemService(AudioManager::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val request = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE)
                .setAudioAttributes(alarmAudioAttributes)
                .setOnAudioFocusChangeListener(audioFocusListener)
                .build()
            focusRequest = request
            audioManager?.requestAudioFocus(request)
        } else {
            audioManager?.requestAudioFocus(
                audioFocusListener,
                AudioManager.STREAM_ALARM,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT_EXCLUSIVE
            )
        }
        try {
            mediaPlayer = MediaPlayer().apply {
                setAudioAttributes(alarmAudioAttributes)
                setDataSource(this@AlarmForegroundService, alarmUri)
                isLooping = true
                prepare()
                start()
            }
        } catch (e: Exception) {
            stopRingtone()
        }
    }

    private fun stopRingtone() {
        mediaPlayer?.let { player ->
            if (player.isPlaying) {
                player.stop()
            }
            player.release()
        }
        mediaPlayer = null
        audioManager?.let { manager ->
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                focusRequest?.let { manager.abandonAudioFocusRequest(it) }
            } else {
                manager.abandonAudioFocus(audioFocusListener)
            }
        }
        focusRequest = null
        audioManager = null
    }

    private fun startVibration() {
        val target = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = getSystemService(VibratorManager::class.java)
            manager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
        if (!target.hasVibrator()) {
            return
        }
        vibrator = target
        if (vibrationRunning) {
            return
        }
        vibrationRunning = true
        vibrationHandler.removeCallbacks(vibrationRunnable)
        vibrationHandler.post(vibrationRunnable)
    }

    private fun stopVibration() {
        vibrationRunning = false
        vibrationHandler.removeCallbacks(vibrationRunnable)
        vibrator?.cancel()
        vibrator = null
    }

    private fun launchAlarmActivity(pendingIntent: PendingIntent) {
        try {
            val options = pendingIntentSendOptions()
            if (options != null) {
                pendingIntent.send(this, 0, null, null, null, null, options)
            } else {
                pendingIntent.send()
            }
        } catch (_: PendingIntent.CanceledException) {
            // Ignore; notification tap can still open the activity.
        }
    }

    private fun createFullScreenPendingIntent(payload: Bundle?): PendingIntent {
        val alarmId = payload?.getString(AlarmConstants.EXTRA_ALARM_ID)
        val requestCode = alarmId?.hashCode() ?: 0
        val intent = Intent(this, AlarmRingingActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            if (alarmId != null) {
                action = "com.anonymous.okoshiteyo.action.ALARM_RING_$alarmId"
                data = Uri.parse("okoshiteyo://alarm/$alarmId")
            }
            if (payload != null) {
                putExtras(payload)
            }
        }
        return PendingIntent.getActivity(this, requestCode, intent, pendingFlags())
    }

    private fun pendingIntentSendOptions(): Bundle? {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            val options = ActivityOptions.makeBasic()
            options.setPendingIntentBackgroundActivityStartMode(
                ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOWED
            )
            return options.toBundle()
        }
        return null
    }

    private fun vibrateOnce() {
        val target = vibrator ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            target.vibrate(
                VibrationEffect.createOneShot(VIBRATE_MS, VibrationEffect.DEFAULT_AMPLITUDE),
                alarmAudioAttributes
            )
        } else {
            @Suppress("DEPRECATION")
            target.vibrate(VIBRATE_MS)
        }
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "okoshiteyo:alarm"
        ).apply { acquire(60_000L) }
    }

    private fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) {
                it.release()
            }
        }
        wakeLock = null
    }

    private fun pendingFlags(): Int {
        return PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    }

    companion object {
        private const val VIBRATE_MS = 1000L
        private const val VIBRATE_PAUSE_MS = 500L

        fun stop(context: Context) {
            val intent = Intent(context, AlarmForegroundService::class.java).apply {
                action = AlarmConstants.ACTION_STOP
            }
            context.startService(intent)
        }
    }
}
