import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { Pedometer } from 'expo-sensors';

export type PermissionResult = 'granted' | 'denied' | 'unavailable';

export type UserPlace = {
  latitude: number;
  longitude: number;
  city: string;
};

export type StartupPermissions = {
  location: PermissionResult;
  steps: PermissionResult;
  notifications: PermissionResult;
  camera: PermissionResult;
  photos: PermissionResult;
  place: UserPlace | null;
};

let startup: Promise<StartupPermissions> | null = null;

export function requestStartupPermissions() {
  if (!startup) startup = askAtLaunch();
  return startup;
}

async function askAtLaunch(): Promise<StartupPermissions> {
  const location = await askLocation();
  const steps = await requestStepAccess();
  const notifications = await requestAlerts();
  const camera = await askCamera();
  const photos = await askPhotos();
  return {
    location: location.status,
    steps: steps.status,
    notifications,
    camera,
    photos,
    place: location.place,
  };
}

export async function requestStepAccess(): Promise<{ status: PermissionResult; today: number | null }> {
  try {
    let permission = await Pedometer.requestPermissionsAsync();
    let today: number | null = null;
    try {
      const count = await Pedometer.getStepCountAsync(startOfToday(), new Date());
      today = count.steps;
      permission = await Pedometer.getPermissionsAsync();
    } catch {
      // Android has no step history. The permission request above is the prompt.
    }
    if (!permission.granted) {
      const available = await Pedometer.isAvailableAsync().catch(() => false);
      return { status: available ? 'denied' : 'unavailable', today: null };
    }
    return { status: 'granted', today };
  } catch {
    return { status: 'unavailable', today: null };
  }
}

export async function readStepAccess(): Promise<{ status: PermissionResult; today: number | null }> {
  try {
    const permission = await Pedometer.getPermissionsAsync();
    if (!permission.granted) {
      const available = await Pedometer.isAvailableAsync().catch(() => false);
      return { status: available ? 'denied' : 'unavailable', today: null };
    }
    return { status: 'granted', today: await stepsToday() };
  } catch {
    return { status: 'unavailable', today: null };
  }
}

export function watchNewSteps(onSteps: (stepsSinceStart: number) => void) {
  const subscription = Pedometer.watchStepCount((update) => onSteps(update.steps));
  return () => subscription.remove();
}

export async function takeProfilePhoto(): Promise<string | null> {
  try {
    const camera = await ImagePicker.getCameraPermissionsAsync();
    if (camera.granted) {
      const shot = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!shot.canceled) return shot.assets[0]?.uri ?? null;
    }
    const library = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (!library.granted) return null;
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (picked.canceled) return null;
    return picked.assets[0]?.uri ?? null;
  } catch {
    return null;
  }
}

async function askLocation(): Promise<{ status: PermissionResult; place: UserPlace | null }> {
  try {
    const permission = await withTimeout(Location.requestForegroundPermissionsAsync(), 8000, null);
    if (!permission?.granted) return { status: permission ? 'denied' : 'unavailable', place: null };
    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      8000,
      null,
    );
    if (!position) return { status: 'granted', place: null };
    let city = '';
    try {
      const [found] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      city = [found?.city || found?.district || found?.subregion, found?.region].filter(Boolean).join(', ');
    } catch {
      city = '';
    }
    return {
      status: 'granted',
      place: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city,
      },
    };
  } catch {
    return { status: 'unavailable', place: null };
  }
}

async function askCamera(): Promise<PermissionResult> {
  try {
    const result = await ImagePicker.requestCameraPermissionsAsync();
    return result.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

async function askPhotos(): Promise<PermissionResult> {
  try {
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return result.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

async function stepsToday() {
  try {
    const count = await Pedometer.getStepCountAsync(startOfToday(), new Date());
    return count.steps;
  } catch {
    return null;
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      },
    );
  });
}

function startOfToday() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

async function requestAlerts(): Promise<PermissionResult> {
  try {
    const result = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: true, allowSound: true },
    });
    return result.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}
