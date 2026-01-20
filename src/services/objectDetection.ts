import { NativeModules } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

type AlarmModuleType = {
  detectObject?: (imagePath: string, targetLabel: string) => Promise<boolean>;
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

export const detectObject = async (uri: string, targetLabel: string) => {
  if (!alarmModule?.detectObject) {
    throw new Error('AlarmModule.detectObject is not available');
  }
  const normalizedUri = await normalizeToJpeg(uri);
  const matched = await alarmModule.detectObject(normalizedUri, targetLabel);
  return { matched, normalizedUri };
};
