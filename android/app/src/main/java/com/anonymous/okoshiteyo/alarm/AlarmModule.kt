package com.anonymous.okoshiteyo.alarm

import android.app.AlarmManager
import android.app.NotificationManager
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap

class AlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String = "AlarmModule"

    @ReactMethod
    fun setAlarm(timestamp: Double, promise: Promise) {
        val alarmId = "alarm_${timestamp.toLong()}"
        val payload = Bundle().apply {
            putString(AlarmConstants.EXTRA_ALARM_ID, alarmId)
        }
        scheduleInternal(alarmId, timestamp, payload, promise)
    }

    @ReactMethod
    fun scheduleAlarm(alarmId: String, timestamp: Double, options: ReadableMap?, promise: Promise) {
        val payload = Bundle().apply {
            putString(AlarmConstants.EXTRA_ALARM_ID, alarmId)
            if (options != null) {
                if (options.hasKey("title")) {
                    putString(AlarmConstants.EXTRA_TITLE, options.getString("title"))
                }
                if (options.hasKey("mode")) {
                    putString(AlarmConstants.EXTRA_MODE, options.getString("mode"))
                }
                if (options.hasKey("time")) {
                    putString(AlarmConstants.EXTRA_TIME, options.getString("time"))
                }
                if (options.hasKey("repeatDays")) {
                    val repeatDays = options.getArray("repeatDays")
                    putStringArray(AlarmConstants.EXTRA_REPEAT_DAYS, toStringArray(repeatDays))
                }
            }
        }
        scheduleInternal(alarmId, timestamp, payload, promise)
    }

    @ReactMethod
    fun cancelAlarm(alarmId: String, promise: Promise) {
        try {
            AlarmScheduler(reactApplicationContext).cancel(alarmId)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("CANCEL_ALARM_ERROR", e)
        }
    }

    @ReactMethod
    fun stopAlarm(promise: Promise) {
        try {
            AlarmForegroundService.stop(reactApplicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_ALARM_ERROR", e)
        }
    }

    @ReactMethod
    fun canScheduleExactAlarms(promise: Promise) {
        val allowed = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val alarmManager = reactApplicationContext.getSystemService(AlarmManager::class.java)
            alarmManager.canScheduleExactAlarms()
        } else {
            true
        }
        promise.resolve(allowed)
    }

    @ReactMethod
    fun openExactAlarmSettings(promise: Promise) {
        val intent = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM)
        } else {
            Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:${reactApplicationContext.packageName}")
            }
        }
        startSettingsIntent(intent, promise)
    }

    @ReactMethod
    fun canBypassDnd(promise: Promise) {
        val notificationManager =
            reactApplicationContext.getSystemService(NotificationManager::class.java)
        promise.resolve(notificationManager.isNotificationPolicyAccessGranted)
    }

    @ReactMethod
    fun openDndSettings(promise: Promise) {
        val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)
        startSettingsIntent(intent, promise)
    }

    @ReactMethod
    fun openNotificationSettings(promise: Promise) {
        val intent = Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).apply {
            putExtra(Settings.EXTRA_APP_PACKAGE, reactApplicationContext.packageName)
        }
        startSettingsIntent(intent, promise)
    }

    private fun scheduleInternal(
        alarmId: String,
        timestamp: Double,
        payload: Bundle,
        promise: Promise
    ) {
        try {
            AlarmScheduler(reactApplicationContext).scheduleExact(
                alarmId,
                timestamp.toLong(),
                payload
            )
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SET_ALARM_ERROR", e)
        }
    }

    private fun startSettingsIntent(intent: Intent, promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity != null) {
            activity.startActivity(intent)
            promise.resolve(true)
            return
        }
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
        promise.resolve(true)
    }

    private fun toStringArray(value: ReadableArray?): Array<String> {
        if (value == null) {
            return emptyArray()
        }
        val result = ArrayList<String>()
        for (index in 0 until value.size()) {
            val item = value.getString(index)
            if (item != null) {
                result.add(item)
            }
        }
        return result.toTypedArray()
    }
}
