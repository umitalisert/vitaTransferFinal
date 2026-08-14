import { Animated, Image, Modal, Platform, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import Color from '../../../components/Color';
import { setAvailable } from '../../../redux/slices/driverSlice';
import { setErrorMessage, setHasError, setLoading } from '../../../redux/slices/mainSlice';
import VText from '../../../components/VText';
import CalendarStrip from 'react-native-calendar-strip';
import Octicons from '@expo/vector-icons/Octicons';
import WorkOrder from '../../../services/vita/WorkOrder';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import WorkOrderCard from '../../../components/WorkOrderCard';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import * as Location from 'expo-location';
import VButton from '../../../components/VButton';
import useCultureStore from '../../../zustand/CultureStore';
import moment from "moment";
import 'moment/min/locales';
import Auth from '../../../services/vita/Auth';
import { getDatabase, ref, onValue, remove, off, set } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import useWorkStore from '../../../zustand/workStore';
import useProfileStore from '../../../zustand/ProfileStore';
import useAuthStore from '../../../zustand/AuthStore';
import useResponseStore from '../../../zustand/ResponseStore';
import * as TaskManager from 'expo-task-manager';
import useDriverStore from '../../../zustand/DriverStore';
import LottieView from 'lottie-react-native';

import BreakTimeBottomPage from '../../../components/BreakTimeBottomPage';
import BottomSheet, { BottomSheetModal, BottomSheetModalProvider, BottomSheetBackdrop, BottomSheetScrollView, BottomSheetView, } from '@gorhom/bottom-sheet';
import ChangeAvailableStatus from '../../../services/vita/ChangeAvailableStatus'
import ModalComponent from '../../../components/modalComponent';
import { Portal } from 'react-native-paper';
import CountdownTimer from '../../../components/CountDownTimer';
import ChangeDriverStatus_Async from '../../../services/vita/ChangeDriverStatus_Async';
const LOCATION_TASK_NAME = 'background-location-task';
import CountDownTimerMenu from '../../../components/CountDownTimerMenu';
import Ionicons from '@expo/vector-icons/Ionicons';
import CancelBreakStatus from '../../../services/vita/CancelBreakStatus';
import CounterUp from '../../../components/CounterUp';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ToastMessage from '../../../components/ToastMessage'
let foregroundSubscription = null;

const culture_en = {
  ok: 'OK',
  headerTextNotAvailable: 'I am busy',
  headerTextAvailable: 'I am available',
  completed: 'COMPLETED',
  transferType1: 'One Way Trip',
  transferType2: 'Round Trip',
  transferType3: 'Private Driver',
  transferType4: 'Shuttle',
  transfer: 'TRANSFER',
  distance: 'DISTANCE',
  duration: 'DURATION',
  passenger: 'Passenger',
  payment: 'PAYMENT',
  start1: 'Start',
  finish: 'Finish',
  amount: 'Amount',
  driverNote: 'Driver Note',
  addAdditionalService: 'Add Additional Service',
  dropTransfer: 'Drop Transfer',
  startLocation: 'STARTING POINT',
  pickupLocation: 'BOARDING POINT',
  dropLocation: 'LANDING POINT',
  company: 'Company',
  flightCode: 'Flight Code',
  situation: 'Situation',
  note: 'Greeter Note',
  waypointLocation: 'WAYPOINT',
  endLocation: 'ENDPOINT',
  waypointSingle: 'Waypoint',
  waypointMulti: 'Waypoints',
  trackingLink: 'Send Tracking Link',
  more: 'More',
  allTransfers: 'All transfers',
  waiting: 'Waiting for approval',
  completedTransfers: 'Upcoming',
  approve: 'Accept',
  deny: 'Reject',
  canceled: 'Canceled',
  noshow: 'No-Show',
  willBegin: 'Will begin',
  hasCompleted: 'Completed',
  boarded: 'Boarded the Vehicle',
  departed: 'Got Out of the Vehicle',
  arrived: 'Reached the Stop',
  late: 'Late',
  started: 'Started',
  passengerRecieved: 'Passenger recieved',
  notCompleted: 'Not completed',
  start: 'Start driving',
  continue: 'Continue driving',
  sendFollowLink: "Send Follow Link",
  show: 'SHOW',
  noUetds: 'No U-ETDS certificate',
  uetds: 'U-ETDS certificate available',
  create: 'CREATE',
  startDriving: 'Start driving',
  startDrivingText: 'Start driving as the first step.',
  finishDrivingText: 'Finish to complete the ride',
  navigate: 'Get Directions',
  finishWork: 'Finish',
  passengerSuccess: 'Congratulations! You reached the address and the passenger got into your vehicle. Please continue with the next step.',
  passengerDropSuccess: 'Congratulations! You reached the address and the passenger got out of your vehicle. Please continue with the next step.',
  waypointSuccess: 'Congratulations! You reached the address. Please continue with the next step.',
  completeMessage: 'Congratulations! You have complete the ride. Please check alternative rides available for you.',
  undo: 'Undo action',
  locationPermissionTitle: 'vitaDrive Transfer requests your location',
  locationPermissionText: 'vitaDrive Transfer uses your location to track your driving performance and distance you make for the rides we send when the app is in background',
  foregroundPermissionText: "In order to use vitaDrive Transfer in a healthier way, please allow location services as always in your device's settings.",
  locationPermissionButton: 'Allways Allow',
  foregroundPermissionButton: 'OK',
  usingLocationTitle: 'vitaDrive Transfer is running in the background',
  usingLocationSubTitle: 'We track your location in real time.',
  delay: 'min delay',
  timer: 'on time',
  transferLeave: 'Are you sure you want to abandon the transfer?',
  yesButton: 'Yes',
  noButton: 'No',
  warning: 'Warning',
  leavedTransfer: 'Transfer has been successfully abandoned',
  failed: 'Failed!',
  successful: 'Successful',
  notBoarded: "Passengers didn't arrive",
  modalSuccessMessage: 'Your break request has been received.',
  modalFinishMessage: 'The break has ended. Have a safe journey.',
  useBreakTime: 'Use Break',
  optionsText: 'Please select the reason for your break request',
  finishBreakTime: 'End Break',
  used: 'Used',
  startBreakTime: 'Start',
};

const culture_tr = {
  ok: 'Tamam',
  headerTextNotAvailable: 'Şu an meşgulüm',
  headerTextAvailable: 'Şu an müsaitim',
  completed: 'TAMAMLANAN',
  transferType1: 'Tek Yön Transfer',
  transferType2: 'Çift Yön',
  transferType3: 'Tahsis',
  transferType4: 'Shuttle',
  transfer: 'TRANSFER',
  distance: 'MESAFE',
  duration: 'SÜRE',
  passenger: 'Yolcu',
  payment: 'ÖDEME',
  start1: 'Başlangıç',
  finish: 'Bitiş',
  amount: 'Tutar',
  driverNote: 'Sürücü Notu',
  addAdditionalService: 'Ek Hizmet Ekle',
  dropTransfer: 'Transferi Bırak',
  company: 'Firma',
  flightCode: 'Uçuş Kodu',
  situation: 'Durum',
  note: 'Karşılama Notu',
  startLocation: 'BAŞLANGIÇ NOKTASI',
  endLocation: 'BİTİŞ NOKTASI',
  pickupLocation: 'ALINIŞ NOKTASI',
  dropLocation: 'BIRAKILIŞ NOKTASI',
  waypointLocation: 'DURAK NOKTASI',
  waypointSingle: 'Durak',
  waypointMulti: 'Durak',
  trackingLink: 'Takip Linki Gönder',
  more: 'Daha fazla',
  allTransfers: 'Tüm transferler',
  waiting: 'Onay bekleyenler',
  completedTransfers: 'Yaklaşanlar',
  approve: 'Kabul Et',
  deny: 'Reddet',
  noshow: 'Yolcu gelmedi',
  canceled: 'İptal edildi',
  willBegin: 'Başlayacak',
  hasCompleted: 'Tamamlandı',
  boarded: 'Yolcular Bindi',
  notBoarded: 'Yolcular Gelmedi',
  departed: 'Yolcular İndi',
  arrived: 'Durağa Vardım',
  late: 'Gecikti',
  started: 'Başladı',
  passengerRecieved: 'Yolcu alındı',
  notCompleted: 'Tamamlanmadı',
  start: 'Sürüşe Başla',
  continue: 'Sürüşe devam et',
  sendFollowLink: "Takip Linki Gönder",
  show: 'GÖRÜNTÜLE',
  noUetds: 'U-ETDS belgesi oluşturulmadı',
  uetds: 'U-ETDS belgesi mevcut',
  create: 'OLUŞTUR',
  startDriving: 'Sürüşe başlayın',
  startDrivingText: 'İlk adım olarak transferi başlatın.',
  finishDrivingText: 'Transferi sonlandırmak için hizmeti bitirin.',
  navigate: 'Yol Tarifi Al',
  finishWork: 'Bitir',
  passengerSuccess: 'Tebrikler! Adrese ulaştınız ve yolcu aracınıza bindi. Lütfen sonraki adımdan devam edin.',
  passengerDropSuccess: 'Tebrikler! Adrese ulaştınız ve yolcu aracınızdan indi. Lütfen sonraki adımdan devam edin.',
  waypointSuccess: 'Tebrikler! Adrese ulaştınız. Lütfen sonraki adımdan devam edin.',
  completeMessage: 'Tebrikler! Sürüşü tamamladınız. Lütfen size uygun alternatif işleri kontrol edin.',
  undo: 'İşlemi geri al',
  locationPermissionTitle: 'vitaDrive Transfer konum erişim izni',
  locationPermissionText: 'vitaDrive Transfer, uygulama arka plandayken sürüş performansınızı ve gönderdiğimiz yolculuklar için yaptığınız mesafeyi takip etmek için konumunuzu kullanır.',
  foregroundPermissionText: 'vitaDrive Transfer i daha sağlıklı kullanmak için lütfen cihazınızın ayarlar bölümünden konum servislerine her zaman olacak şekilde izin verin',
  locationPermissionButton: 'Her Zaman İzin Ver',
  foregroundPermissionButton: 'Tamam',
  usingLocationTitle: 'vitaDrive Transfer arkaplanda çalışıyor',
  usingLocationSubTitle: 'Konumunuzu gerçek zamanlı olarak takip ediyoruz.',
  delay: 'DK gecikme',
  timer: 'Zamanında',
  transferLeave: 'Transferi bırakmak istediğinize emin misiniz?',
  yesButton: 'Evet',
  noButton: 'Hayır',
  warning: 'Uyarı',
  leavedTransfer: ' Transfer başarıyla bırakılmıştır.',
  failed: 'Başarısız!',
  successful: 'Başarılı',
  modalSuccessMessage: 'Mola kullanma talebiniz alınmıştır.',
  modalFinishMessage: 'Mola sonlandırılmıştır. İyi yolculuklar.',
  useBreakTime: 'Mola Kullanımı',
  optionsText: 'Lütfen mola talebinizin sebebini seçin',
  finishBreakTime: 'Molayı Bitir',
  used: 'Kullanıldı',
  startBreakTime: 'Başla',
  usedBreakTimeButton: 'Kullanıldı',
};

const culture_de = {
  ok: 'OK',
  headerTextNotAvailable: 'Ich fahre',
  headerTextAvailable: 'Ich bin verfügbar',
  completed: 'ABGESCHLOSSEN',
  transferType1: 'Einwegtrip',
  transferType2: 'Rundfahrt',
  transferType3: 'Chauffeur',
  transferType4: 'Shuttlebus',
  transfer: 'überweisen',
  distance: 'DISTANZ',
  duration: 'DAUER',
  passenger: 'Passagier',
  payment: 'ZAHLUNG',
  start1: 'Start',
  finish: 'Beenden',
  amount: 'Menge',
  driverNote: 'Fahrerhinweis',
  addAdditionalService: 'Zusätzlichen Service hinzufügen',
  dropTransfer: 'Drop-Transfer',
  company: 'Unternehmen',
  flightCode: 'Flugcode',
  situation: 'Situation',
  note: 'Begrüßungsnotiz',
  startLocation: 'STARTPUNKT',
  endLocation: 'ENDPUNKT',
  pickupLocation: 'EINSTIEGSPUNKT',
  dropLocation: 'LANDEPUNKT',
  waypointLocation: 'WEGPUNKT',
  waypointSingle: 'Haltestelle',
  waypointMulti: 'Haltestellen',
  trackingLink: 'Tracking-Link Senden',
  more: 'Mehr',
  allTransfers: 'Alle überweisungen',
  waiting: 'Warten auf die Bestätigung',
  completedTransfers: 'Bevorstehende',
  approve: 'Annehmen',
  deny: 'Ablehnen',
  canceled: 'Abgesagt',
  noshow: 'Kam nicht',
  willBegin: 'Wird beginnen',
  hasCompleted: 'Abgeschlossen',
  boarded: 'Passagiere stiegen ein',
  departed: 'Passagiere stiegen aus',
  arrived: 'Haltestelle erreicht',
  late: 'Verspätet',
  started: 'Gestartet',
  passengerRecieved: 'Passagier genommen',
  notCompleted: 'Nicht vollständig',
  start: 'Losfahren',
  continue: 'Fahr weiter',
  sendFollowLink: "Follow-Link Senden",
  show: 'ZEIGEN',
  noUetds: 'Kein UETDS-Zertifikat',
  uetds: 'UETDS-Zertifikat haben',
  create: 'ERSTELLEN',
  startDriving: 'Losfahren',
  startDrivingText: 'Beginnen Sie mit dem Fahren als erster Schritt',
  finishDrivingText: 'Beenden Sie die Fahrt',
  navigate: 'Route berechnen',
  finishWork: 'Fertig',
  passengerSuccess: 'Herzliche Glückwünsche! Sie haben die Adresse erreicht und der Beifahrer ist in Ihr Fahrzeug eingestiegen. Bitte fahren Sie mit dem nächsten Schritt fort.',
  passengerDropSuccess: 'Herzliche Glückwünsche! Sie haben die Adresse erreicht und der Beifahrer ist aus Ihrem Fahrzeug ausgestiegen. Bitte fahren Sie mit dem nächsten Schritt fort.',
  waypointSuccess: 'Herzliche Glückwünsche! Sie haben die Adresse erreicht. Bitte fahren Sie mit dem nächsten Schritt fort.',
  completeMessage: 'Herzliche Glückwünsche! Sie haben die Fahrt abgeschlossen. Bitte überprüfen Sie die für Sie verfügbaren alternativen Fahrten.',
  undo: 'Aktion rückgängig machen',
  locationPermissionTitle: 'vitaDrive Transfer fragt Ihren Standort ab',
  locationPermissionText: 'vitaDrive Transfer fordert Ihren Standort an, um Ihre Fahrleistung und Distanz zu verfolgen, die Sie für die Fahrten zurücklegen, die wir senden, wenn die App im Hintergrund läuft',
  foregroundPermissionText: 'Um vitaDrive Transfer gesünder nutzen zu können, erlauben Sie bitte immer Ortungsdienste im Einstellungsbereich Ihres Geräts.',
  locationPermissionButton: 'Immer zulassen',
  foregroundPermissionButton: 'Fertig',
  usingLocationTitle: 'vitaDrive Transfer läuft im Hintergrund',
  usingLocationSubTitle: 'Wir tracken Ihren Standort in Echtzeit.',
  delay: 'min Verzögerung',
  timer: 'pünktlich',
  transferLeave: 'Möchten Sie den Transfer wirklich abbrechen?',
  yesButton: 'Ja',
  noButton: 'Nein',
  warning: 'Warnung',
  leavedTransfer: 'Die Übertragung wurde erfolgreich abgebrochen.',
  failed: 'Fehlgeschlagen!',
  successful: 'Erfolgreich',
  notBoarded: "Die Passagiere sind nicht angekommen",
  modalSuccessMessage: 'Ihre Pausenanforderung wurde erhalten.',
  modalFinishMessage: 'Die Pause wurde beendet. Gute Fahrt.',
  useBreakTime: 'Pause nutzen',
  optionsText: 'Bitte wählen Sie den Grund für Ihre Pausenanforderung',
  finishBreakTime: 'Pause beenden',
  used: 'Verwendet',
  startBreakTime: 'Starten',
};

const Index = ({ navigation }) => {
  const driverStore = useDriverStore((state) => state);
  const cultureStore = useCultureStore((state) => state);
  const profileStore = useProfileStore((state) => state.refresh)
  const profileStr = useProfileStore((state) => state)
  const workStore = useWorkStore((state) => state);
  const authStore = useAuthStore((state) => state);
  const responseStore = useResponseStore((state) => state)
  const dispatch = useDispatch();
  const isFocused = useIsFocused();

  const culture = cultureStore?.culture;

  const [startDate, setStartDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(startDate);
  const [data, setData] = useState({ workOrderCalendar: [] });
  const [waitingApprovementCount, setWaitingApprovementCount] = useState(0);
  const [breakTimeData, setBreakTimeData] = useState();
  const [dataFetch, setDataFetch] = useState(false);
  const [workOrderData, setWorkOrderData] = useState({ workOrderCalendar: [], workOrderList: [], workOrdersSummary: { completed: 0, total: 0, waitingApprovement: 0 } });
  const [tabStatus, setTabStatus] = useState(1);
  const [timer, setTimer] = useState(true);
  const [breakTimeSuccess, setBreakTimeSuccess] = useState(false)
  const [breakTimeSuccessMessage, setBreakTimeSuccessMessage] = useState("")
  const [scroll, setScroll] = useState(false);
  const [animation, setAnimation] = useState(new Animated.Value(0));

  // Android Specific States
  const [startOfWork, setStartOfWork] = useState(false)
  const [locationPermission, setLocationPermission] = useState(false);
  const [showToast, setShowToast] = useState();
  const breakSheetRefAnd = useRef();

  const cultureResource = useMemo(() => {
    return cultureStore?.culture == 'tr' ? culture_tr : cultureStore?.culture == 'en' ? culture_en : cultureStore?.culture == 'de' ? culture_de : culture_tr;
  }, [cultureStore?.culture]);

  useEffect(() => {
    moment.locale(cultureStore?.culture);
  }, [cultureStore?.culture]);

  const handleSheetChanges = useCallback((index) => {
    if (index === -1) {
      // BottomSheet kapandı
    } else {
      // BottomSheet açıldı
    }
  }, []);

  const renderBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.6}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  useFocusEffect(
    useCallback(() => {
      controlLocationInfo()
      return () => {
      }
    }, [selectedDate.format('YYYY-MM-DD')])
  );

  async function controlLocationInfo() {
    const isGPSEnabled = await Location.hasServicesEnabledAsync();
    if (!isGPSEnabled) {
      profileStr.setCheckLocation(true)
    } else {
      profileStr.setCheckLocation(false)
    }
  }

  const workOrderListCallback = (data) => {
    setData(data);
    setDataFetch(false);
  };

  function handleMomentLocale() {
    moment.locale(cultureStore.culture);
    setStartDate(moment());
    setSelectedDate(moment());
  }

  useEffect(() => {
    handleMomentLocale();
    requestPermissions();
    dispatch(setLoading(false));
    return () => {
      handleMomentLocale();
    }
  }, []);

  const requestPermissions = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        startForegroundUpdate()
        backLoc()
        setLocationPermission(false)
      } else {
        setLocationPermission(true)
      }
    } catch (error) {
    }
  };

  const backLoc = async () => {
    const userId = useAuthStore.getState().loginUser?.id;
    if (!userId) return;
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.BestForNavigation,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: cultureResource.usingLocationTitle,
        notificationBody: cultureResource.usingLocationSubTitle,
        notificationColor: "#RRGGBB",
      }
    });
  };

  const startForegroundUpdate = async () => {
    foregroundSubscription?.remove();
    try {
      foregroundSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 10000,
          showsBackgroundLocationIndicator: true,
          distanceInterval: 2,
          speed: true,
        },
        (location) => {
          const db = getDatabase();
          const userId = useAuthStore.getState().loginUser?.id;
          if (userId) {
            set(ref(db, "locations/" + userId), {
              d: userId + "|" + location.coords.latitude + "|" + location.coords.longitude,
            });
          }
        }
      );
    } catch (error) {
    }
  };

  useEffect(() => {
    return () => {
      if (foregroundSubscription) {
        foregroundSubscription.remove();
      }
      TaskManager.unregisterAllTasksAsync()
    };
  }, []);

  function getWorkOrders() {
    setWorkOrderData({ workOrderCalendar: [], workOrderList: [], workOrdersSummary: { completed: 0, total: 0, waitingApprovement: 0 } });
    dispatch(setLoading(true));
    WorkOrder.GetWorkOrders(selectedDate.format('YYYY-MM-DD'), cultureStore.culture).then(response => {
      console.log(response.data)
      if (response.status == 200) {
        if (response.data.responseCode == 200) {
          dispatch(setLoading(false));
          driverStore.setAvailable(response.data.data.available)
          setWorkOrderData(response.data.data);
          workStore.setWorkData(response.data.data)
        } else if (response.data.ResponseCode == 401) {
          responseStore.setRes401(true)
          responseStore.setResMessage(response.data.ResponseMessage)
          dispatch(setLoading(false));
        }
        else {
          dispatch(setHasError(true));
          dispatch(setErrorMessage(response.data.responseMessage));
          dispatch(setLoading(false));
        }
      }
      else {
        dispatch(setHasError(true));
        dispatch(setErrorMessage(culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : culture == 'en' ? 'An unexpected error occured. Please try again later.' : culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
        dispatch(setLoading(false));
      }
    }).catch((error) => {
    })
  }

  useEffect(() => {
    getWorkOrders()
  }, [selectedDate.format('YYYY-MM-DD')])

  useEffect(() => {
    if (profileStore == true) {
      getWorkOrders()
    }
  }, [profileStore])

  useEffect(() => {
    const db = getDatabase();
    const auth = getAuth();
    const userId = useAuthStore.getState().loginUser?.id;
    if (!userId) return;
    const workOrderListChange = ref(db, 'workOrders/' + userId);
    if (isFocused) {
      getWorkOrders();
      onValue(workOrderListChange, (snapshot) => {
        const data = snapshot.val();
        if (data != null) {
          getWorkOrders();
          remove(workOrderListChange);
        }
      });
    }
    return () => {
      off(workOrderListChange, "value");
    };
  }, [navigation, isFocused]);

  function toggleSwitch() {
    dispatch(setLoading(true));
    ChangeAvailableStatus.Get(cultureStore?.culture).then(response => {
      if (response.status == 200) {
        if (response.data.responseCode == 200) {
          dispatch(setLoading(false));
          setBreakTimeData(response.data.data)
          breakSheetRefAnd?.current?.present()
        } else if (response.data.ResponseCode == 401) {
          responseStore.setRes401(true)
          responseStore.setResMessage(response.data.ResponseMessage)
          dispatch(setLoading(false));
        }
        else {
          dispatch(setHasError(true));
          dispatch(setErrorMessage(response.data.responseMessage));
          dispatch(setLoading(false));
        }
      }
      else {
        dispatch(setHasError(true));
        dispatch(setErrorMessage(culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : culture == 'en' ? 'An unexpected error occured. Please try again later.' : culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
        dispatch(setLoading(false));
      }
    }).catch((error) => {
      dispatch(setHasError(true));
      dispatch(setErrorMessage(cultureStore?.culture == 'tr' ? 'Bağlantı hatası: Ayarlar yüklenemedi.' : 'Connection error: Settings could not be loaded.'));
      dispatch(setLoading(false));
    })
  }

  function changeDriverStatus(id) {
    let request = {
      statusType: id,
    }
    breakSheetRefAnd?.current?.dismiss()
    ChangeDriverStatus_Async.Get(request, cultureStore?.culture).then(response => {
      if (response.status == 200) {
        if (response.data.responseCode == 200) {
          getWorkOrders()
          dispatch(setLoading(false));
          setStartOfWork(true)
          setTimeout(() => {
            setStartOfWork(false);
          }, 1000);
        } else if (response.data.ResponseCode == 401) {
          responseStore.setRes401(true)
          responseStore.setResMessage(response.data.ResponseMessage)
          dispatch(setLoading(false));
        }
        else {
          dispatch(setHasError(true));
          dispatch(setErrorMessage(response.data.responseMessage));
          dispatch(setLoading(false));
        }
      }
      else {
        dispatch(setHasError(true));
        dispatch(setErrorMessage(culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : culture == 'en' ? 'An unexpected error occured. Please try again later.' : culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
        dispatch(setLoading(false));
      }
    }).catch((error) => {
    })
  }

  function cancelBreakStatus(id) {
    breakSheetRefAnd.current.dismiss()
    let request = {
      statusType: id,
    }
    CancelBreakStatus.Post(request, cultureStore?.culture).then(response => {
      if (response.status == 200) {
        if (response.data.responseCode == 200) {
          console.log('sadburayadasdasdasdasdsısı', response.data)
          setStartOfWork(true)
          setTimeout(() => {
            setStartOfWork(false);
          }, 1000);
          getWorkOrders()
        } else if (response.data.ResponseCode == 401) {
          responseStore.setRes401(true)
          responseStore.setResMessage(response.data.ResponseMessage)
          dispatch(setLoading(false));
        }
        else {
          dispatch(setHasError(true));
          dispatch(setErrorMessage(response.data.responseMessage));
          dispatch(setLoading(false));
        }
      }
      else {
        dispatch(setHasError(true));
        dispatch(setErrorMessage(culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : culture == 'en' ? 'An unexpected error occured. Please try again later.' : culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
        dispatch(setLoading(false));
      }
    }).catch((error) => {
      console.log('asdasd', error)
    })
  }

  function alertClose() {
    setBreakTimeSuccess(false)
    setBreakTimeSuccessMessage('')
  }

  function closeBottomSheet() {
    breakSheetRefAnd?.current?.dismiss();
  }
  console.log('asada', workOrderData)

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Tab değişince BottomSheet'i kapat — aksi halde ekran kayar
        breakSheetRefAnd?.current?.dismiss();
      };
    }, [])
  );

  return (
    <>
        <View style={[styles.container, (workOrderData.currentStatus == -2 ? { backgroundColor: Color.headerGrey, paddingTop: 30 } : { backgroundColor: Color.dark, paddingTop: 30 })]}>
          <SafeAreaView style={[(workOrderData.currentStatus == -2 ? { backgroundColor: Color.headerGrey } : { backgroundColor: Color.dark })]}>
            <View style={[styles.header, (workOrderData.currentStatus == -2 ? { backgroundColor: Color.headerGrey } : { backgroundColor: Color.dark })]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <VText bold style={[{ fontSize: 18 }, (workOrderData.currentStatus == -2 ? { color: Color.black } : { color: Color.white })]}>
                  {workOrderData?.currentStatusText}
                </VText>
                {workOrderData.breakEnd != null && workOrderData.breakEnd != undefined && (
                  <CountDownTimerMenu workOrderData={workOrderData.breakEnd} />
                )}
                {workOrderData?.currentStatus == -3 && (
                  <CounterUp time={workOrderData?.currentStatusDate} />
                )}
              </View>
              <TouchableOpacity style={{ padding: 10, borderRadius: 50, borderWidth: 1, backgroundColor: Color.base, borderColor: Color.darkGrey, zIndex: 100, elevation: 100 }} onPress={() => { toggleSwitch() }}>
                <Ionicons name="settings-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
          <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 150 }}>

            <View style={styles.datePickerContainer}>
              <CalendarStrip
                headerText={selectedDate.format('DD MMMM YYYY')}
                startingDate={startDate}
                selectedDate={selectedDate}
                scrollable
                markedDates={workOrderData.workOrderCalendar}
                style={{ height: 180, paddingTop: 20 }}
                minDayComponentSize={77}
                dayComponentHeight={77}
                calendarHeaderFormat='DD MMMM YYYY'
                calendarColor={Color.white}
                dateNameStyle={{ fontSize: 10, fontFamily: 'Nunito_700Bold', fontWeight: '700', lineHeight: 14, color: Color.greyText, }}
                highlightDateNameStyle={{ fontSize: 10, fontFamily: 'Nunito_700Bold', fontWeight: '700', lineHeight: 14, color: Color.white, }}
                calendarHeaderContainerStyle={{ flexDirection: 'row', alignItems: 'center', paddingLeft: 20, }}
                calendarHeaderStyle={{ alignSelf: 'flex-start', fontSize: 24, paddingLeft: 5, fontFamily: 'Nunito_700Bold', fontWeight: '700' }}
                dateNumberStyle={{ fontSize: 30, fontFamily: 'Nunito_700Bold', fontWeight: '700' }}
                highlightDateNumberStyle={{ fontSize: 30, fontFamily: 'Nunito_700Bold', fontWeight: '700', color: Color.white }}
                dayContainerStyle={{ borderWidth: 1.5, borderRadius: 12, borderColor: Color.greyBorder, height: 77 }}
                highlightDateContainerStyle={{ borderWidth: 1.5, borderRadius: 12, borderColor: Color.purple, height: 77, backgroundColor: Color.purple }}
                iconContainer={{ display: 'none' }}
                scrollToOnSetSelectedDate={false}
                onDateSelected={(date) => {
                  date.locale(cultureStore.culture);
                  setSelectedDate(date);
                }}
              />
            </View>
            <View style={styles.workOrderSummaryContainer}>
              <View style={styles.workOrderSummary}>
                <View style={styles.total}>
                  <Octicons name='dot-fill' color={Color.black} size={18}></Octicons>
                  <VText bold style={{ fontSize: 10, lineHeight: 14, marginLeft: 5 }}>{workOrderData != null ? workOrderData.workOrdersSummary.total : 0} {cultureResource.transfer}</VText>
                </View>
                <View style={styles.completed}>
                  <Octicons name='dot-fill' color={Color.green} size={18}></Octicons>
                  <VText bold style={{ fontSize: 10, lineHeight: 14, marginLeft: 5, color: Color.green }}>{workOrderData != null ? workOrderData.workOrdersSummary.completed : 0} {cultureResource.completed}</VText>
                </View>
              </View>
              <View style={[styles.workOrderProgressContainer]}>
                {workOrderData != null && workOrderData.workOrdersSummary.total > 0 && (
                  <View style={[styles.workOrderProgress, ({ width: (workOrderData.workOrdersSummary.completed / workOrderData.workOrdersSummary.total * 100).toFixed(0) + '%' })]}></View>
                )}
                {workOrderData == null && (
                  <View style={[styles.workOrderProgress, { width: 0 }]}></View>
                )}
              </View>
            </View>
            <View style={styles.tabContainer}>
              <ScrollView horizontal={true} style={styles.tabScrollContainer} showsHorizontalScrollIndicator={false}>
                <TouchableOpacity onPress={() => { setTabStatus(-1) }} style={[styles.tabButton, (tabStatus == -1 ? { borderColor: Color.darkGrey } : { borderColor: Color.greyBorder })]}>
                  <VText bold style={[{ fontSize: 14 }, (tabStatus == -1 ? { color: Color.darkGrey } : { color: Color.greyText })]}>{cultureResource.completedTransfers}</VText>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setTabStatus(0) }} style={[styles.tabButton, (tabStatus == 0 ? { borderColor: Color.darkGrey } : { borderColor: Color.greyBorder })]}>
                  <VText bold style={[{ fontSize: 14 }, (tabStatus == 0 ? { color: Color.darkGrey } : { color: Color.greyText })]}>{cultureResource.waiting}</VText>
                  {workOrderData != null && workOrderData.workOrderList.filter(workorder => {
                    return workorder.isAccepted === 0;
                  }).length > 0 && (
                      <View style={styles.badge}>
                        <VText bold white style={{ fontSize: 10 }}>{workOrderData.workOrderList.filter(workorder => {
                          return workorder.isAccepted === 0;
                        }).length}</VText>
                      </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setTabStatus(1) }} style={[styles.tabButton, (tabStatus == 1 ? { borderColor: Color.darkGrey } : { borderColor: Color.greyBorder })]}>
                  <VText bold style={[{ fontSize: 14 }, (tabStatus == 1 ? { color: Color.darkGrey } : { color: Color.greyText })]}>{cultureResource.allTransfers}</VText>
                </TouchableOpacity>

              </ScrollView>
            </View>
            <View>
              {workOrderData != null && tabStatus === -1 && workOrderData.workOrderList
                .filter(workorder => [0, 2, 3, 4, 6].includes(workorder.status) && workorder.isAccepted === true)
                .map((item, key) => (
                  <WorkOrderCard item={item} key={key} itemKey={key} cultureResource={cultureResource} workOrderData={{ currentStatusDate: workOrderData.currentStatusDate, currentStatusText: workOrderData.currentStatusText, currentStatus: workOrderData.currentStatus }} />
                ))}
              {workOrderData != null && tabStatus == 0 && workOrderData.workOrderList.filter(workorder => {
                return workorder.isAccepted === 0;
              }).length > 0
                && (
                  workOrderData.workOrderList.filter(workorder => {
                    return workorder.isAccepted === 0;
                  }).map((item, key) => (
                    <WorkOrderCard item={item} key={key} itemKey={key} cultureResource={cultureResource} workOrderData={{ currentStatusDate: workOrderData.currentStatusDate, currentStatusText: workOrderData.currentStatusText, currentStatus: workOrderData.currentStatus }}></WorkOrderCard>
                  ))
                )}
              {workOrderData != null && tabStatus == 1 && (
                workOrderData.workOrderList.map((item, key) => (
                  <WorkOrderCard item={item} key={key} itemKey={key} cultureResource={cultureResource} workOrderData={{ currentStatusDate: workOrderData.currentStatusDate, currentStatusText: workOrderData.currentStatusText, currentStatus: workOrderData.currentStatus }}></WorkOrderCard>
                ))
              )}
            </View>
          </ScrollView>
          <StatusBar backgroundColor={workOrderData.currentStatus == -2 ? Color.headerGrey : Color.darkGrey} barStyle={driverStore.available ? 'dark-content' : 'light-content'} />
          <Modal
            animationType="slide"
            transparent={true}
            visible={locationPermission}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <MaterialCommunityIcons name="map-marker-radius" size={60} color={Color.red} />
                <VText bold style={{ marginTop: 20, fontSize: 20 }}>
                  {cultureResource.locationPermissionTitle}
                </VText>
                <VText regular style={{ marginTop: 20 }}>
                  {cultureResource.foregroundPermissionText}
                </VText>
                <VButton primary style={{ paddingHorizontal: 40, paddingVertical: 10, marginTop: 25 }}
                  onPress={() => { requestPermissions() }}>
                  <VText white bold>{cultureResource.foregroundPermissionButton}</VText>
                </VButton>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={startOfWork}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={{ paddingVertical: 10 }}>
                  <FontAwesome name="hourglass-start" size={36} color="black" />
                </View>
                <VText bold>İşlem Başarılı</VText>
              </View>
            </View>
          </Modal>
        </View>

      {/* BottomSheetModal Provider'ın dışında — gesture handler'lar doğru çalışsın */}
      <BottomSheetModal
        ref={breakSheetRefAnd}
        snapPoints={['90%']}
        enablePanDownToClose={true}
        enableContentPanningGesture={true}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        stackBehavior="push"
      >
        <BottomSheetScrollView contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
          <View style={{ flex: 1, }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: Color.greyBorder, paddingHorizontal: 20, paddingVertical: 20 }}>
              <View style={{ flex: 1.2 }}>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 25, paddingVertical: 12 }}>Mesai İşlemleri</Text>
                <Text style={{ fontFamily: 'Nunito_400Regular', fontSize: 15, color: Color.greyText }}>Mesai işlemlerinizi buradan yönetebilirsiniz.</Text>
              </View>
              <View style={{ flex: 0.8, alignItems: 'flex-end' }}>
                <Image source={require('../../../assets/breakTime.png')} style={{ height: 100, width: 100 }} />
              </View>
            </View>
            {(workOrderData.currentStatus == 0) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: Color.greyBorder, paddingHorizontal: 16, paddingVertical: 8, }}>
                <View style={{ flex: 1.2 }}>
                  <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 20, paddingVertical: 8 }}>Mesai Başlangıcı</Text>
                  <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: Color.greyText }}>Mesainizi başlatabilirsiniz.</Text>
                </View>
                <TouchableOpacity onPress={() => { changeDriverStatus(-1) }} style={{ flex: 0.3, alignItems: 'center', padding: 8, borderRadius: 30, backgroundColor: Color.green, flexDirection: 'row', justifyContent: 'center' }}>
                  <Image source={require('../../../assets/play-button.png')} style={{ width: 12, height: 12, marginRight: 3 }} />
                  <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: Color.white }}>{cultureResource.startBreakTime}</Text>
                </TouchableOpacity>
              </View>
            )}
            {(workOrderData.currentStatus != 0) && (
              <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 2, borderBottomColor: Color.greyBorder, paddingHorizontal: 16, paddingVertical: 8, }}>
                <View style={{ flex: 1.2 }}>
                  <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 20, paddingVertical: 8 }}>Mesai Bitiş</Text>
                  <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: Color.greyText }}>Mesainizi bitirebilirsiniz.</Text>
                </View>
                <TouchableOpacity onPress={() => { workOrderData.breakEnd == null ? changeDriverStatus(-2) : setShowToast(true) }} style={{ flex: 0.3, alignItems: 'center', padding: 8, borderRadius: 30, backgroundColor: Color.red, flexDirection: 'row', justifyContent: 'center' }}>
                  <Image source={require('../../../assets/play-button.png')} style={{ width: 12, height: 12, marginRight: 3 }} />
                  <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 14, color: Color.white }}>{cultureResource.finish}</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={{ paddingVertical: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', }}>
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 21, color: Color.greyText }}>Molalar</Text>
            </View>
            {breakTimeData != null && breakTimeData?.map((item, index) => {
              return (
                <BreakTimeBottomPage item={item} key={index} cultureResource={cultureResource} changeDriverStatus={changeDriverStatus} breakEnd={workOrderData.breakEnd} breakSheetRefAnd={breakSheetRefAnd} currentStatusText={workOrderData?.currentStatusText} cancelBreakStatus={cancelBreakStatus} />
              )
            })}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <Portal>
        {breakTimeSuccess == true && (
          <ModalComponent alertClose={alertClose} text={breakTimeSuccessMessage} cultureResource={cultureResource} />
        )}
      </Portal>
      <StatusBar barStyle='dark-content' />
      {showToast && (
        <ToastMessage
          message="Moladayken mesai bitiremezsiniz."
          onHide={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100%',
  },
  body: { flex: 1, height: '100%', backgroundColor: Color.greyBorder },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10
  },
  summaryPassengerTextContainer: { width: 60, alignItems: 'flex-end' },
  summaryPaymentTextContainer: { width: 60, alignItems: 'flex-end' },
  summaryDurationTextContainer: { width: 60, alignItems: 'flex-end' },
  summaryDistanceTextContainer: { width: 60, alignItems: 'flex-end' },
  datePickerContainerTop: {
    position: 'absolute',
    zIndex: 3,
    top: 68,
    height: 0,
    overflow: 'hidden',
    elevation: 3,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  workOrderSummaryContainer: {
    backgroundColor: Color.white,
    paddingHorizontal: 15
  },
  workOrderDetailSummaryContainer: {
    paddingTop: 20
  },
  workOrderSummaryItemContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  workOrderSummaryItemContainer2: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  summaryDistance: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    flex: 1,
    borderColor: Color.greyBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 5
  },
  summaryDistanceLabel: {
    flexDirection: 'row',
    flex: 1
  },
  summaryDuration: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    flex: 1,
    borderColor: Color.greyBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 5
  },
  summaryDurationLabel: {
    flexDirection: 'row',
    flex: 1
  },
  summaryPassenger: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    flex: 1,
    borderColor: Color.greyBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 5
  },
  summaryPassengerLabel: {
    flexDirection: 'row',
    flex: 1
  },
  summaryPayment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    flex: 1,
    borderColor: Color.greyBorder,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 5
  },
  summaryPaymentLabel: {
    flexDirection: 'row',
    flex: 1
  },
  workOrderSummary: {
    flexDirection: 'row',
  },
  completed: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20
  },
  total: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  workOrderProgressContainer: {
    height: 8,
    backgroundColor: Color.greyBorder,
    borderRadius: 100,
    marginBottom: 20,
    marginTop: 10,
  },
  workOrderProgress: {
    backgroundColor: Color.green,
    height: 8,
    borderRadius: 100,
  },
  tabContainer: {
    backgroundColor: Color.greyBorder,
    paddingVertical: 15,
    justifyContent: 'center'
  },
  tabButton: {
    borderRadius: 1000,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Color.white,
    borderWidth: 1,
    borderColor: Color.greyBorder,
    marginRight: 5,
    marginLeft: 5,
    justifyContent: 'center',
    flexDirection: 'row'
  },
  badge: {
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    width: 20,
    height: 20,
    backgroundColor: Color.purple,
    borderRadius: 100
  },
  workOrderContainer: {
    backgroundColor: Color.greyLight,
  },
  workOrder: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    marginBottom: 10,
    backgroundColor: Color.white
  },
  workOrderHeaderContainer: {
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: Color.greyBorder
  },
  workOrderHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  workOrderHeaderImage: {
    width: 40,
    height: undefined,
    aspectRatio: 1,
    borderRadius: 1000,
    resizeMode: 'contain'
  },
  workOrderHeaderTitle: {
    marginLeft: 8
  },
  workOrderHeaderTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2
  },
  workOrderHeaderImageContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 1000,
    borderColor: Color.greyBorder,
  },
  workOrderHeaderDetailsContainer: {
    paddingTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workOrderHeaderDetailsTimeContainer: {
    backgroundColor: Color.darkGrey,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8
  },
  workOrderHeaderDetailsTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Color.greyLight
  },
  workOrderWaypointsContainer: {
    borderWidth: 1,
    borderColor: Color.greyBorder,
    borderRadius: 5,
    paddingHorizontal: 18,
    marginTop: 20
  },
  startContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10
  },
  startIconContainer: {
    width: 30
  },
  startTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  startTitleRowContainer: {
    flex: 1,
  },
  waypointTitleContainer: {
    backgroundColor: Color.darkGrey,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 100
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    elevation: 2,
  },
});
