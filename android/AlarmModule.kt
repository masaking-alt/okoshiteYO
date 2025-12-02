package com.okoshiteyo

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import android.util.Log

class AlarmModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    // JavaScriptからこのモジュールを呼ぶときの名前
    // NativeModules.AlarmModule でアクセスできるようになる
    override fun getName(): String {
        return "AlarmModule"
    }

    // アラームをセットするメソッド
    // @ReactMethod をつけるとJSから呼べるようになる
    @ReactMethod
    fun setAlarm(timestamp: Double, promise: Promise) {
        try {
            Log.d("AlarmModule", "Alarm set for timestamp: $timestamp")
            // ここにAlarmManagerを使った実装を書く
            
            promise.resolve("Alarm set successfully")
        } catch (e: Exception) {
            promise.reject("SET_ALARM_ERROR", e)
        }
    }

    // アラームを止めるメソッド
    @ReactMethod
    fun stopAlarm(promise: Promise) {
        try {
            Log.d("AlarmModule", "Alarm stopped")
            // ここに音を止める実装を書く

            promise.resolve("Alarm stopped successfully")
        } catch (e: Exception) {
            promise.reject("STOP_ALARM_ERROR", e)
        }
    }
}
