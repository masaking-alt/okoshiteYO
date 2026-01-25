package com.anonymous.okoshiteyo.alarm

import android.content.Context
import android.os.Bundle
import android.util.Log
import com.anonymous.okoshiteyo.BuildConfig
import org.json.JSONArray
import org.json.JSONObject

object AlarmPendingStore {
    private const val PREF_NAME = "alarm_pending_store"
    private const val KEY_PAYLOAD = "payload_json"
    private const val TAG = "AlarmPendingStore"

    fun save(context: Context, payload: Bundle) {
        val json = bundleToJson(payload)
        if (json.length() == 0) {
            return
        }
        if (BuildConfig.DEBUG) {
            val keys = payload.keySet().joinToString(",")
            Log.d(TAG, "save payloadKeys=[$keys]")
        }
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_PAYLOAD, json.toString())
            .apply()
    }

    fun peek(context: Context): Bundle? {
        val prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        val jsonString = prefs.getString(KEY_PAYLOAD, null) ?: return null
        if (BuildConfig.DEBUG) {
            Log.d(TAG, "peek payload")
        }
        return jsonToBundle(JSONObject(jsonString))
    }

    fun clear(context: Context) {
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
            .edit()
            .remove(KEY_PAYLOAD)
            .apply()
    }

    private fun bundleToJson(bundle: Bundle): JSONObject {
        val json = JSONObject()
        for (key in bundle.keySet()) {
            val value = bundle.get(key) ?: continue
            when (value) {
                is String -> json.put(key, value)
                is Int -> json.put(key, value)
                is Long -> json.put(key, value)
                is Boolean -> json.put(key, value)
                is Double -> json.put(key, value)
                is Float -> json.put(key, value.toDouble())
                is Array<*> -> {
                    if (value.isArrayOf<String>()) {
                        json.put(key, JSONArray(value))
                    }
                }
                is ArrayList<*> -> {
                    if (value.all { it is String }) {
                        json.put(key, JSONArray(value))
                    }
                }
            }
        }
        return json
    }

    private fun jsonToBundle(json: JSONObject): Bundle {
        val bundle = Bundle()
        val keys = json.keys()
        while (keys.hasNext()) {
            val key = keys.next()
            val value = json.get(key)
            when (value) {
                is JSONArray -> {
                    val items = Array(value.length()) { index ->
                        value.optString(index)
                    }
                    bundle.putStringArray(key, items)
                }
                is Boolean -> bundle.putBoolean(key, value)
                is Number -> bundle.putDouble(key, value.toDouble())
                else -> bundle.putString(key, value.toString())
            }
        }
        return bundle
    }
}
