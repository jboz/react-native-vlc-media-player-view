package ch.ifocusit.andoid.player

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.net.Uri
import ch.ifocusit.andoid.player.VideoPlayerModule.VideoSource
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import org.videolan.libvlc.LibVLC
import org.videolan.libvlc.Media
import org.videolan.libvlc.MediaPlayer
import org.videolan.libvlc.util.VLCVideoLayout

@SuppressLint("ViewConstructor")
class PlayerView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {

    private val libVLC: LibVLC = LibVLC(context)

    private val videoLayout = VLCVideoLayout(context).also {
        it.setBackgroundColor(Color.BLACK)
    }

    internal val player: MediaPlayer = MediaPlayer(libVLC).also {
        it.attachViews(videoLayout, null, true, true)
        it.videoScale = MediaPlayer.ScaleType.SURFACE_FIT_SCREEN
        addView(videoLayout)
    }

    var source: VideoSource? = null
        set(value) {
            if (field == value) {
                return
            }
            if (field != null) {
                player.stop()
            }
            field = value
            if (field != null) {
                val media = media(field!!.uri)
                player.media = media
                media.release()
            }
            player.play()
            if (value?.time != null) {
                player.time = value.time
            }
        }

    private fun media(uri: String): Media {
        if (uri.startsWith("http")) {
            return Media(libVLC, Uri.parse(uri))
        }
        return Media(libVLC, uri)
    }
}