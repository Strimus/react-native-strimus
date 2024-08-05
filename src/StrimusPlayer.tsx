import { forwardRef } from 'react';
import CommonAudiencePlayer from './providers/Common/CommonAudiencePlayer';
import CommonBroadcasterPlayer from './providers/Common/CommonBroadcasterPlayer';
import type {
  StrimusBroadcastInterface,
  StrimusStreamInterface,
  StrimusStreamType,
  StrimusVideoProps,
} from './types/strimus';
import AgoraAudiencePlayer from './providers/Agora/AgoraAudiencePlayer';
import AgoraBroadcasterPlayer from './providers/Agora/AgoraBroadcasterPlayer';
import { Dimensions } from 'react-native';

type PlayerAudienceProps = {
  type: StrimusStreamType;
  stream: StrimusStreamInterface;
};

type PlayerBroadcasterProps = {
  type: StrimusStreamType;
  broadcast: StrimusBroadcastInterface;
};

type Props = StrimusVideoProps & (PlayerAudienceProps | PlayerBroadcasterProps);

const StrimusPlayer = (props: Props, ref: any) => {
  const {
    style = {
      width: Dimensions.get('screen').width,
      height: Dimensions.get('screen').height,
    },
  } = props;

  if (props.type === 'audience') {
    const { stream, ...rest } = props as PlayerAudienceProps;

    if (!stream) return null;

    switch (stream.source) {
      case 'agora':
        return (
          <AgoraAudiencePlayer
            stream={stream as StrimusStreamInterface}
            style={style}
            ref={ref}
            {...rest}
          />
        );

      case 'aws':
      default:
        return (
          <CommonAudiencePlayer
            stream={stream as StrimusStreamInterface}
            style={style}
            ref={ref}
            {...rest}
          />
        );
    }
  } else {
    const { broadcast, ...rest } = props as PlayerBroadcasterProps;

    switch (broadcast.source) {
      case 'agora':
        return (
          <AgoraBroadcasterPlayer
            broadcast={broadcast as StrimusBroadcastInterface}
            style={style}
            ref={ref}
            {...rest}
          />
        );

      default:
      case 'aws':
        return (
          <CommonBroadcasterPlayer
            broadcast={broadcast as StrimusBroadcastInterface}
            style={style}
            ref={ref}
            {...rest}
          />
        );
    }
  }
};

export default forwardRef(StrimusPlayer);
