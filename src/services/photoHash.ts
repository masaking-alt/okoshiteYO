import { NativeModules } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

type AlarmModuleType = {
  computePhotoHash?: (uri: string) => Promise<string>;
};

const alarmModule = NativeModules.AlarmModule as AlarmModuleType | undefined;

export const normalizeToJpeg = async (uri: string) => {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [],
    {
      compress: 0.8,
      format: ImageManipulator.SaveFormat.JPEG
    }
  );
  return result.uri;
};

export const computePhotoHash = async (uri: string) => {
  if (!alarmModule?.computePhotoHash) {
    throw new Error('AlarmModule.computePhotoHash is not available');
  }
  const normalizedUri = await normalizeToJpeg(uri);
  const hash = await alarmModule.computePhotoHash(normalizedUri);
  return { hash, normalizedUri };
};

export const hammingDistance = (left: string, right: string) => {
  if (left.length !== right.length) {
    throw new Error('Hash length mismatch');
  }
  let distance = 0;
  for (let i = 0; i < left.length; i += 1) {
    if (left[i] !== right[i]) {
      distance += 1;
    }
  }
  return distance;
};
