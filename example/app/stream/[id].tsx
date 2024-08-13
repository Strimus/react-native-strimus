import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  StrimusPlayer,
  type StrimusStreamInterface,
} from 'react-native-strimus';
import strimusClient from '../../utils/strimusClient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const StreamDetailScreen = () => {
  const params = useLocalSearchParams();
  const [stream, setStream] = useState<StrimusStreamInterface>();
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
    <View style={styles.root}>
      <StrimusPlayer
        type="audience"
        stream={stream}
        style={{
          width: Dimensions.get('screen').width,
          height: Dimensions.get('screen').height,
        }}
        onStreamReady={() => {}}
      />

      <TouchableOpacity
        style={[
          styles.back,
          {
            top: 24 + insets.top,
          },
        ]}
        onPress={() => router.back()}
      >
        <Text>Back</Text>
      </TouchableOpacity>
    </View>
  ) : null;
};

export default StreamDetailScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  back: {
    position: 'absolute',
    top: 24,
    left: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
});
