package com.anonymous.okoshiteyo.alarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle

class AlarmScheduler(private val context: Context) {
    private val alarmManager = context.getSystemService(AlarmManager::class.java)

    fun scheduleExact(alarmId: String, triggerAtMillis: Long, payload: Bundle) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
            throw IllegalStateException("Exact alarm permission not granted.")
        }
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmConstants.ACTION_FIRE
            putExtras(payload)
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId.hashCode(),
            intent,
            pendingFlags()
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
        } else {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
        }
    }

    fun cancel(alarmId: String) {
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = AlarmConstants.ACTION_FIRE
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context,
            alarmId.hashCode(),
            intent,
            pendingFlags()
        )
        alarmManager.cancel(pendingIntent)
        pendingIntent.cancel()
    }

    private fun pendingFlags(): Int {
        return PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    }
}
