import { MaterialIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { ReactNode, useEffect, useState } from 'react';
import { LayoutRectangle, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ProgressInfo, VideoInfo, VideoPlayer } from '../Player.types';
import { VideoPlayerEventsObserver, VideoPlayerListener } from '../VideoView';
import { Focussable } from './components/Focussable';

type ControlsBarProps = {
  player: VideoPlayer;
  playerObserver: VideoPlayerEventsObserver;
  onBack?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onBackward?: () => void;
  onForward?: () => void;
  centerLeftButton?: ReactNode;
  leftButton?: ReactNode;
  leftButtons?: ReactNode;
  rightButton?: ReactNode;
  rightButtons?: ReactNode;
  backwardSeconds: number;
  forwardSeconds: number;
  playButtonDecorator?: (playButton: ReactNode) => ReactNode;
};

const buttonSize = 40;

export const ControlsBar = ({
  player,
  playerObserver,
  onBack,
  onPrevious,
  onNext,
  onBackward,
  onForward,
  leftButton,
  leftButtons,
  rightButton,
  rightButtons,
  centerLeftButton,
  backwardSeconds,
  forwardSeconds,
  playButtonDecorator
}: ControlsBarProps) => {
  const title = player.title;

  const [paused, setPaused] = useState(player.paused);
  const [progress, setProgress] = useState<ProgressInfo>();
  const [videoInfo, setVideoInfo] = useState<VideoInfo>();
  const [layout, setLayout] = useState<LayoutRectangle>();

  useEffect(() => {
    const listener: VideoPlayerListener = {
      onPaused: setPaused,
      onProgress: setProgress,
      onLoaded: setVideoInfo
    };
    playerObserver.addEventListener(listener);

    return () => {
      playerObserver.removeEventListener(listener);
    };
  }, []);

  const backwardIcon = (): any => {
    switch (backwardSeconds) {
      case 5:
        return 'replay-5';
      case 10:
        return 'replay-10';
      case 30:
        return 'replay-30';
      default:
        return 'fast-rewind';
    }
  };

  const forwardIcon = (): any => {
    switch (forwardSeconds) {
      case 5:
        return 'forward-5';
      case 10:
        return 'forward-10';
      case 30:
        return 'forward-30';
      default:
        return 'fast-forward';
    }
  };

  return (
    <View style={styles.container} onLayout={e => setLayout(e.nativeEvent.layout)}>
      <LinearGradient colors={['rgba(18, 18, 18, 0.8)', 'transparent']} style={styles.top}>
        {onBack && (
          <Focussable onPress={onBack}>
            <MaterialIcons name="arrow-back" size={40} color="white" />
          </Focussable>
        )}
        {title && (
          <Text
            style={{
              flex: 1,
              maxHeight: 110,
              fontSize: 32,
              fontWeight: '100',
              color: 'white'
            }}
          >
            {title}
          </Text>
        )}
      </LinearGradient>
      <View style={styles.center}>
        <View style={{ height: '100%', paddingTop: 20 }}>{centerLeftButton}</View>
      </View>
      <LinearGradient colors={['transparent', 'rgba(18, 18, 18, 0.9)']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 0.9 }}>
        {(videoInfo?.seekable && (
          <View style={styles.progressionBar}>
            <Text style={{ width: 70, textAlign: 'right', color: 'white' }}>{toTime(progress?.time)}</Text>
            <Slider
              style={{ flexShrink: 1, flexGrow: 1 }}
              thumbTintColor="#ff8c00"
              minimumTrackTintColor="#ff8c00"
              maximumTrackTintColor="lightgray"
              value={progress?.time || 0}
              onSlidingComplete={time => (player.time = time)}
              minimumValue={0}
              maximumValue={videoInfo.duration || 0}
            />
            <Text style={{ width: 70, textAlign: 'left', color: 'white' }}>{toTime(videoInfo.duration || 0)}</Text>
          </View>
        )) || <Text>{''}</Text>}
        <View style={[styles.bottom, layout?.width && layout.width < 400 ? { paddingHorizontal: 5 } : {}]}>
          <View style={styles.part}>{leftButton}</View>
          <View style={styles.part}>{leftButtons}</View>
          <View style={[styles.progressControls, layout?.width && layout.width < 400 ? { gap: 0 } : {}]}>
            <View style={styles.part}>
              {onPrevious && (
                <Focussable onPress={onPrevious}>
                  <MaterialIcons name="first-page" size={buttonSize} color="white" />
                </Focussable>
              )}
            </View>
            <View style={styles.part}>
              <Focussable onPress={onBackward}>
                <MaterialIcons name={backwardIcon()} size={buttonSize} color="white" />
              </Focussable>
            </View>
            <View style={[styles.part, { width: buttonSize * 1.4 }]}>
              {(playButtonDecorator &&
                playButtonDecorator(
                  <Focussable onPress={() => player.togglePlay()}>
                    <MaterialIcons name={paused ? 'play-circle-outline' : 'pause-circle-outline'} size={buttonSize * 1.4} color="white" />
                  </Focussable>
                )) || (
                <Focussable onPress={() => player.togglePlay()}>
                  <MaterialIcons name={paused ? 'play-circle-outline' : 'pause-circle-outline'} size={buttonSize * 1.4} color="white" />
                </Focussable>
              )}
            </View>
            <View style={styles.part}>
              <Focussable onPress={onForward}>
                <MaterialIcons name={forwardIcon()} size={buttonSize} color="white" />
              </Focussable>
            </View>
            <View style={styles.part}>
              {onNext && (
                <Focussable onPress={onNext}>
                  <MaterialIcons name="last-page" size={buttonSize} color="white" />
                </Focussable>
              )}
            </View>
          </View>
          <View style={styles.part}>{rightButtons}</View>
          <View style={styles.part}>{rightButton}</View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center'
  },
  top: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 20,
    paddingTop: 10
  },
  center: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  },
  progressionBar: {
    zIndex: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    height: 40
  },
  bottom: {
    paddingHorizontal: 15,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20
  },
  progressControls: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20
  },
  part: {
    width: buttonSize,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

const toTime = (timeInMillis: number | undefined) => {
  if (timeInMillis !== undefined) {
    const timeInSeconds = Math.floor(timeInMillis / 1000);
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds - hours * 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${leftPad(hours, 2)}:${leftPad(minutes, 2)}:${leftPad(seconds, 2)}`;
  }
  return '';
};

const leftPad = (value?: number, pad = 2) => (value?.toFixed() || '').padStart(pad, '0');
