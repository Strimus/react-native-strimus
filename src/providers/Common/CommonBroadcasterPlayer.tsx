import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { AppState, Dimensions, Platform, type ViewStyle } from 'react-native';
import type {
  StrimusBroadcastInterface,
  StrimusStreamCameraConfig,
} from '../../types/strimus';
import { forwardRef } from 'react';
import { requestPermissions } from '../../utils/permissions';
import {
  IVSBroadcastCameraView,
  type IBroadcastSessionError,
  type IIVSBroadcastCameraView,
  type StateStatusUnion,
} from 'amazon-ivs-react-native-broadcast';

type Props = {
  style: ViewStyle;
  broadcast: StrimusBroadcastInterface;
  camera?: StrimusStreamCameraConfig;
  onStreamReady?: () => void;
};

enum SessionReadyStatus {
  None = 'NONE',
  Ready = 'READY',
  NotReady = 'NOT_READY',
}

const { None, NotReady, Ready } = SessionReadyStatus;

const INITIAL_BROADCAST_STATE_STATUS = 'INVALID' as const;

const INITIAL_STATE = {
  readyStatus: None,
  stateStatus: INITIAL_BROADCAST_STATE_STATUS,
};

const VIDEO_CONFIG = {
  bitrate: 7500000,
  targetFrameRate: 60,
  keyframeInterval: 2,
  isBFrames: true,
  isAutoBitrate: true,
  maxBitrate: 8500000,
  minBitrate: 1500000,
} as const;

const AUDIO_CONFIG = {
  bitrate: 128000,
} as const;

const CommonBroadcasterPlayer = (
  {
    style,
    broadcast,
    camera = {
      muted: false,
      mirror: false,
      cameraPosition: 'front',
      aspectMode: 'fill',
    },
    onStreamReady,
  }: Props,
  ref: any
) => {
  const cameraRef = React.useRef<IIVSBroadcastCameraView>(null);
  const { width, height } = Dimensions.get('screen');

  const [{ readyStatus }, setState] = useState<{
    readonly readyStatus: SessionReadyStatus;
  }>(INITIAL_STATE);

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Request required permissions from Android
      requestPermissions().then(() => {
        console.log('requested!');
      });
    }
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        cameraRef.current?.stop();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const onIsBroadcastReadyHandler = useCallback(
    (isReady: boolean) => {
      setState((currentState) => ({
        ...currentState,
        readyStatus: isReady ? Ready : NotReady,
      }));

      if (isReady && onStreamReady) {
        onStreamReady();
      }
    },
    [onStreamReady]
  );

  const onBroadcastStateChangedHandler = useCallback(
    (status: StateStatusUnion) =>
      setState((currentState) => ({
        ...currentState,
        stateStatus: status,
      })),
    []
  );

  const onBroadcastErrorHandler = useCallback(
    (exception: IBroadcastSessionError) =>
      console.log('Broadcast session error: ', exception),
    []
  );

  const onErrorHandler = useCallback(
    (errorMessage: string) =>
      console.log('Internal module error: ', errorMessage),
    []
  );

  const onMediaServicesWereLostHandler = useCallback(
    () => console.log('The media server is terminated.'),
    []
  );

  const onMediaServicesWereResetHandler = useCallback(
    () => console.log('The media server is restarted.'),
    []
  );

  const onAudioSessionInterruptedHandler = useCallback(() => {
    console.log('The audio session is interrupted.');
  }, []);

  const onAudioSessionResumedHandler = useCallback(() => {
    console.log('The audio session is resumed.');
  }, []);

  const handlePlay = useCallback(
    () =>
      new Promise((resolve, reject) => {
        if (readyStatus !== Ready) {
          reject('Broadcast is not ready');
          return;
        }

        resolve(cameraRef.current?.start());
      }),
    [cameraRef, readyStatus]
  );

  const handleEnd = useCallback(
    () =>
      new Promise((resolve) => {
        resolve(cameraRef.current?.stop());
      }),
    []
  );

  useImperativeHandle(
    ref,
    () => ({
      play: handlePlay,
      end: handleEnd,
    }),
    [handlePlay, handleEnd]
  );

  return (
    <IVSBroadcastCameraView
      ref={cameraRef}
      style={style}
      rtmpsUrl={broadcast.streamUrl}
      streamKey={broadcast.streamKey}
      videoConfig={{
        ...VIDEO_CONFIG,
        width: Math.min(width, 720),
        height: Math.min(height, 720),
      }}
      audioConfig={AUDIO_CONFIG}
      isMuted={camera.muted}
      cameraPosition={camera.cameraPosition}
      isCameraPreviewMirrored={camera.mirror}
      cameraPreviewAspectMode={camera.aspectMode}
      onError={onErrorHandler}
      onBroadcastError={onBroadcastErrorHandler}
      onIsBroadcastReady={onIsBroadcastReadyHandler}
      onBroadcastStateChanged={onBroadcastStateChangedHandler}
      onMediaServicesWereLost={onMediaServicesWereLostHandler}
      onMediaServicesWereReset={onMediaServicesWereResetHandler}
      onAudioSessionInterrupted={onAudioSessionInterruptedHandler}
      onAudioSessionResumed={onAudioSessionResumedHandler}
      {...(__DEV__ && {
        logLevel: 'debug',
        sessionLogLevel: 'debug',
      })}
    />
  );
};
export default forwardRef(CommonBroadcasterPlayer);
