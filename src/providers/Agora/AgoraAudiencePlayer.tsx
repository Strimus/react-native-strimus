import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ViewStyle } from 'react-native';
import createAgoraRtcEngine, {
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  RtcSurfaceView,
} from 'react-native-agora';
import type { StrimusStreamInterface } from '../../types/strimus';

type Props = {
  style: ViewStyle;
  stream: StrimusStreamInterface;
};

const AgoraAudiencePlayer = ({ style, stream }: Props, ref: any) => {
  const _engine = useRef<IRtcEngine | null>(null);
  const [isJoined, setJoined] = useState(false);

  const config = useMemo(
    () => ({
      appId: 'c410cd4d808144dca9d83a24336a383a',
      token: '',
      channelName: stream.channelName,
    }),
    [stream]
  );

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
    _engine.current.setClientRole(ClientRoleType.ClientRoleAudience);

    // If Local user joins RTC channel
    _engine.current.addListener('onJoinChannelSuccess', (connection) => {
      console.log('JoinChannelSuccess', connection);
      // Set state variable to true
      setJoined(true);
    });
    // }
  }, [_engine, config]);

  /**
   * @name startCall
   * @description Function to start the call
   */
  const play = useCallback(() => {
    // Join Channel using null token and channel name
    init();
    _engine.current?.joinChannel(config.token, config.channelName, 0, {});
  }, [_engine, config, init]);

  /**
   * @name endCall
   * @description Function to end the call
   */
  const end = useCallback(() => {
    _engine.current?.leaveChannel();
    _engine.current?.removeAllListeners();

    try {
      _engine.current?.release();
    } catch (e) {
      console.log('release error:', e);
    }

    setJoined(false);
  }, [_engine]);

  useEffect(() => {
    if (!isJoined) {
      play();
    }
  }, [play, isJoined]);

  useImperativeHandle(
    ref,
    () => ({
      play,
      end,
    }),
    [play, end]
  );

  return isJoined ? (
    <RtcSurfaceView
      style={{ ...style }}
      canvas={{
        uid: 0,
      }}
    />
  ) : null;
};
export default forwardRef(AgoraAudiencePlayer);
