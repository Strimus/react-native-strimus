import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import type { StrimusStreamInterface } from '../../types/strimus';
import IVSPlayer from 'amazon-ivs-react-native-player';

type Props = {
  style: ViewStyle;
  stream: StrimusStreamInterface;
};

const CommonAudiencePlayer = ({ style, stream }: Props, ref: any) => {
  const videoRef = useRef<any>();

  const play = useCallback(() => {
    videoRef?.current?.play();
  }, [videoRef]);

  const end = useCallback(() => {
    videoRef?.current?.pause();
  }, [videoRef]);

  useImperativeHandle(
    ref,
    () => ({
      play,
      end,
    }),
    [play, end]
  );

  return (
    <IVSPlayer
      style={style}
      ref={videoRef}
      streamUrl={stream.url}
      autoQualityMode={true}
      resizeMode="aspectFill"
      onError={(error) => console.log(error)}
      {...(__DEV__ && {
        sessionLogLevel: 'debug',
      })}
    />
  );
};
export default forwardRef(CommonAudiencePlayer);
