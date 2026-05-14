import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform, Animated, Linking , Alert } from 'react-native';
import Splash from './screens/splash/Index'
import HomeNavigator from './screens/home/HomeNavigator'
import AccountNavigator from './screens/account/Index'
import { useFonts, Nunito_300Light, Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import Color from './components/Color';
import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, onAuthStateChanged, getReactNativePersistence } from 'firebase/auth';
// import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import * as TaskManager from 'expo-task-manager';
import { getDatabase, ref, set } from "firebase/database";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import useMainStore from './zustand/MainStore';
import moment from "moment";
import 'moment/min/locales';
import useCultureStore from './zustand/CultureStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useAuthStore from './zustand/AuthStore';
import AppLoading from './screens/splash/AppLoading';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import * as SplashScreen from "expo-splash-screen";
import 'react-native-reanimated';
import { configureReanimatedLogger } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GetVersion from './services/vita/GetVersion';
import {compareVersions} from 'compare-versions';

configureReanimatedLogger({
  warn: () => { },
  error: () => { },
  info: () => { },
  debug: () => { },
});
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
const firebaseConfig = {
  apiKey: "AIzaSyAZGSFLWpu8UvobdWtyDKvjIE30j8Txvrc",
  authDomain: "vitadrivetransfer.firebaseapp.com",
  databaseURL: "https://vitadrivetransfer-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "vitadrivetransfer",
  storageBucket: "vitadrivetransfer.appspot.com",
  messagingSenderId: "665954629942",
  appId: "1:665954629942:web:1f3a07ab76c7309e929b97"
};

let firebaseApp;
let auth;
if (getApps().length < 1) {
  firebaseApp = initializeApp(firebaseConfig);
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  firebaseApp = getApp();
  auth = getAuth();
}
firebaseApp = getApp();
const db = getDatabase(firebaseApp);
// let firebaseApp;
// let auth;

// if (getApps().length === 0) {
//   firebaseApp = initializeApp(firebaseConfig);
//   auth = initializeAuth(firebaseApp, {
//     persistence: getReactNativePersistence(AsyncStorage),
//   });
// } else {
//   firebaseApp = getApp();
//   auth = getAuth(firebaseApp); // Bu eksikti
// }

// // Realtime DB
// const db = getDatabase(firebaseApp);

const LOCATION_TASK_NAME = 'background-location-task';
TaskManager.defineTask(LOCATION_TASK_NAME, ({ data, error }) => {
  if (error) {
    return;
  }
  if (data) {
    const { locations } = data;
    const auth = getAuth();
    if (useAuthStore.getState().loginUser != null) {
      set(ref(db, "locations/" + useAuthStore.getState().loginUser.id), {
        d: useAuthStore.getState().loginUser.id + "|" + locations[0].coords.latitude + "|" + locations[0].coords.longitude,
      });
    }
  }
});

SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});
SplashScreen.hideAsync()
function AnimatedAppLoader({ children }) {
  const [isSplashReady, setSplashReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      setSplashReady(true);
    }

    prepare();
  }, []);

  if (!isSplashReady) {
    return null;
  }

  return <AnimatedSplashScreen >{children}</AnimatedSplashScreen>;
}

function AnimatedSplashScreen({ children }) {
  const animation = useMemo(() => new Animated.Value(1), []);
  const [isAppReady, setAppReady] = useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (isAppReady) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => setAnimationComplete(true));
    }
  }, [isAppReady]);

  const onImageLoaded = useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
      // Load stuff
      await Promise.all([]);
    } catch (e) {
      // handle errors
    } finally {
      setAppReady(true);
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {isAppReady && children}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants.expoConfig.splash.backgroundColor,
              opacity: animation,
            },
          ]}
        >
          <Animated.Image
            style={{
              width: "100%",
              height: "100%",
              resizeMode: Constants.expoConfig.splash.resizeMode || "contain",
              transform: [
                {
                  scale: animation,
                },
              ],
            }}
            source={require('./assets/splash.png')}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
}

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState('');
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const mainStore = useMainStore((state) => state);
  const cultureStore = useCultureStore((state) => state);
  const authStore = useAuthStore((state) => state);
  const responseListener = useRef();

  let [fontsLoaded] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold
  });

  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
      }
    };

    checkForUpdates();
  }, []);

  useEffect(() => {
    setIsLoaded(fontsLoaded);
  }, [fontsLoaded])
  useEffect(() => {
    if (cultureStore.culture == 'tr') {
      moment.locale('tr')
    }
    else if (cultureStore.culture == 'en') {
      moment.locale('en-gb')
    }
    else if (cultureStore.culture == 'de') {
      moment.locale('de')
    }
    registerForPushNotificationsAsync().then(
      (token) => token && (setExpoPushToken(token), mainStore.setPushToken(token), console.log(token)),

    );
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    // return () => {
    //   notificationListener.current &&
    //     Notifications.removeNotificationSubscription(
    //       notificationListener.current,
    //     );
    //   responseListener.current &&
    //     Notifications.removeNotificationSubscription(responseListener.current);
    // };
    return () => {
      notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();
    };
    // registerForPushNotificationsAsync().then(token => { setExpoPushToken(token); mainStore.setPushToken(token); console.log('expoPushToken', token) });
    // notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
    //   setNotification(notification);
    // });

    // return () => {
    //   TaskManager.unregisterAllTasksAsync();
    //   Notifications.removeNotificationSubscription(notificationListener.current);
    // };

  }, []);
  useEffect(() => {
    versionControl()
  }, []);
  function versionControl() {
    const runtimeVersion = Constants.expoConfig?.version
    console.log('geldi' , runtimeVersion)
    GetVersion.Get().then(response => {
      console.log('burası geliyor mu ')
      if (response.data.responseCode == 200) {
        console.log('asdasd',response.data.data)
        if (compareVersions(runtimeVersion, response.data.data) === -1) {
          Alert.alert(
            "Yeni Sürüm Mevcut",
            "Uygulamayı kullanmaya devam edebilmek için güncelleme yapmalısınız.",
            [
              {
                text: "Güncelle",
                onPress: () => {
                  const storeUrl = Platform.select({
                    ios: "https://apps.apple.com/tr/app/vitadrive-transfer/id1667275115",
                    android: "https://play.google.com/store/apps/details?id=com.vitarnd.vitaDrive.Transfer&pli=1"
                  });
                  Linking.openURL(storeUrl);
                },
              },
            ],
            { cancelable: false }
          );
        }
      }
      else {
        console.log('response sonuc else....', response.data)
      }
    }).catch((error) => {
      console.error(error)
    })
  }
  async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data;
    } else {
    }
    return token;
  }
  if (!isLoaded) {
    return <Splash />;
  }

  if (authStore.isAuthenticated == true) {
    return (
      <AnimatedAppLoader>
        <Provider store={store}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <HomeNavigator />
          </GestureHandlerRootView>
        </Provider>
      </AnimatedAppLoader>
    );
  }
  else if (authStore.isAuthenticated == false) {
    return (
      // <AnimatedAppLoader>
      <Provider store={store}>
        <AccountNavigator />
      </Provider>
      // </AnimatedAppLoader>
    )
  }
  else {
    return (<AppLoading></AppLoading>)
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
