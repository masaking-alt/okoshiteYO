package com.anonymous.okoshiteyo.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Bundle
import androidx.core.content.ContextCompat

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != AlarmConstants.ACTION_FIRE) {
            return
        }
        val payload = intent.extras ?: Bundle()
        AlarmEventEmitter.emitIfReady(context, payload)
        val serviceIntent = Intent(context, AlarmForegroundService::class.java).apply {
            action = AlarmConstants.ACTION_FIRE
            putExtras(payload)
        }
        ContextCompat.startForegroundService(context, serviceIntent)
    }
}
