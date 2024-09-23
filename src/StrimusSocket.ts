import { io, Socket } from 'socket.io-client';
import type { StrimusSocketInterface } from './types/strimus';

export class StrimusSocket implements StrimusSocketInterface {
  key: string;
  messageListeners: Function[] = [];
  socket: Socket;
  socketURL: string;

  /**
   * Initialize StrimusSocket
   * @param key clientKey
   * @example
   * ```typescript
   * const strimusClient = new StrimusClient
   * strimusClient.socket.connect();
   * ```
   */
  constructor(key: string, socketURL: string) {
    console.log(`Initializing StrimusSocket with key ${key}`);

    this.key = key;
    this.socketURL = socketURL;
    this.socket = io(this.socketURL, {
      autoConnect: false,
      extraHeaders: {
        partnerkey: key,
      },
    });

    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.joinRoom = this.joinRoom.bind(this);
    this.leaveRoom = this.leaveRoom.bind(this);
    this.sendMessage = this.sendMessage.bind(this);

    this.socket.on('message', this._onMessage);
  }

  /**
   * Connect to socket
   * @returns void
   * @example
   * ```typescript
   * strimusClient.socket.connect();
   * ```
   */
  connect() {
    console.log('Connecting to socket');

    this.socket.connect();
  }

  /**
   * Disconnect from socket
   * @returns void
   * @example
   * ```typescript
   * strimusClient.socket.disconnect();
   * ```
   */
  disconnect() {
    console.log('Disconnecting from socket');

    this.socket.disconnect();
  }

  _onMessage(message: string) {
    this.messageListeners.forEach((listener) => {
      listener(message);
    });
  }

  /**
   * Create room
   * @param roomId string
   * @param roomName string
   * @param userID string
   * @param roomType string
   * @returns void
   * @example
   * ```typescript
   * strimusClient.socket.createRoom('room1', 'Room 1', 'user1', 'audience');
   * ```
   */
  createRoom(
    roomId: String,
    roomName: String,
    userID: String,
    roomType: String
  ) {
    console.log(
      `Creating room ${roomId} with name ${roomName} for user ${userID} of type ${roomType}`
    );

    this.socket.emit('createRoom', {
      roomId,
      roomName,
      userID,
      roomType,
      partnerKey: this.key,
    });
  }

  /**
   * Join room
   * @param roomId string
   * @returns void
   * @example
   * ```typescript
   * strimusClient.socket.joinRoom('room1');
   * ```
   */
  joinRoom(roomId: String) {
    console.log(`Joining room ${roomId}`);

    this.socket.emit('joinRoom', {
      roomId,
    });
  }

  /**
   * Leave room
   * @param roomId string
   * @returns void
   * @example
   * ```typescript
   * strimusClient.socket.leaveRoom('room1');
   * ```
   */
  leaveRoom(roomId: String) {
    console.log(`Leaving room ${roomId}`);

    this.socket.emit('leaveRoom', {
      roomId,
    });
  }

  /**
   * Send message
   * @param roomId string
   * @param message string
   * @returns void
   * @example
   * ```typescript
   * strimusClient.socket.sendMessage('room1', 'Hello, world!');
   * ```
   */
  sendMessage(roomId: String, message: String) {
    console.log(`Sending message ${message} to room ${roomId}`);

    this.socket.emit('message', {
      roomId,
      message,
    });
  }

  /**
   * Add message listener
   * @param callback Function
   * @returns void
   * @example
   * ```typescript
   * const fnc = (message: string) => {
   *  console.log('Received message:', message);
   * };
   * strimusClient.socket.addMessageListener(fnc);
   * ```
   */
  addMessageListener(callback: Function) {
    if (typeof callback !== 'function') return;

    this.messageListeners.push(callback);
  }

  /**
   * Remove message listener
   * @param callback Function
   * @returns void
   * @example
   * ```typescript
   * strimusClient.socket.removeMessageListener(fnc);
   * ```
   * */
  removeMessageListener(callback: Function) {
    this.messageListeners = this.messageListeners.filter(
      (listener) => listener !== callback
    );
  }
}
