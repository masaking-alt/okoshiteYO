package com.anonymous.okoshiteyo.alarm

import android.content.Context
import android.os.Bundle
import com.facebook.react.ReactApplication
import com.facebook.react.ReactInstanceManager
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.ArrayDeque
import android.util.Log
import com.anonymous.okoshiteyo.BuildConfig

private const val TAG = "AlarmEventEmitter"

object AlarmEventEmitter {
    private const val EVENT_ALARM_FIRED = "AlarmFired"
    private val pendingPayloads: ArrayDeque<Bundle> = ArrayDeque()
    private var instanceListener: ReactInstanceManager.ReactInstanceEventListener? = null

    @Synchronized
    fun emitIfReady(context: Context, payload: Bundle) {
        AlarmPendingStore.save(context, payload)
        val app = context.applicationContext as? ReactApplication ?: return
        val manager = app.reactNativeHost.reactInstanceManager
        val reactContext = manager.currentReactContext
        if (reactContext != null) {
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "emit now pendingSize=${pendingPayloads.size}")
            }
            emit(reactContext, payload)
            flushPending(reactContext)
            return
        }

        // ReactContext 未準備なのでキューに保存
        pendingPayloads.add(Bundle(payload))
        if (BuildConfig.DEBUG) {
            Log.d(TAG, "queued pendingSize=${pendingPayloads.size}")
        }
        if (instanceListener == null) {
            instanceListener = ReactInstanceManager.ReactInstanceEventListener { rc ->
                synchronized(this) {
                    if (BuildConfig.DEBUG) {
                        Log.d(TAG, "reactContext ready flush pendingSize=${pendingPayloads.size}")
                    }
                    flushPending(rc)
                    instanceListener?.let { manager.removeReactInstanceEventListener(it) }
                    instanceListener = null
                }
            }
            instanceListener?.let { manager.addReactInstanceEventListener(it) }
        }
    }

    private fun flushPending(reactContext: ReactContext) {
        while (pendingPayloads.isNotEmpty()) {
            emit(reactContext, pendingPayloads.removeFirst())
        }
    }

    private fun emit(reactContext: ReactContext, payload: Bundle) {
        val map = Arguments.fromBundle(payload)
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class
                .java)
            .emit(EVENT_ALARM_FIRED, map)
    }
}
