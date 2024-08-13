import { useCallback, useEffect, useRef, useState } from 'react';
import {
  StrimusPlayer,
  type StrimusBroadcastInterface,
  type StrimusConfigInterface,
  type StrimusStreamProvider,
} from 'react-native-strimus';
import strimusClient from '../utils/strimusClient';
import { STRIMUS_DEFAULT_PROVIDER } from '../../src/config/api';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PauseIcon from '../components/PauseIcon';
import PlayIcon from '../components/PlayIcon';

const BroadcastPage = () => {
  const [providers, setProviders] = useState<StrimusConfigInterface[]>([]);
  const insets = useSafeAreaInsets();
  const playerRef = useRef<any>();
  const [state, setState] = useState<{
    broadcast: StrimusBroadcastInterface | null;
    provider: string;
    showPreview: boolean;
    isStarted: boolean;
    isReady: boolean;
  }>({
    broadcast: null,
    provider: STRIMUS_DEFAULT_PROVIDER,
    showPreview: false,
    isStarted: false,
    isReady: false,
  });

  const handleCreateStream = useCallback(async () => {
    try {
      const response = await strimusClient.createStream(
        state.provider as StrimusStreamProvider,
        {
          uniqueId: strimusClient.uniqueId,
          name: 'Test Stream on RN',
          image: 'https://picsum.photos/500/500',
        }
      );

      setState((prev) => ({
        ...prev,
        broadcast: response,
      }));
    } catch (error) {
      throw error;
    }
  }, [state.provider]);

  const handleStart = useCallback(async () => {
    await strimusClient.startStream(state.broadcast?.id ?? 0);
    await playerRef?.current?.play();

    setState((prev) => ({
      ...prev,
      isStarted: true,
    }));
  }, [playerRef, state]);

  const handleEnd = useCallback(async () => {
    await strimusClient.stopStream(state.broadcast?.id ?? 0);
    await playerRef?.current?.end();

    setState((prev) => ({
      ...prev,
      showPreview: false,
      isReady: false,
      isStarted: false,
      broadcast: null,
    }));
  }, [playerRef, state]);

  useEffect(() => {
    strimusClient.getProviders().then((data) => {
      setProviders(data);

      const defaultProvider = (data ?? []).find(
        (item) => item.default === true
      );

      if (defaultProvider) {
        setState((prev) => ({
          ...prev,
          provider: defaultProvider.alias,
        }));
      }
    });
  }, []);

  return (
    <View style={styles.root}>
      {state.broadcast ? (
        <>
          <StrimusPlayer
            ref={playerRef}
            type="broadcaster"
            broadcast={state.broadcast}
            style={{
              width: Dimensions.get('screen').width,
              height: Dimensions.get('screen').height,
            }}
            onStreamReady={() => {
              setState((prev) => ({
                ...prev,
                isReady: true,
              }));
            }}
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

          {state.isReady && (
            <TouchableOpacity
              style={styles.playPauseButton}
              onPress={state.isStarted ? handleEnd : handleStart}
            >
              {state.isStarted ? <PauseIcon /> : <PlayIcon />}
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View
          style={[
            styles.inner,
            {
              paddingTop: 24 + insets.top,
            },
          ]}
        >
          <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
          <Stack.Screen options={{ title: 'Create Stream' }} />

          <Text style={styles.title}>Provider</Text>
          {providers.map((item) => (
            <TouchableOpacity
              key={item.alias}
              onPress={() =>
                setState((prev) => ({
                  ...prev,
                  provider: item.alias,
                }))
              }
              style={styles.item}
            >
              <Text style={styles.itemTitle}>{item.alias}</Text>
              {state.provider === item.alias ? (
                <View style={styles.radio}>
                  <View style={styles.radioChecked} />
                </View>
              ) : (
                <View style={styles.radio} />
              )}
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.button} onPress={handleCreateStream}>
            <Text style={styles.buttonText}>Create Stream</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default BroadcastPage;

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  inner: {
    paddingHorizontal: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioChecked: {
    width: 18,
    height: 18,
    backgroundColor: '#000',
    borderRadius: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    paddingVertical: 12,
  },
  button: {
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 36,
  },
  buttonText: {
    color: '#ffffff',
  },

  playPauseButton: {
    position: 'absolute',
    bottom: 48,
    left: '50%',
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#999999',
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
