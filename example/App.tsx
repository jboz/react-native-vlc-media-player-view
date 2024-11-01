import { MaterialIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Chapter, useVideoPlayer, VideoPlayer, VideoSource, VideoView } from 'react-native-vlc-media-player-view';
import { VideoViewRef } from 'react-native-vlc-media-player-view/VideoView';

export default function App() {
  const [source, setSource] = useState<VideoSource>();

  const uri = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        gap: 20,
        paddingTop: 10,
        backgroundColor: '#121212'
      }}
    >
      <View style={{ flex: 0, width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 30 }}>
        <MaterialIcons.Button onPress={() => setSource({ uri, time: 6000 })} name="play-arrow" size={20}>
          play
        </MaterialIcons.Button>
        <MaterialIcons.Button onPress={() => setSource(undefined)} name="close" size={20}>
          close
        </MaterialIcons.Button>
      </View>
      {source && <Player source={source} onBack={() => setSource(undefined)} />}
    </GestureHandlerRootView>
  );
}

type PlayerProps = {
  onBack: (player: VideoPlayer) => void;
  source: VideoSource;
};

const Player = ({ onBack, source }: PlayerProps) => {
  const videoViewRef = useRef<VideoViewRef>();

  const player = useVideoPlayer({ initOptions: ['--http-reconnect', '--codec=all', '--avcodec-hw=any'] }, player => {
    player.title = 'Size is adapted to parent layout';
  });

  player.play(source);

  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [intro, setIntro] = useState<Chapter>();

  return (
    <>
      <VideoView
        ref={videoViewRef}
        player={player}
        style={{ flex: 1, width: '100%', backgroundColor: '#121212' }}
        onLoaded={() => {
          // source.time && (player.time = source.time);
          setIntro(player.chapters.find(c => c.name.match(/(opening)/i)));

          videoViewRef.current?.setFullscreen(true);

          // player.time = 4 * 60 * 1000 + 49 * 1000;
          // player.selectedAudioTrackId = player.audioTracks[player.audioTracks.length - 1].id;
          // player.selectedTextTrackId = player.textTracks[player.textTracks.length - 1].id;
        }}
        alwaysFullscreen={false}
        onNext={() => console.log('next')}
        onPrevious={() => console.log('previous')}
        onBack={() => onBack(player)}
        onProgress={e => {
          const time = e.nativeEvent.time;
          const isInIntro = !!intro && time >= intro.timeOffset && time < intro.timeOffset + intro.duration - 1;
          setShowSkipIntro(isInIntro);
        }}
      />
      {intro && showSkipIntro && (
        <View style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000 }}>
          <MaterialIcons.Button
            name="skip-next"
            size={20}
            onPress={() => {
              videoViewRef.current?.showControlBar(true);
              player.time = intro.timeOffset + intro.duration;
            }}
          >
            Skip Intro
          </MaterialIcons.Button>
        </View>
      )}
    </>
  );
};
