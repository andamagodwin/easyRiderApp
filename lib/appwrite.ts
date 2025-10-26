import { Account, Client, Databases } from 'react-native-appwrite';
import Constants from 'expo-constants';

const extra = Constants?.expoConfig?.extra as any;

const endpoint: string | undefined = extra?.APPWRITE_ENDPOINT;
const projectId: string | undefined = extra?.APPWRITE_PROJECT_ID;
const platform: string | undefined = extra?.android?.package || extra?.bundleIdentifier || extra?.APPWRITE_PLATFORM;

if (!endpoint || !projectId) {
  // We don't throw immediately to avoid breaking importers at build time; actions will throw when used.
  console.warn('Appwrite config missing: set expo.extra.APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID in app.json');
}

export const client = new Client();

if (endpoint) client.setEndpoint(endpoint);
if (projectId) client.setProject(projectId);
if (platform) client.setPlatform(platform);

export const account = new Account(client);
export const databases = new Databases(client);

export function assertConfigured() {
  if (!endpoint || !projectId) {
    throw new Error('Missing Appwrite config. Please set expo.extra.APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID in app.json');
  }
}
