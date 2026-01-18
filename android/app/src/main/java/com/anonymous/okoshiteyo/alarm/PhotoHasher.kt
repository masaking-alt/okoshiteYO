package com.anonymous.okoshiteyo.alarm

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Color
import android.net.Uri
import java.io.InputStream

object PhotoHasher {
    private const val HASH_WIDTH = 9
    private const val HASH_HEIGHT = 8
    private const val LUMA_MIN = 15.0
    private const val LUMA_SOFT_MIN = 30.0
    private const val LUMA_VARIANCE_MIN = 20.0

    fun computeDHash(context: Context, uriString: String): String {
        val uri = Uri.parse(uriString)
        val inputStream = openStream(context, uri) ?: throw IllegalStateException("Unable to open image stream.")
        val original = inputStream.use { BitmapFactory.decodeStream(it) }
            ?: throw IllegalStateException("Unable to decode bitmap.")

        val scaled = Bitmap.createScaledBitmap(original, HASH_WIDTH, HASH_HEIGHT, true)
        val grayscale = IntArray(HASH_WIDTH * HASH_HEIGHT)
        var sum = 0.0

        for (y in 0 until HASH_HEIGHT) {
            for (x in 0 until HASH_WIDTH) {
                val gray = grayscale(scaled.getPixel(x, y))
                grayscale[y * HASH_WIDTH + x] = gray
                sum += gray.toDouble()
            }
        }

        val mean = sum / grayscale.size
        var varianceSum = 0.0
        for (value in grayscale) {
            val diff = value - mean
            varianceSum += diff * diff
        }
        val variance = varianceSum / grayscale.size
        if (mean < LUMA_MIN || (mean < LUMA_SOFT_MIN && variance < LUMA_VARIANCE_MIN)) {
            throw IllegalStateException("PHOTO_TOO_DARK")
        }

        val builder = StringBuilder(HASH_WIDTH * HASH_HEIGHT)

        for (y in 0 until HASH_HEIGHT) {
            for (x in 0 until HASH_WIDTH - 1) {
                val left = grayscale[y * HASH_WIDTH + x]
                val right = grayscale[y * HASH_WIDTH + x + 1]
                builder.append(if (right > left) '1' else '0')
            }
        }

        return builder.toString()
    }

    private fun grayscale(color: Int): Int {
        val r = Color.red(color)
        val g = Color.green(color)
        val b = Color.blue(color)
        return (0.299 * r + 0.587 * g + 0.114 * b).toInt()
    }

    private fun openStream(context: Context, uri: Uri): InputStream? {
        return if (uri.scheme == "content") {
            context.contentResolver.openInputStream(uri)
        } else {
            context.contentResolver.openInputStream(uri)
        }
    }
}
