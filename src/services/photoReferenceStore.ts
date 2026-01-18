import AsyncStorage from '@react-native-async-storage/async-storage';

const REF_HASH_KEY = 'photo_reference_hash';
const REF_URI_KEY = 'photo_reference_uri';

export type PhotoReference = {
  hash: string | null;
  uri: string | null;
};

export const getPhotoReference = async (): Promise<PhotoReference> => {
  const entries = await AsyncStorage.multiGet([REF_HASH_KEY, REF_URI_KEY]);
  const hash = entries.find(([key]) => key === REF_HASH_KEY)?.[1] ?? null;
  const uri = entries.find(([key]) => key === REF_URI_KEY)?.[1] ?? null;
  return { hash, uri };
};

export const getPhotoReferenceHash = async (): Promise<string | null> => {
  const value = await AsyncStorage.getItem(REF_HASH_KEY);
  return value ?? null;
};

export const setPhotoReference = async (hash: string, uri?: string) => {
  const pairs: [string, string][] = [[REF_HASH_KEY, hash]];
  if (uri) {
    pairs.push([REF_URI_KEY, uri]);
  }
  await AsyncStorage.multiSet(pairs);
};

export const clearPhotoReference = async () => {
  await AsyncStorage.multiRemove([REF_HASH_KEY, REF_URI_KEY]);
};
