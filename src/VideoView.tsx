import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { LayoutRectangle, StyleSheet, useWindowDimensions, View } from 'react-native';
import FullScreenChz from 'react-native-fullscreen-chz';
import { getPlayerId, RNPlayerView } from './Player';
import { OnLoadedEvent, OnPausedEvent, OnProgessEvent, ProgressInfo, VideoInfo } from './Player.types';
import { VideoViewProps } from './VideoView.types';
import { Controls, ControlsRef } from './internal/Controls';

export type VideoPlayerEventsObserver = {
  addEventListener: (listener: VideoPlayerListener) => void;
  removeEventListener: (listener: VideoPlayerListener) => void;
};

export type VideoPlayerListener = {
  onLoading?: () => void;
  onLoaded?: (event: VideoInfo) => void;
  onPaused?: (event: boolean) => void;
  onProgress?: (event: ProgressInfo) => void;
};

export type VideoViewRef = {
  showControlBar: (value: boolean) => void;
  isControlBarVisible: boolean;
  setFullscreen: (value: boolean) => void;
  lockOrientationLandscape: () => void;
  unlockOrientation: () => void;
};

interface ElementDimensions {
  width: number;
  height: number;
}

export const VideoView = forwardRef<VideoViewRef | undefined, VideoViewProps>(
  (
    {
      style,
      onLoading,
      onLoaded,
      onPaused,
      onProgress,
      onFullscreen,
      player,
      onBack,
      onPrevious,
      onNext,
      forwardSeconds = 10,
      backwardSeconds = 10,
      alwaysFullscreen = false,
      leftButtons,
      rightButtons,
      playButtonDecorator,
      ...rest
    }: VideoViewProps,
    ref
  ) => {
    const nativeRef = useRef<any>();
    const playerId = getPlayerId(player);

    const controlRef = useRef<ControlsRef>();

    const [videoInfo, setVideoInfo] = useState<VideoInfo>();
    const [progressInfo, setProgressInfo] = useState<ProgressInfo>();

    const [fullscreen, setFullscreen] = useState(alwaysFullscreen);

    const [viewLayout, setViewLayout] = useState<LayoutRectangle>();
    const windowsDimensions = useWindowDimensions();
    let parentDimensions = viewLayout as ElementDimensions;
    const videoSize = calculateVideoDimensions(parentDimensions, videoInfo?.videoSize);

    const [listeners] = useState<VideoPlayerListener[]>([]);

    const playerObserver: VideoPlayerEventsObserver = {
      addEventListener: listener => {
        const isExist = listeners.includes(listener);
        if (!isExist) {
          listeners.push(listener);
          videoInfo && listeners.forEach(listener => listener.onLoaded?.(videoInfo));
          progressInfo && listeners.forEach(listener => listener.onProgress?.(progressInfo));
        }
      },
      removeEventListener: listener => {
        const observerIndex = listeners.indexOf(listener);
        if (observerIndex !== -1) {
          listeners.splice(observerIndex, 1);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      showControlBar: (value: boolean) => controlRef.current?.showControlBar(value),
      isControlBarVisible: controlRef.current?.isControlBarVisible || false,
      setFullscreen: (value: boolean) => setFullscreen(value),
      lockOrientationLandscape: () => nativeRef.current?.lockOrientationLandscape(),
      unlockOrientation: () => nativeRef.current?.unlockOrientation()
    }));

    useEffect(() => {
      if (fullscreen) {
        FullScreenChz.enable();
        parentDimensions = windowsDimensions as ElementDimensions;

        if (alwaysFullscreen) {
          nativeRef.current?.lockOrientationLandscape();
        }
      } else {
        FullScreenChz.disable();
        parentDimensions = viewLayout as ElementDimensions;

        if (alwaysFullscreen) {
          nativeRef.current?.unlockOrientation();
        }
      }
      onFullscreen?.(fullscreen);

      return () => {
        FullScreenChz.disable();
      };
    }, [fullscreen]);

    return (
      <View
        style={[styles.container, style, fullscreen ? { ...styles.fullscreen } : {}]}
        onLayout={e => setViewLayout(e.nativeEvent.layout)}
      >
        <RNPlayerView
          ref={nativeRef}
          player={playerId}
          style={videoSize}
          onLoading={() => {
            listeners.forEach(listener => listener.onLoading?.());
            onLoading?.();
          }}
          onLoaded={(e: OnLoadedEvent) => {
            setVideoInfo(e.nativeEvent);
            listeners.forEach(listener => listener.onLoaded?.(e.nativeEvent));
            onLoaded?.(e);
          }}
          onPaused={(e: OnPausedEvent) => {
            listeners.forEach(listener => listener.onPaused?.(e.nativeEvent.payload));
            onPaused?.(e);
          }}
          onProgress={(e: OnProgessEvent) => {
            setProgressInfo(e.nativeEvent);
            listeners.forEach(listener => listener.onProgress?.(e.nativeEvent));
            onProgress?.(e);
          }}
          {...rest}
        />
        <Controls
          ref={controlRef}
          player={player}
          playerObserver={playerObserver}
          onBack={onBack}
          onPrevious={onPrevious}
          onNext={onNext}
          backwardSeconds={backwardSeconds}
          forwardSeconds={forwardSeconds}
          alwaysFullscreen={alwaysFullscreen}
          fullscreen={fullscreen}
          onFullscreen={() => setFullscreen(!fullscreen)}
          leftButtons={leftButtons}
          rightButtons={rightButtons}
          playButtonDecorator={playButtonDecorator}
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fullscreen: {
    position: 'absolute',
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    padding: 0,
    margin: 0
  }
});

const calculateVideoDimensions = (parentLayout?: ElementDimensions, videoDimensions?: ElementDimensions | undefined): ElementDimensions => {
  'worklet';
  const aspectDimensions = videoDimensions?.height && videoDimensions?.width ? videoDimensions : { width: 16, height: 9 };
  const parentDimensions = parentLayout || { width: 16, height: 9 };

  const width = parentDimensions.height * (aspectDimensions.width / aspectDimensions.height);
  const height = parentDimensions.width * (aspectDimensions.height / aspectDimensions.width);

  const dimensions =
    height > parentDimensions.height
      ? {
          width,
          height: parentDimensions.height
        }
      : {
          width: parentDimensions.width,
          height
        };

  return dimensions;
};
