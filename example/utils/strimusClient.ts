import { Strimus } from 'react-native-strimus';
import { StrimusConfig } from '../config/strimus';

export const strimusClient = new Strimus(StrimusConfig.partnerKey, {
  url: StrimusConfig.API_URL,
  socketUrl: StrimusConfig.SOCKET_URL,
});

export default strimusClient;
