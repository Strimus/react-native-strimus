import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import {
  StrimusPlayer,
  type StrimusStreamInterface,
} from 'react-native-strimus';
import strimusClient from '../../utils/strimusClient';

const StreamDetailScreen = () => {
  const params = useLocalSearchParams();
  const [stream, setStream] = useState<StrimusStreamInterface>();

  useEffect(() => {
    strimusClient.getStream(String(params.id)).then((data) => {
      setStream(data);
    });

    return () => {};
  }, [params.id]);

  return stream ? (
    <StrimusPlayer
      type="audience"
      stream={stream}
      style={{
        width: Dimensions.get('screen').width,
        height: Dimensions.get('screen').height,
      }}
    />
  ) : null;
};
export default StreamDetailScreen;
