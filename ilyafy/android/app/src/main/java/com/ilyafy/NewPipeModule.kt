package com.ilyafy

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableArray
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.schabi.newpipe.extractor.NewPipe
import org.schabi.newpipe.extractor.ServiceList
import org.schabi.newpipe.extractor.downloader.Downloader
import org.schabi.newpipe.extractor.downloader.Request as ExtractorRequest
import org.schabi.newpipe.extractor.downloader.Response
import org.schabi.newpipe.extractor.exceptions.ReCaptchaException
import org.schabi.newpipe.extractor.stream.StreamInfo
import org.schabi.newpipe.extractor.stream.StreamInfoItem
import org.schabi.newpipe.extractor.stream.AudioStream
import org.schabi.newpipe.extractor.stream.VideoStream
import java.io.IOException
import java.util.concurrent.TimeUnit

// Custom Downloader implementation using OkHttp
class OkHttpDownloader : Downloader() {
    private val client = OkHttpClient.Builder()
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    @Throws(IOException::class, ReCaptchaException::class)
    override fun execute(request: ExtractorRequest): Response {
        val requestBuilder = Request.Builder()
            .url(request.url())
            .method(request.httpMethod(), request.dataToSend()?.toRequestBody())

        // Add headers
        request.headers().forEach { (key, values) ->
            values.forEach { value ->
                requestBuilder.addHeader(key, value)
            }
        }

        val response = client.newCall(requestBuilder.build()).execute()
        val responseBody = response.body?.string() ?: ""

        return Response(
            response.code,
            response.message,
            response.headers.toMultimap(),
            responseBody,
            response.request.url.toString()
        )
    }
}

class NewPipeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "NewPipeModule"

    init {
        try {
            NewPipe.init(OkHttpDownloader())
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    // Helper function to safely put any value
    private fun WritableMap.putSafe(key: String, value: Any?) {
        when (value) {
            null -> putNull(key)
            is String -> putString(key, value)
            is Int -> putInt(key, value)
            is Long -> putDouble(key, value.toDouble())
            is Double -> putDouble(key, value)
            is Boolean -> putBoolean(key, value)
            is WritableMap -> putMap(key, value)
            is WritableArray -> putArray(key, value)
            else -> putString(key, value.toString())
        }
    }

    // Convert AudioStream to WritableMap
    private fun audioStreamToMap(stream: AudioStream): WritableMap {
        return Arguments.createMap().apply {
            putSafe("url", stream.content)
            putSafe("bitrate", stream.averageBitrate)
            putSafe("format", stream.format?.name)
            putSafe("formatId", stream.formatId)
            putSafe("codec", stream.codec)
            putSafe("quality", stream.quality)
        }
    }

    // Convert VideoStream to WritableMap
    private fun videoStreamToMap(stream: VideoStream): WritableMap {
        return Arguments.createMap().apply {
            putSafe("url", stream.content)
            putSafe("resolution", stream.resolution)
            putSafe("format", stream.format?.name)
            putSafe("formatId", stream.formatId)
            putSafe("codec", stream.codec)
            putSafe("quality", stream.quality)
        }
    }

    @ReactMethod
    fun extractStream(url: String, promise: Promise) {
        GlobalScope.launch(Dispatchers.IO) {
            try {
                val streamInfo = StreamInfo.getInfo(ServiceList.YouTube, url)
                
                // Get best audio stream
                val audioStream = streamInfo.audioStreams.maxByOrNull { it.averageBitrate }
                
                val result = Arguments.createMap().apply {
                    // Basic info
                    putSafe("title", streamInfo.name)
                    putSafe("uploadDate", streamInfo.uploadDate?.date()?.toString())
                    putSafe("uploader", streamInfo.uploaderName)
                    putSafe("uploaderUrl", streamInfo.uploaderUrl)
                    // putSafe("uploaderAvatarUrl", streamInfo.uploaderAvatarUrl)
                    putSafe("duration", streamInfo.duration)
                    putSafe("viewCount", streamInfo.viewCount)
                    putSafe("likeCount", streamInfo.likeCount)
                    putSafe("dislikeCount", streamInfo.dislikeCount)
                    putSafe("subscriberCount", streamInfo.uploaderSubscriberCount)
                    putSafe("category", streamInfo.category)
                    putSafe("ageLimit", streamInfo.ageLimit)
                    
                    // Description
                    streamInfo.description?.let { desc ->
                        putSafe("description", desc.content)
                    }
                    
                    // Thumbnails
                    val thumbnailsArray = Arguments.createArray()
                    streamInfo.thumbnails.forEach { thumb ->
                        val thumbMap = Arguments.createMap().apply {
                            putSafe("url", thumb.url)
                            putSafe("height", thumb.height)
                            putSafe("width", thumb.width)
                        }
                        thumbnailsArray.pushMap(thumbMap)
                    }
                    putArray("thumbnails", thumbnailsArray)
                    
                    // Best thumbnail URL (fallback)
                    putSafe("thumbnailUrl", streamInfo.thumbnails.firstOrNull()?.url)
                    
                    // Best audio stream
                    if (audioStream != null) {
                        putMap("audioStream", audioStreamToMap(audioStream))
                    }
                    
                    // All audio streams
                    val audioStreamsArray = Arguments.createArray()
                    streamInfo.audioStreams.forEach { stream ->
                        audioStreamsArray.pushMap(audioStreamToMap(stream))
                    }
                    putArray("audioStreams", audioStreamsArray)
                    
                    // All video streams
                    val videoStreamsArray = Arguments.createArray()
                    streamInfo.videoStreams.forEach { stream ->
                        videoStreamsArray.pushMap(videoStreamToMap(stream))
                    }
                    putArray("videoStreams", videoStreamsArray)
                    
                    // Video-only streams (higher quality, no audio)
                    val videoOnlyStreamsArray = Arguments.createArray()
                    streamInfo.videoOnlyStreams.forEach { stream ->
                        videoOnlyStreamsArray.pushMap(videoStreamToMap(stream))
                    }
                    putArray("videoOnlyStreams", videoOnlyStreamsArray)
                    
                    // Tags
                    val tagsArray = Arguments.createArray()
                    streamInfo.tags.forEach { tag ->
                        tagsArray.pushString(tag)
                    }
                    putArray("tags", tagsArray)
                    
                    // Related streams
                    val relatedArray = Arguments.createArray()
                    streamInfo.relatedItems.forEach { related ->
                        val relatedMap = Arguments.createMap().apply {
                            putSafe("name", related.name)
                            putSafe("url", related.url)
                            // putSafe("uploaderName", (related as StreamInfoItem).uploaderName)
                        }
                        relatedArray.pushMap(relatedMap)
                    }
                    putArray("relatedStreams", relatedArray)
                }
                
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("EXTRACTION_ERROR", e.message, e)
            }
        }
    }
}