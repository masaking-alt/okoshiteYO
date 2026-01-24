package com.anonymous.okoshiteyo.alarm

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.media.AudioManager
import android.util.Log
import com.anonymous.okoshiteyo.BuildConfig
import com.anonymous.okoshiteyo.R
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import expo.modules.ReactActivityDelegateWrapper
import android.content.Intent

private const val TAG = "AlarmRingingActivity"

class AlarmRingingActivity : ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.AppTheme)
        super.onCreate(null)
        if (BuildConfig.DEBUG) {
            val keys = intent?.extras?.keySet()?.joinToString(",") ?: ""
            Log.d(TAG, "onCreate extrasKeys=[$keys]")
        }
        intent?.extras?.let { AlarmEventEmitter.emitIfReady(this, it) }
        volumeControlStream = AudioManager.STREAM_ALARM
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or
                    WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
            )
        }
    }

    override fun getMainComponentName(): String = "main"

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return ReactActivityDelegateWrapper(
            this,
            BuildConfig.IS_NEW_ARCHITECTURE_ENABLED,
            object : DefaultReactActivityDelegate(
                this,
                mainComponentName,
                fabricEnabled
            ) {
                override fun getLaunchOptions(): Bundle? {
                    val extras = this@AlarmRingingActivity.intent?.extras ?: return null
                    return Bundle().apply {
                        putString("entryPoint", "alarm")
                        putBundle("alarm", Bundle(extras))
                    }
                }
            }
        )
    }
    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent) // ReactActivity が持つ intent を更新
        if (BuildConfig.DEBUG) {
            val keys = intent.extras?.keySet()?.joinToString(",") ?: ""
            Log.d(TAG, "onNewIntent extrasKeys=[$keys]")
        }
        val extras = intent.extras ?: return
        AlarmEventEmitter.emitIfReady(this, extras)
    }
}
