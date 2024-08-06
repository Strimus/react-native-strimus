import type { ViewStyle } from 'react-native';
import type { Socket } from 'socket.io-client';

export interface ApiResponse<T> {
  success: boolean;
  code: number;
  data: T;
}

export type StrimusStreamProvider = 'aws' | 'agora' | 'erstream' | 'mux';

export type StrimusStreamType = 'audience' | 'broadcaster';

export type StrimusStreamStatus = 'live' | 'past' | 'all';

export type StrimusStreamResolution = 'SD' | 'HD' | 'FHD';

export type StrimusStreamCameraConfig = {
  cameraPosition?: 'front' | 'back';
  mirror?: boolean;
  aspectMode?: 'fill' | 'fit' | 'none';
  muted?: boolean;
};

export type StrimusVideoProps = {
  style?: ViewStyle;
  camera?: StrimusStreamCameraConfig;
  onStreamReady?: () => void;
};

export interface StrimusConfigInterface {
  id: number;
  label: string;
  alias: StrimusStreamProvider;
  default: boolean;
}

export interface StrimusStreamDataInterface {
  uniqueId: string;
  name: string;
  image: string;
}

export interface StrimusStreamInterface {
  id: number;
  source: StrimusStreamProvider;
  streamData: StrimusStreamDataInterface;
  streamUrl: string;
  streamKey: string;
  coverImage: string;
  isActive: boolean;
  type: 'new' | 'old_stream';
  url: string;
  videos: any[];
  channelName: string;
}

export interface StrimusBroadcastSocketUsrInterface {
  userId: string;
  nickName: string;
  socketId: string;
  extraInfo: {
    partnerKey: string;
  };
}

export interface StrimusBroadcastSocketInterface {
  roomId: string;
  roomName: string;
  roomType: string;
  roomOwner: string;
  roomUsers: StrimusBroadcastSocketUsrInterface[];
  partnerKey: number;
  roomMessage: [];
  userCount: number;
}

export interface StrimusBroadcastInterface {
  id: number;
  source: StrimusStreamProvider;
  streamData: StrimusStreamDataInterface;
  streamUrl: string;
  streamKey: string;
  coverImage: string;
  resolution: StrimusStreamResolution;
  socketRoomInfo: StrimusBroadcastSocketInterface;
  channelName: string;
  streamId: number;
  uid: number;
  appId: string;
  token: string;
  roomId: string;
}

export interface StrimusInterface {
  key: string;
  uniqueId: string;
  token: string;
  getProviders: () => Promise<StrimusConfigInterface[]>;
  getStreams: (type: StrimusStreamStatus) => Promise<StrimusStreamInterface[]>;
  getStream: (id: string) => Promise<StrimusStreamInterface>;
  setStreamerData: (uniqueId: string, token: string) => void;
  createStream: (
    provider: StrimusStreamProvider,
    data: StrimusStreamDataInterface
  ) => Promise<any>;
  stopStream: (id: number) => Promise<any>;
}

export interface StrimusSocketInterface {
  key: string;
  messageListeners: Function[];
  socket: Socket;
  connect: () => void;
  disconnect: () => void;
  createRoom: (
    roomId: String,
    roomName: String,
    userID: String,
    roomType: String
  ) => void;
  joinRoom: (roomId: String) => void;
  leaveRoom: (roomId: String) => void;
  sendMessage: (roomId: String, message: String) => void;
  addMessageListener: (fnc: Function) => void;
  removeMessageListener: (fnc: Function) => void;
  _onMessage: (message: any) => void;
}
