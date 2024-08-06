# react-native-strimus

React native package for Strimus.

## Installation

```sh
npm install react-native-strimus
```

### Install dependencies

```sh
npm install amazon-ivs-react-native-broadcast react-native-video react-native-agora
```

and install the pods

```sh
npx pod-install
```

## Permissions

### Android

Open AwesomeProject/android/app/src/main/AndroidManifest.xml, Add

```
<uses-feature android:name="android.hardware.camera"/>
<uses-feature android:name="android.hardware.camera.autofocus"/>

<uses-permission android:name="android.permission.CAMERA"/>
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.FLASHLIGHT"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
```

https://reactnative.dev/docs/permissionsandroid

### iOS

Open AwesomeProject/ios/AwesomeProject/Info.plist , Add:

```
<key>NSCameraUsageDescription</key>
<string>AwesomeProject requires access to your phone’s camera.</string>
<key>NSMicrophoneUsageDescription</key>
<string>AwesomeProject requires access to your phone’s Microphone.</string>
```

## Usage

```js
import { Strimus, StrimusPlayer } from 'react-native-strimus';

// ...

const strimusClient = new Strimus('KEY');

// to access socket
strimusClient.socket.connect()
```

### StrimusPlayer Props

```ts
// Audience player
type StrimusPlayerProps = {
  type: 'audience';
  stream: StrimusStreamInterface;
  style: ViewStyle;
};

// Broadcast player

type StrimusPlayerProps = {
  type: 'broadcast';
  broadcast: StrimusBroadcastInterface;
  style: ViewStyle;
  camera: {
    cameraPosition: 'front' | 'back';
    mirror: boolean;
    aspectMode: 'fill' | 'fit' | 'none';
    muted: boolean;
  };
  onStreamReady: () => void;
};
```

## Fetch All Streams

```js
const [streams, setStreams] = useState([]);

useEffect(() => {
  strimusClient.getStreams('all').then((data) => {
    setStreams(data);
  });
}, []);
```

## Get Stream

```jsx
const [stream, setStream] = useState();
const streamId = 1;

useEffect(() => {
  strimusClient.getStream(streamId).then((data) => {
    setStream(data);
  });
}, []);

return (
  <>
    {stream && (
      <StrimusPlayer
        type="audience"
        stream={stream}
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    )}
  </>
);
```

## Create Stream

```jsx
const [broadcast, setBroadcast] = useState();
const playerRef = useRef();

const handleCreate = async () => {
  // To start a broadcast, you must get a token from the strimus rest-api with your own server.
  // For security reasons, tokens cannot be created in the strimus sdk.
  // "uniqueId" is the user id of the broadcaster on your side, independent of strimus.

  strimusClient.setStreamerData('uniqueId', 'token');

  const response = await strimusClient.createStream('aws', {
    uniqueId: strimusClient.uniqueId,
    name: 'Test Stream on RN',
    image: 'https://picsum.photos/500/500',
  });

  setBroadcast(response);
};

const play = async () => {
  await playerRef.current.play();
};

const end = async () => {
  await playerRef?.current?.end();
  await strimusClient.stopStream(broadcast.id);
};

//  You can start broadcasting when the player is ready or with a button.
return (
  <>
    {broadcast && (
      <StrimusPlayer
        ref={playerRef}
        type="broadcaster"
        broadcast={broadcast}
        style={{
          width: '100%',
          height: '100%',
        }}
        onStreamReady={() => {
          play();
        }}
      />
    )}
  </>
);
```

### Stop Stream

```jsx
const end = async () => {
  await playerRef?.current?.end();
  await strimusClient.stopStream(broadcast.id);
};
```

### Get Providers

```jsx
const [providers, setProviders] = useState([]);

useEffect(() => {
  strimusClient.getProviders().then((data) => {
    setProviders(data);
  });
}, []);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
