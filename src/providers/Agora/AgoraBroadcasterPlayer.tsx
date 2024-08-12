import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Platform, type ViewStyle } from 'react-native';
import {
  ChannelProfileType,
  ClientRoleType,
  createAgoraRtcEngine,
  IRtcEngine,
  RtcSurfaceView,
  VideoMirrorModeType,
} from 'react-native-agora';
import type {
  StrimusBroadcastInterface,
  StrimusStreamCameraConfig,
} from '../../types/strimus';
import { requestPermissions } from '../../utils/permissions';

type Props = {
  style: ViewStyle;
  broadcast: StrimusBroadcastInterface;
  camera?: StrimusStreamCameraConfig;
};

const AgoraPlayer = ({ style, broadcast, camera }: Props, ref: any) => {
  const _engine = useRef<IRtcEngine | null>(null);
  const [isJoined, setJoined] = useState<boolean>(false);
  const [isInited, setInited] = useState<boolean>(false);
  // const [peerIds, setPeerIds] = useState<number[]>([]);

  const config = useMemo(
    () => ({
      appId: broadcast.appId,
      token: broadcast.token,
      channelName: broadcast.channelName,
    }),
    [broadcast]
  );

  useEffect(() => {
    if (Platform.OS === 'android') {
      // Request required permissions from Android
      requestPermissions().then(() => {
        console.log('requested!');
      });
    }
  }, []);

  /**
   * @name init
   * @description Create, Initialize and setup engine
   */
  const init = useCallback(() => {
    const { appId } = config;
    _engine.current = createAgoraRtcEngine();
    _engine.current.initialize({ appId });
    _engine.current.setChannelProfile(
      ChannelProfileType.ChannelProfileLiveBroadcasting
    );
    _engine.current.setClientRole(ClientRoleType.ClientRoleBroadcaster);

    _engine.current.enableVideo();
    _engine.current.startPreview();
    _engine.current.setVideoEncoderConfiguration({
      // Set the frame rate
      frameRate: 30,
      // Set the bitrate mode to StandardBitrate
      bitrate: 0,
      // Set the minimum encoding bitrate to 1 Kbps
      // Disable mirroring mode when sending encoded video
      mirrorMode: camera?.mirror
        ? VideoMirrorModeType.VideoMirrorModeEnabled
        : VideoMirrorModeType.VideoMirrorModeDisabled,
    });

    // _engine.current.addListener('onUserJoined', (connection, uid) => {
    //   console.log('UserJoined', connection, uid);
    //   // If new user
    //   if (peerIds.indexOf(uid) === -1) {
    //     // Add peer ID to state array
    //     setPeerIds(prev => [...prev, uid]);
    //   }
    // });

    // _engine.current.addListener('onUserOffline', (connection, uid) => {
    //   console.log('UserOffline', connection, uid);
    //   // Remove peer ID from state array
    //   setPeerIds(prev => prev.filter(id => id !== uid));
    // });

    setInited(true);

    // If Local user joins RTC channel
    _engine.current.addListener('onJoinChannelSuccess', (connection) => {
      console.log('JoinChannelSuccess', connection);
      // Set state variable to true
      setJoined(true);
    });
  }, [_engine, config, camera]);

  /**
   * @name startCall
   * @description Function to start the call
   */
  const startCall = useCallback(() => {
    // Join Channel using null token and channel name
    _engine.current?.joinChannel(config.token, config.channelName, 0, {});
  }, [_engine, config]);

  /**
   * @name endCall
   * @description Function to end the call
   */
  const endCall = useCallback(() => {
    _engine.current?.leaveChannel();
    _engine.current?.removeAllListeners();

    try {
      _engine.current?.release();
    } catch (e) {
      console.log('release error:', e);
    }

    // setPeerIds([]);
    setJoined(false);
  }, [_engine]);

  useEffect(() => {
    if (!isInited) {
      init();
    }
  }, [init, isInited]);

  useImperativeHandle(
    ref,
    () => ({
      play: startCall,
      end: endCall,
    }),
    [startCall, endCall]
  );

  return isJoined ? (
    <RtcSurfaceView
      style={style}
      canvas={{
        uid: broadcast.uid,
      }}
    />
  ) : null;
};

export default forwardRef(AgoraPlayer);
