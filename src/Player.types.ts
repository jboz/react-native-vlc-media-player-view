import { SharedObject } from 'expo-modules-core/build/ts-declarations/SharedObject';
import { StyleProp, ViewStyle } from 'react-native';

export type PlayerConfiguration = {
  initOptions?: string[];
};

export type VideoPlayerEvents = {
  paused(paused: boolean): void;
  ended(): void;
};

export declare class VideoPlayer extends SharedObject<VideoPlayerEvents> {
  source: VideoSource;
  paused: boolean;
  /**
   * The current time of the player in milliseconds.
   */
  time: number;
  /**
   * The current position of the player between 0 and 1.
   */
  position: number;
  readonly isPlaying: boolean;
  readonly isSeekable: boolean;
  readonly audioTracks: Track[];
  readonly textTracks: Track[];
  /**
   * The selected audio track id.
   */
  selectedAudioTrackId: string | null;
  /**
   * The selected text track id.
   */
  selectedTextTrackId: string | null;
  /**
   * The delay between the video and the audio in milliseconds.
   */
  audioDelay: number;
  /**
   * The delay between the video and the text in milliseconds.
   */
  textDelay: number;

  readonly videoInfo: VideoInfo | null;
  readonly progressInfo: ProgressInfo;
  title: string | null;

  chapters: Chapter[];

  constructor(config?: PlayerConfiguration);

  play(source?: VideoSource): void;
  pause(): void;
  togglePlay(): void;
  stop(): void;
  /**
   * This will stop the player and release all resources.
   * It is recommended to call this method when the player is not needed anymore.
   * This method will be called automatically when the component is unmounted.
   */
  release(): void;
  unselectAudioTrack(): void;
  unselectTextTrack(): void;
  /**
   * @param delta: in milliseconds
   */
  setTimeDelta(delta: number);
  /**
   * @param delta: in milliseconds
   */
  setPositionDelta(value: { delta: number; fastSeeking?: boolean });
}
export type OnLoadedEvent = { nativeEvent: VideoInfo };
export type OnProgessEvent = { nativeEvent: ProgressInfo };
export type OnPausedEvent = { nativeEvent: { payload: boolean } };

export type PlayerViewProps = {
  style?: StyleProp<ViewStyle> | undefined;
  player: VideoPlayer;
  /**
   * The player have to play the video before being able to received this event.
   */
  onLoaded?: (event: OnLoadedEvent) => void;
  onLoading?: () => void;
  onProgress?: (event: OnProgessEvent) => void;
  onPaused?: (paused: OnPausedEvent) => void;
  onEnded?: () => void;
  onError?: () => void;
  onFullscreen?: (fullscreen: boolean) => void;
};

export interface VideoInfo {
  track?: Track;
  videoSize: {
    width: number;
    height: number;
  };
  seekable: boolean;
  duration: number;
  audioTracks: Track[];
  textTracks: Track[];
}

export interface ProgressInfo {
  time: number;
  position: number;
}

export type VideoSource = {
  uri?: string;
  assetId?: number;
  /**
   * The time in milliseconds at which playback should start.
   */
  time?: number;
};

export type Track = {
  id: string;
  name: string;
};

export type Chapter = {
  timeOffset: number;
  duration: number;
  name: string;
};
