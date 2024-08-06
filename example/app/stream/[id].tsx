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

    const fnc = (message: string) => {
      console.log('Received message:', message);
    };

    strimusClient.socket.connect();
    strimusClient.socket.addMessageListener(fnc);
    strimusClient.socket.joinRoom(String(params.id));

    return () => {
      strimusClient.socket.removeMessageListener(fnc);
      strimusClient.socket.leaveRoom(String(params.id));
      strimusClient.socket.disconnect();
    };
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
