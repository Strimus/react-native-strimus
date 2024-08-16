import { type ExpoConfig, type ConfigContext } from 'expo/config';

import {
  withInfoPlist,
  withAndroidManifest,
  type ConfigPlugin,
  type AndroidConfig,
  type IOSConfig,
} from '@expo/config-plugins';

// More info: https://developer.android.com/guide/topics/manifest/uses-feature-element
const validAndroidFeatures = [
  'android.hardware.audio.low_latency',
  'android.hardware.audio.output',
  'android.hardware.audio.pro',
  'android.hardware.bluetooth',
  'android.hardware.bluetooth_le',
  'android.hardware.camera',
  'android.hardware.camera.any',
  'android.hardware.camera.autofocus',
  'android.hardware.camera.capability.manual_post_processing',
  'android.hardware.camera.capability.manual_sensor',
  'android.hardware.camera.capability.raw',
  'android.hardware.camera.external',
  'android.hardware.camera.flash',
  'android.hardware.camera.front',
  'android.hardware.camera.level.full',
  'android.hardware.consumerir',
  'android.hardware.faketouch',
  'android.hardware.faketouch.multitouch.distinct',
  'android.hardware.faketouch.multitouch.jazzhand',
  'android.hardware.fingerprint',
  'android.hardware.gamepad',
  'android.hardware.location',
  'android.hardware.location.gps',
  'android.hardware.location.network',
  'android.hardware.microphone',
  'android.hardware.nfc',
  'android.hardware.nfc.hce',
  'android.hardware.opengles.aep',
  'android.hardware.screen.landscape',
  'android.hardware.screen.portrait',
  'android.hardware.sensor.accelerometer',
  'android.hardware.sensor.ambient_temperature',
  'android.hardware.sensor.barometer',
  'android.hardware.sensor.compass',
  'android.hardware.sensor.gyroscope',
  'android.hardware.sensor.heartrate',
  'android.hardware.sensor.heartrate.ecg',
  'android.hardware.sensor.hifi_sensors',
  'android.hardware.sensor.light',
  'android.hardware.sensor.proximity',
  'android.hardware.sensor.relative_humidity',
  'android.hardware.sensor.stepcounter',
  'android.hardware.sensor.stepdetector',
  'android.hardware.telephony',
  'android.hardware.telephony.cdma',
  'android.hardware.telephony.gsm',
  'android.hardware.touchscreen',
  'android.hardware.touchscreen.multitouch',
  'android.hardware.touchscreen.multitouch.distinct',
  'android.hardware.touchscreen.multitouch.jazzhand',
  'android.hardware.type.automotive',
  'android.hardware.type.pc',
  'android.hardware.type.television',
  'android.hardware.type.watch',
  'android.hardware.usb.accessory',
  'android.hardware.usb.host',
  'android.hardware.vulkan.compute',
  'android.hardware.vulkan.level',
  'android.hardware.vulkan.version',
  'android.hardware.wifi',
  'android.hardware.wifi.direct',
] as const;

// More info: https://developer.apple.com/documentation/bundleresources/information_property_list/uirequireddevicecapabilities/
const validIOSFeatures = [
  'accelerometer',
  'arkit',
  'arm64',
  'armv7',
  'auto-focus-camera',
  'bluetooth-le',
  'camera-flash',
  'driverkit',
  'front-facing-camera',
  'gamekit',
  'gps',
  'gyroscope',
  'healthkit',
  'iphone-ipad-minimum-performance-a12',
  'iphone-performance-gaming-tier',
  'location-services',
  'magnetometer',
  'metal',
  'microphone',
  'nfc',
  'opengles-1',
  'opengles-2',
  'opengles-3',
  'peer-peer',
  'sms',
  'still-camera',
  'telephony',
  'video-camera',
  'wifi',
] as const;

type HardwareFeatureAndroid = (typeof validAndroidFeatures)[number];
type HardwareFeatureIOS = (typeof validIOSFeatures)[number];

export const withRequiredHardware: ConfigPlugin<{
  ios: Array<HardwareFeatureIOS>;
  android: Array<HardwareFeatureAndroid>;
}> = (config, { android, ios }) => {
  // Add android required hardware
  config = withAndroidManifest(config, (cnfg) => {
    cnfg.modResults = addHardwareFeaturesToAndroidManifestManifest(
      cnfg.modResults,
      android
    );
    return cnfg;
  });

  // Add ios required hardware
  config = withInfoPlist(config, (cnfg) => {
    cnfg.modResults = addRequiredDeviceCapabilitiesToInfoPlist(
      cnfg.modResults,
      ios
    );
    return cnfg;
  });

  return config;
};

export function addHardwareFeaturesToAndroidManifestManifest(
  androidManifest: AndroidConfig.Manifest.AndroidManifest,
  requiredFeatures: Array<HardwareFeatureAndroid>
) {
  // Add `<uses-feature android:name="android.hardware.camera.front" android:required="true"/>` to the AndroidManifest.xml
  if (!Array.isArray(androidManifest.manifest['uses-feature'])) {
    androidManifest.manifest['uses-feature'] = [];
  }

  // Here we add the feature to the manifest:
  // loop through the array of features and add them to the manifest if they don't exist
  for (const feature of requiredFeatures) {
    if (
      !androidManifest.manifest['uses-feature'].find(
        (item) => item.$['android:name'] === feature
      )
    ) {
      androidManifest.manifest['uses-feature']?.push({
        $: {
          'android:name': feature,
          'android:required': 'true',
        },
      });
    }
  }

  return androidManifest;
}

export function addRequiredDeviceCapabilitiesToInfoPlist(
  infoPlist: IOSConfig.InfoPlist,
  requiredFeatures: Array<HardwareFeatureIOS>
) {
  if (!infoPlist.UIRequiredDeviceCapabilities) {
    infoPlist.UIRequiredDeviceCapabilities = [];
  }
  const existingFeatures =
    infoPlist.UIRequiredDeviceCapabilities as Array<HardwareFeatureIOS>;
  for (const f of requiredFeatures) {
    if (!existingFeatures.includes(f)) {
      existingFeatures.push(f);
    }
  }

  infoPlist.UIRequiredDeviceCapabilities = existingFeatures;
  return infoPlist;
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'react-native-strimus-example',
  slug: 'react-native-strimus-example',
  orientation: 'portrait',
  icon: './assets/icon.png',
  version: '1.0.1',
  scheme: 'myapp',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    buildNumber: '1.0.2',
    supportsTablet: true,
    bundleIdentifier: 'com.machinarium.strimusrn',
    infoPlist: {
      NSCameraUsageDescription: 'This app uses the camera to take photos.',
      NSMicrophoneUsageDescription:
        'This app uses the microphone to record audio.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    versionCode: 4,
    package: 'com.machinarium.strimusrn',
    permissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.FLASHLIGHT',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
  },
  web: {
    favicon: './assets/favicon.png',
  },

  plugins: [
    [
      withRequiredHardware as any,
      {
        ios: [],
        android: [
          'android.hardware.camera',
          'android.hardware.camera.autofocus',
        ],
      },
    ],
  ],
});
