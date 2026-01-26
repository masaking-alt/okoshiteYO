package com.anonymous.okoshiteyo.alarm

import android.content.Context
import android.graphics.Bitmap
import org.tensorflow.lite.support.image.TensorImage
import org.tensorflow.lite.task.vision.detector.ObjectDetector
import java.util.Locale

class ObjectDetectorHelper(private val context: Context) {
    private val detector: ObjectDetector by lazy {
        val options = ObjectDetector.ObjectDetectorOptions.builder()
            .setMaxResults(10)
            .setScoreThreshold(0.0f)
            .build()
        ObjectDetector.createFromFileAndOptions(context, MODEL_FILE_NAME, options)
    }

    fun detect(bitmap: Bitmap, targetLabel: String): Boolean {
        val normalizedLabel = targetLabel.trim().lowercase(Locale.US)
        if (normalizedLabel.isEmpty()) {
            return false
        }
        val image = TensorImage.fromBitmap(bitmap)
        val results = detector.detect(image)
        for (detection in results) {
            for (category in detection.categories) {
                if (category.label.lowercase(Locale.US) == normalizedLabel && category.score >= MIN_SCORE) {
                    return true
                }
            }
        }
        return false
    }

    companion object {
        private const val MODEL_FILE_NAME = "efficientdet_lite0.tflite"
        private const val MIN_SCORE = 0.3f
    }
}
