package com.anonymous.okoshiteyo.alarm

import android.content.Context
import android.os.Bundle
import com.facebook.react.ReactApplication
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule

object AlarmEventEmitter {
    private const val EVENT_ALARM_FIRED = "AlarmFired"

    fun emitIfReady(context: Context, payload: Bundle) {
        val app = context.applicationContext as? ReactApplication ?: return
        val reactContext = app.reactNativeHost.reactInstanceManager.currentReactContext ?: return
        emit(reactContext, payload)
    }

    private fun emit(reactContext: ReactContext, payload: Bundle) {
        val map = Arguments.fromBundle(payload)
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(EVENT_ALARM_FIRED, map)
    }
}
