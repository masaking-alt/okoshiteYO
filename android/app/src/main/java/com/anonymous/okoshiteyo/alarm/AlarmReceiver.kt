package com.anonymous.okoshiteyo.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.util.Log
import androidx.core.content.ContextCompat
import com.anonymous.okoshiteyo.BuildConfig

private const val TAG = "AlarmReceiver"

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != AlarmConstants.ACTION_FIRE) {
            return
        }
        val payload = intent.extras ?: Bundle()
        if (BuildConfig.DEBUG) {
            val keys = payload.keySet().joinToString(",")
            Log.d(TAG, "onReceive action=${intent.action} extrasKeys=[$keys]")
        }
        AlarmEventEmitter.emitIfReady(context, payload)
        val serviceIntent = Intent(context, AlarmForegroundService::class.java).apply {
            action = AlarmConstants.ACTION_FIRE
            putExtras(payload)
        }
        ContextCompat.startForegroundService(context, serviceIntent)
    }
}
