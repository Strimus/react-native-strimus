import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import Video from 'react-native-video';
import type { StrimusStreamInterface } from '../../types/strimus';

type Props = {
  style: ViewStyle;
  stream: StrimusStreamInterface;
};

const CommonAudiencePlayer = ({ style, stream }: Props, ref: any) => {
  const videoRef = useRef<any>();

  const play = useCallback(() => {
    videoRef?.current?.resume();
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
    <Video
      ref={videoRef}
      style={style}
      source={{
        uri: stream.url,
      }}
    />
  );
};
export default forwardRef(CommonAudiencePlayer);
