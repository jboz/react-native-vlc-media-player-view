import { ReactNode } from 'react';
import { PlayerViewProps } from './Player.types';

export type OnDelayChangedEvent = { nativeEvent: { payload: number } };

export type VideoViewProps = PlayerViewProps & {
  onBack?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  onAudioDelayChanged?: (event: OnDelayChangedEvent) => void;
  onTextDelayChanged?: (event: OnDelayChangedEvent) => void;
  backwardSeconds?: number;
  forwardSeconds?: number;
  alwaysFullscreen?: boolean;
  leftButtons?: ReactNode;
  rightButtons?: ReactNode;
  playButtonDecorator?: (playButton: ReactNode) => ReactNode;
};
