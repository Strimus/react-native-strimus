import { PermissionsAndroid } from 'react-native';

export const requestPermissions = async () => {
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      (PermissionsAndroid.PERMISSIONS as any).CAMERA,
      (PermissionsAndroid.PERMISSIONS as any).RECORD_AUDIO,
    ]);

    if (
      granted['android.permission.RECORD_AUDIO'] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.CAMERA'] ===
        PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log('You can use the cameras & mic');
    } else {
      console.log('Permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};
