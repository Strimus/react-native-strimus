import { Strimus } from 'react-native-strimus';
import { StrimusConfig } from '../config/strimus';

export const strimusClient = new Strimus(StrimusConfig.partnerKey);

export default strimusClient;
