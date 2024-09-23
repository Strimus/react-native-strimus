import { StrimusSocket } from './StrimusSocket';
import type {
  StrimusBroadcastInterface,
  StrimusStreamDataInterface,
  StrimusStreamInterface,
  StrimusConfigInterface,
  StrimusInterface,
  StrimusStreamProvider,
} from './types/strimus';

export class Strimus implements StrimusInterface {
  key: string = '';
  token: string = '';
  uniqueId: string = '';
  apiURL: string;
  socketURL: string;
  socket: StrimusSocket;

  /**
   * Initialize Strimus
   * @param key
   * @example
   * const strimus = new Strimus('key');
   */
  constructor(
    key: string,
    api: {
      url: string;
      socketUrl: string;
    }
  ) {
    if (!key) {
      throw new Error('Key is required');
    }

    console.log(`Initializing Strimus with key ${key}`);

    this.key = key;
    this.apiURL = api.url;
    this.socketURL = api.socketUrl;

    this._request = this._request.bind(this);
    this.getProviders = this.getProviders.bind(this);
    this.getStreams = this.getStreams.bind(this);
    this.getStream = this.getStream.bind(this);
    this.createStream = this.createStream.bind(this);
    this.stopStream = this.stopStream.bind(this);
    this.socket = new StrimusSocket(key, this.socketURL);
  }

  /**
   * Set the streamer data
   * @param uniqueId
   * @param token
   * @example
   * strimus.setStreamerData('uniqueId', 'token');
   */
  setStreamerData(uniqueId: string, token: string) {
    this.uniqueId = uniqueId;
    this.token = token;
  }

  private async _request(pathname: string, options?: RequestInit) {
    try {
      const resp = await fetch(`${this.apiURL}${pathname}`, {
        ...options,
        headers: {
          ...options?.headers,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          ...(this.token
            ? {
                token: this.token,
              }
            : null),
          ...(this.key
            ? {
                key: this.key,
              }
            : null),
        },
      });

      if (!resp.ok) {
        throw new Error(
          `Request failed with status ${resp.status} - ${JSON.stringify(resp)}`
        );
      }

      const response = await resp.json();

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all providers
   * @returns {Promise<StrimusConfigInterface[]>}
   * @throws {Error} If the request fails
   * @async
   * @example
   * try {
   *  const providers = await strimus.getProviders();
   *  console.log(providers);
   * } catch (error) {
   *  console.error(error);
   * }
   */
  async getProviders(): Promise<StrimusConfigInterface[]> {
    try {
      const response = await this._request('/config');
      return response.configs;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all streams
   * @param type live | past | all
   * @returns {Promise<StreamInterface[]>}
   * @throws {Error} If the request fails
   * @async
   * @example
   * try {
   *  const streams = await strimus.getStreams('all');
   *  console.log(streams);
   * } catch (error) {
   *  console.error(error);
   * }
   */
  async getStreams(type: 'live' | 'old_stream') {
    try {
      const response = (await this._request(
        `/streams?type=${type}`
      )) as StrimusStreamInterface[];

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get a stream by id
   * @param id
   * @returns {Promise<StreamInterface>}
   * @throws {Error} If the request fails
   * @async
   * @example
   * try {
   *  const stream = await strimus.getStream('id');
   *  console.log(stream);
   * } catch (error) {
   *  console.error(error);
   * }
   */
  async getStream(id: string) {
    try {
      const response = (await this._request(
        `/stream/${id}`
      )) as StrimusStreamInterface;

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new stream
   * @param data
   * @returns
   * @throws {Error} If streamer data is not set
   * @throws {Error} If the request fails
   * @async
   * @example
   * try {
   *  const stream = await strimus.createStream({
   *    uniqueId: 'uniqueId',
   *    name: 'name',
   *    image: 'image',
   *  });
   *  console.log(stream);
   * } catch (error) {
   *  console.error(error);
   * }
   */
  async createStream(
    provider: StrimusStreamProvider,
    data: StrimusStreamDataInterface
  ) {
    if (this.uniqueId === '' || this.token === '') {
      throw new Error('Streamer data not set');
    }

    try {
      const response: StrimusBroadcastInterface = await this._request(
        '/stream',
        {
          method: 'POST',
          body: JSON.stringify({
            source: provider,
            streamData: data,
          }),
        }
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Start a stream
   * @param id stream id
   * @returns
   * @throws {Error} If the request fails
   * @async
   *
   */

  async startStream(id: number) {
    try {
      await this._request(`/stream-start/${id}`, {
        method: 'PUT',
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Stop a stream
   * @param id stream id
   * @returns
   * @throws {Error} If the request fails
   * @async
   * @example
   * try {
   *  await strimus.stopStream('id');
   *  console.log('Stream stopped');
   * } catch (error) {
   *  console.error(error);
   * }
   */
  async stopStream(id: number) {
    try {
      await this._request(`/stream/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      throw error;
    }
  }
}
