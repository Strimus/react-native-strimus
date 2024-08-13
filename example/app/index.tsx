import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StrimusConfig } from '../config/strimus';
import strimusClient from '../utils/strimusClient';
import type { StrimusStreamInterface } from 'react-native-strimus';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [streams, setStreams] = useState<StrimusStreamInterface[]>([]);
  const [showOnlyActive, setShowOnlyActive] = useState<boolean>(false);
  const [state, setState] = useState<{
    token: string;
    uniqueId: string;
  }>({
    token: '',
    uniqueId: '',
  });

  const streamsArr = useMemo(() => {
    return {
      live: streams.filter(
        (item) => (showOnlyActive ? item.isActive : true) && item.type === 'new'
      ),
      past: streams.filter(
        (item) =>
          (showOnlyActive ? item.isActive : true) && item.type === 'old_stream'
      ),
    };
  }, [showOnlyActive, streams]);

  const handleAuth = useCallback(async () => {
    if (!state.uniqueId) {
      return Alert.alert('Please enter a unique ID');
    }

    try {
      const resp = await fetch(StrimusConfig.API_URL + '/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: StrimusConfig.clientId,
          uniqueId: +state.uniqueId,
          key: StrimusConfig.partnerKey,
          secret: StrimusConfig.partnerSecret,
        }),
      });

      if (!resp.ok) {
        throw await resp.json();
      }

      const response = await resp.json();

      strimusClient.setStreamerData(state.uniqueId, response.data.token);

      setState((prev) => ({
        ...prev,
        token: response.data.token,
      }));
    } catch (error: any) {
      Alert.alert(error?.error?.message ?? 'An error occurred');
      throw error;
    }
  }, [state]);

  const handleCreateStreamer = useCallback(async () => {
    if (!state.uniqueId) {
      return Alert.alert('Please enter a unique ID');
    }

    if (!state.token) {
      return Alert.alert('Please authenticate first');
    }

    try {
      const resp = await fetch(StrimusConfig.API_URL + '/streamer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${StrimusConfig.partnerKey}|${StrimusConfig.partnerSecret}`,
          'key': StrimusConfig.partnerKey,
        },
        body: JSON.stringify({
          clientId: StrimusConfig.clientId,
          key: StrimusConfig.partnerKey,
          secret: StrimusConfig.partnerSecret,
          streamer: {
            uniqueId: +state.uniqueId,
            name: `Deneme Yayıncısı ${state.uniqueId}`,
            imageUrl: 'https://picsum.photos/500/500',
            email: 'deneme_*****@denememe.com',
            profileUrl: 'https://linkedin.com/denememe',
          },
        }),
      });

      if (!resp.ok) {
        throw await resp.json();
      }

      Alert.alert('Streamer created successfully');
    } catch (error: any) {
      Alert.alert(error?.error?.message ?? 'An error occurred');
      console.log(error);
      throw error;
    }
  }, [state]);

  useEffect(() => {
    strimusClient.getStreams('all').then((response) => {
      setStreams(response);
    });
  }, []);

  return (
    <View style={styles.root}>
      <ScrollView>
        <View
          style={[
            styles.inner,
            {
              paddingTop: 24 + insets.top,
            },
          ]}
        >
          <Text style={styles.title}>Welcome</Text>

          <TextInput
            style={styles.input}
            placeholder="Unique ID"
            value={state.uniqueId}
            onChangeText={(txt) => setState({ ...state, uniqueId: txt })}
          />

          <View style={styles.buttons}>
            {!state.token ? (
              <TouchableOpacity style={styles.button} onPress={handleAuth}>
                <Text>Auth</Text>
                <Text style={styles.buttonInfo}>(streamer)</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  router.push({
                    pathname: '/broadcast',
                    params: state,
                  })
                }
              >
                <Text>Start Broastcast</Text>
                <Text style={styles.buttonInfo}>(streamer)</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateStreamer}
            >
              <Text>Create</Text>
              <Text style={styles.buttonInfo}>(streamer)</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, styles.switchContaniner]}>
            <Text>Show only active streams</Text>
            <Switch value={showOnlyActive} onValueChange={setShowOnlyActive} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Streams</Text>

            {streamsArr.live.length === 0 ? (
              <Text>There is no live streams</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator>
                {streamsArr.live.map((stream, index) => (
                  <TouchableOpacity
                    style={styles.item}
                    key={index}
                    onPress={() => {
                      router.push({
                        pathname: '/stream/[id]',
                        params: {
                          id: stream.id,
                        },
                      });
                    }}
                  >
                    {stream.streamData.image ? (
                      <Image
                        style={styles.itemImage}
                        source={{ uri: stream.streamData.image }}
                      />
                    ) : (
                      <View style={styles.itemImage} />
                    )}
                    <Text style={styles.itemTitle}>
                      #{stream.id} {stream.streamData.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Streams</Text>
            {streamsArr.live.length === 0 ? (
              <Text>There is no past streams</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator>
                {streamsArr.past.map((stream, index) => (
                  <TouchableOpacity
                    style={styles.item}
                    key={index}
                    onPress={() => {
                      router.push({
                        pathname: '/stream/[id]',
                        params: {
                          id: stream.id,
                        },
                      });
                    }}
                  >
                    {stream.streamData.image ? (
                      <Image
                        style={styles.itemImage}
                        source={{ uri: stream.streamData.image }}
                      />
                    ) : (
                      <View style={styles.itemImage} />
                    )}
                    <Text style={styles.itemTitle}>
                      #{stream.id} {stream.streamData.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  inner: {
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
  },
  switchContaniner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  item: {
    width: 150,
    marginRight: 16,
    paddingBottom: 14,
  },
  itemImage: {
    width: 150,
    height: 150,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // columnGap: 16,
    marginBottom: 36,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    width: Dimensions.get('screen').width / 2 - 36,
    alignItems: 'center',
  },

  buttonInfo: {
    fontSize: 12,
  },

  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 12,
  },
});
