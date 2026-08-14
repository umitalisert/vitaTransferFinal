import { Modal, StyleSheet, Text, Pressable, View, ScrollView, Platform } from 'react-native';
import React, { useEffect, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { setErrorMessage, setHasError, setLoading } from '../../redux/slices/mainSlice';
import VText from '../../components/VText';
import VButton from '../../components/VButton';
import Color from '../../components/Color';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WorkOrderIndex from './WorkOrder/Index'
import Notification from './Notification/Index'
import Qr from './Qr/Index'
import Invoice from './Invoice/Index'
import Profile from './Profile/Index'
import Colors from '../../components/Color';
import useCultureStore from '../../zustand/CultureStore';
import * as Location from 'expo-location';
import { List, Portal, Provider } from 'react-native-paper';
import BottomSheet, {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetBackdrop,
  BottomSheetScrollView
} from '@gorhom/bottom-sheet';
import { SvgUri } from 'react-native-svg';
import { MaterialIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { useCallback } from 'react';
import { Image, TouchableOpacity, } from 'react-native';
import { Fontisto } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import WorkOrder from '../../services/vita/WorkOrder';
import moment from "moment";
import 'moment/min/locales';
import WorkOrderCard from '../../components/WorkOrderCard';
import useWorkStore from '../../zustand/workStore';
import { Entypo } from '@expo/vector-icons';
import useProfileStore from '../../zustand/ProfileStore';
import useAuthStore from '../../zustand/AuthStore';
import ModalComponent from '../../components/modalComponent';
import useResponseStore from './../../zustand/ResponseStore'
import * as TaskManager from 'expo-task-manager';
const Tab = createBottomTabNavigator();
const Index = () => {
  const insets = useSafeAreaInsets();
  // Android'de Detail ekranına gidip gelince insets yeniden hesaplanıp
  // tab bar kayar. Bu yüzden mount anındaki değeri bir kez sabitliyoruz.
  const stableBottomInset = useRef(Math.max(insets.bottom, 24));
  const responseStore = useResponseStore((state) => state);
  const authStore = useAuthStore((state) => state);

  function alertClose() {
    responseStore.setRes401(false)
    responseStore.setResMessage(null)
    try {
      TaskManager.unregisterAllTasksAsync();
    } catch (error) {

    }
    authStore.logOut();
  }
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.main.loading);
  const cultureStore = useCultureStore((state) => state);
  const workStore = useWorkStore((state) => state.workData);
  // const [workOrderData, setWorkOrderData] = useState();
  const errorMessage = useSelector((state) => state.main.errorMessage);
  const profileStore = useProfileStore((state) => state);
  const hasError = useSelector((state) => state.main.hasError);

  moment.locale(cultureStore.culture);
  const [startDate, setStartDate] = useState(moment());
  const [checkLocation, setCheckLocation] = useState(false);
  const [selectedDate, setSelectedDate] = useState(startDate);
  useEffect(() => {
    setWorkOrderData(workStore)
  }, [workStore])
  const culture_en = {
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
    ok: 'Ok',
    locationTitleModal: "Location Information Unavailable",
    errorMessageLocation: "To ensure the app works correctly, please make sure your location services and internet connection are enabled. Check your device settings and try again."
  }
  const culture_tr = {
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
    sendFollowLink: 'Takip Linki Gönder',
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
    ok: 'Tamam',
    locationTitleModal: "Konum Bilgisi Alınamıyor",
    errorMessageLocation: "Uygulamanın düzgün çalışabilmesi için konum servislerinin ve internet bağlantınızın açık olması gerekir. Lütfen telefonunuzun ayarlarını kontrol edin ve yeniden deneyin.",

  }
  const culture_de = {
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
    ok: 'Ok',
    locationTitleModal: "Standortinformationen Nicht Verfügbar",
    errorMessageLocation: "Um sicherzustellen, dass die App korrekt funktioniert, stellen Sie bitte sicher, dass Ihre Standortdienste und Ihre Internetverbindung aktiviert sind. Überprüfen Sie die Geräteeinstellungen und versuchen Sie es erneut."
  }
  const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);
  const bottomSheetModalRef = useRef();
  const snapPoints = useMemo(() => ['90%'], []);
  const handleSheetChanges = useCallback((index) => {
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
  const [workOrderData, setWorkOrderData] = useState({ workOrderCalendar: [], workOrderList: [], workOrdersSummary: { completed: 0, total: 0, waitingApprovement: 0 } });
  function getWorkOrders() {
    setWorkOrderData({ workOrderCalendar: [], workOrderList: [], workOrdersSummary: { completed: 0, total: 0, waitingApprovement: 0 } });
    dispatch(setLoading(true));
    WorkOrder.GetWorkOrders(selectedDate.format('YYYY-MM-DD'), cultureStore.culture).then(response => {
      if (response.status == 200) {
        if (response.data.responseCode == 200) {
          dispatch(setLoading(false));
          setWorkOrderData(response.data.data);
        }
        // else {
        //   dispatch(setHasError(true));
        //   dispatch(setErrorMessage(response.data.responseMessage));
        //   dispatch(setLoading(false));
        // }
      }
      else if (response.data.ResponseCode == 401) {
        responseStore.setRes401(true)
        responseStore.setResMessage(response.data.ResponseMessage)
        dispatch(setLoading(false));
      }
      else {
        dispatch(setHasError(true));
        dispatch(setErrorMessage(culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : culture == 'en' ? 'An unexpected error occured. Please try again later.' : culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
        dispatch(setLoading(false));
      }
    });
  }

  useEffect(() => {
    controlLocationInfo()
    return () => {
    }
  }, [profileStore])

  async function controlLocationInfo() {
    const isGPSEnabled = await Location.hasServicesEnabledAsync();
    if (!isGPSEnabled) {
      setCheckLocation(true)
    }
  }

  async function CheckLocationButton() {
    const isGPSEnabled = await Location.hasServicesEnabledAsync();
    if (isGPSEnabled) {
      setCheckLocation(false)
    }
  }

  useEffect(() => {
    getWorkOrders()
  }, [workStore])

  useEffect(() => {
    if (workOrderData != null) {
      workOrderData.workOrderList.filter(workorder => {
        return workorder.isAccepted === 0;
      }).length > 0 && (
          bottomSheetModalRef.current?.present()
        )
    }
  }, [workOrderData])

  useEffect(() => {
    if (profileStore.refresh == true) {
      profileStore.setRefresh(false);
      bottomSheetModalRef.current?.dismiss();
    }
  }, [profileStore.refresh])


  const navigationRef = useRef();
  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={() => {
        const previousRouteName = navigationRef.current.getCurrentRoute().name;
        console.log("Current screen:", previousRouteName);
      }}
    >
      <BottomSheetModalProvider>
        <Provider>
          {(loading == true) && (
            <LottieView
              autoPlay
              pointerEvents="none"
              style={{
                position: 'absolute',
                zIndex: 9999,
                height: 150,
                alignSelf: 'center',
                top: '50%',
                marginTop: -75,
                aspectRatio: 1
              }}
              source={require('../../assets/loading.json')}
            />
          )}

          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'WorkOrder') {
                  iconName = 'home'
                }
                else if (route.name === 'Notification') {
                  iconName = 'bell'
                }
                else if (route.name === 'Qr') {
                  iconName = 'qrcode'
                }
                else if (route.name === 'Invoice') {
                  return <Ionicons name='receipt' size={size} color={color} />;
                }
                else if (route.name === 'Profile') {
                  iconName = 'account'
                }
                return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: Color.darkGrey,
              tabBarShowLabel: false,
              tabBarHideOnKeyboard: false,
              tabBarActiveBackgroundColor: Colors.white,
              tabBarItemStyle: {
                borderRadius: 1000,
                height: 50,
                marginTop: 8,
                marginHorizontal: '2.5%'
              },
              tabBarStyle: {
                position: 'absolute',
                bottom: Platform.OS === 'ios' ? 30 : 34,
                height: 68,
                zIndex: 2,
                backgroundColor: Color.darkGrey,
                borderRadius: 1000,
                marginHorizontal: 20,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              },
            })}
          >
            <Tab.Screen name="WorkOrder" component={WorkOrderIndex} options={{ headerShown: false, unmountOnBlur: true }} />
            <Tab.Screen name="Notification" component={Notification} options={{ headerShown: false }} />
            <Tab.Screen name="Qr" component={Qr} options={{ headerShown: false, unmountOnBlur: true }} />
            <Tab.Screen name="Invoice" component={Invoice} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={Profile} options={{ headerShown: false }} />
          </Tab.Navigator>
          <Modal
            animationType="slide"
            transparent={true}
            visible={hasError}
            onRequestClose={() => { dispatch(setHasError(false)); dispatch(setErrorMessage('')) }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <MaterialCommunityIcons name="alert-circle-outline" size={40} color={Color.red} />
                <VText medium style={{ marginTop: 20 }}>{errorMessage}</VText>
                <VButton secondary style={{ paddingHorizontal: 40, paddingVertical: 10, marginTop: 25 }}
                  onPress={() => { dispatch(setHasError(false)); dispatch(setErrorMessage('')) }}>
                  <VText white bold>{cultureStore.culture == 'tr' ? 'Tamam' : cultureStore.culture == 'en' ? 'OK' : cultureStore.culture == 'de' ? 'OK' : 'Tamam'}</VText>
                </VButton>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={checkLocation}
            onRequestClose={() => { }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Entypo name="location" size={60} color="black" />
                <Text style={{ marginTop: 25, fontSize: 18, textTransform: 'uppercase' }}>{cultureResource.locationTitleModal}</Text>
                <VText medium style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>{cultureResource.errorMessageLocation}</VText>
                <VButton secondary style={{ paddingHorizontal: 40, paddingVertical: 10, marginTop: 25 }}
                  onPress={() => { CheckLocationButton() }}>
                  <VText white bold>{cultureStore.culture == 'tr' ? 'Tamam' : cultureStore.culture == 'en' ? 'OK' : cultureStore.culture == 'de' ? 'OK' : 'Tamam'}</VText>
                </VButton>
              </View>
            </View>
          </Modal>
          {responseStore.res401 == true && (
            <ModalComponent alertClose={alertClose} text={responseStore.resMessage} cultureResource={cultureResource} />
          )}
          <BottomSheetModal
            enableDismissOnClose={true}
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            onChange={handleSheetChanges}
            enableContentPanningGesture={false}
          >
            <BottomSheetScrollView style={{}}>
              <View style={{ flex: 1, paddingBottom: 70 }}>
                {workOrderData != null && workOrderData.workOrderList.filter(workorder => {
                  return workorder.isAccepted === 0;
                }).length > 0
                  && (
                    workOrderData.workOrderList.filter(workorder => {
                      return workorder.isAccepted === 0;
                    }).map((item, key) => {
                      return (
                        <WorkOrderCard item={item} key={key} itemKey={key} cultureResource={cultureResource} />
                      )
                    }
                    )
                  )
                }
              </View>
            </BottomSheetScrollView>
          </BottomSheetModal>
        </Provider>
      </BottomSheetModalProvider>
    </NavigationContainer>
  )
}

export default Index


const styles = StyleSheet.create({
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









  container: {
    flex: 1,

  },


  headerContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10
  },
  headerTitle: {
    flex: 3,
    justifyContent: 'center',
    marginRight: 16,
    marginVertical: 9.5
  },
  headerTitleText: {
    fontSize: 24,
    marginBottom: 10,
    marginRight: 15
  },
  headerBodyText: {
    fontSize: 14,
    paddingRight: 10

  },
  bodyContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 10,
    marginHorizontal: 10,
    padding: 15,
    borderColor: Color.greyBorder

  },
  topContainer: {

    borderBottomWidth: 1,
    borderBottomColor: Color.greyBorder,
    paddingBottom: 15
  },
  transferSummaryHeader: {
    flexDirection: 'row',
  },
  timeContainer: {
    flexDirection: 'row',
    flex: 2,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Color.greyBorder,
    marginRight: 8,
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10
  },
  timeContainerIcon: {
    paddingHorizontal: 13,
    justifyContent: 'center'
  },
  progressPayment: {
    flexDirection: 'row',
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Color.greyBorder,
    padding: 10,
    paddingVertical: 12,
    paddingHorizontal: 10
  },
  progressPaymentIcon: {
    justifyContent: 'center',
    marginRight: 12,

  },
  midContainer: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: Color.greyBorder,
    paddingBottom: 21
  },
  bottomContainer: {
    marginTop: 15,
  },
  transferSummaryBody: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 15,
    alignItems: 'center'
  },
  kmContainer: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    borderColor: Color.greyBorder,
    flex: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginRight: 8,
  },
  minuteContainer: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    borderColor: Color.greyBorder,
    flex: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginRight: 8,
  },
  passengerContainer: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 8,
    borderColor: Color.greyBorder,
    flex: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',

  },
  buttonContainer: {
    flexDirection: 'row',

  },

});

{/*

<View style={styles.container}>
                  <View style={styles.headerContainer}>
                    <View style={styles.headerTitle}>
                      <VText bold style={styles.headerTitleText}>Yeni bir iş teklifi!</VText>
                      <VText medium greyText style={styles.headerBodyText}>Lütfen iş teklifi detaylarını inceledikten sonra cevap verin.</VText>
                    </View>
                    <View style={{ borderWidth: 1, flex: 1 }}>
                    
                      </View>
                      </View>
                      <View style={styles.bodyContainer}>
                        <View style={styles.topContainer}>
                          <View style={styles.transferSummaryHeader}>
                            <View style={styles.timeContainer}>
                              <View style={styles.begining}>
                                <VText bold greyText style={{ fontSize: 12, marginBottom: 6 }}>BAŞLANGIÇ</VText>
                                <VText bold style={{ fontSize: 19 }}>13.30</VText>
                              </View>
                              <View style={styles.timeContainerIcon}>
                                <MaterialIcons name="watch-later" size={16} color="black" />
                              </View>
                              <View style={styles.finish}>
                                <VText bold greyText style={{ marginBottom: 6, fontSize: 11 }}>BİTİŞ</VText>
                                <VText bold style={{ fontSize: 18 }}>14:20</VText>
                              </View>
                            </View>
                            <View style={styles.progressPayment}>
                              <View style={styles.progressPaymentIcon}>
                                <MaterialIcons name="watch-later" size={16} color="black" />
                              </View>
                              <View style={styles.paymentPaymentContainer}>
                                <VText bold greyText style={{ fontSize: 12, marginBottom: 6 }}>HAKEDİŞ</VText>
                                <VText bold style={{ fontSize: 19 }}>125TL</VText>
                              </View>
                            </View>
                          </View>
                          <View style={styles.transferSummaryBody}>
                            <Image source={{ uri: '' }} style={{ height: 32, width: 32, backgroundColor: Color.black, resizeMode: 'contain', borderRadius: 16 }} />
                            <VText bold style={{ fontSize: 15, marginLeft: 8 }}>Beymen Kanyon AVM</VText>
                          </View>
                          <View style={{ flexDirection: 'row', }}>
                            <View style={{ flexDirection: 'row', borderRadius: 16, backgroundColor: Color.greyLight, paddingHorizontal: 8, alignItems: 'center', paddingVertical: 4 }}>
                              <MaterialIcons name="arrow-right-alt" size={18} color="#404C5B" />
                              <VText darkGrey semibold style={{ marginLeft: 5, fontSize: 13, }}>Tek Yön Transfer</VText>
                            </View>
                            <View style={{ flexDirection: 'row', borderRadius: 16, backgroundColor: Color.greyLight, paddingHorizontal: 8, marginLeft: 8, alignItems: 'center', paddingVertical: 4 }}>
                              <MaterialCommunityIcons name="card-bulleted-outline" size={18} color="#404C5B" />
                              <VText semibold darkGrey style={{ marginLeft: 5 }}>Araçta Kartla Ödeme</VText>
                            </View>
                          </View>
                          <View style={styles.transferSummaryFooter}>
                      <View style={styles.transfer}>
                        <MaterialIcons name="arrow-right-alt" size={18} color="#404C5B" />
                        <Text style={styles.transferText}></Text>
                      </View>
                      <View style={styles.paymentPick}>
                        <MaterialIcons name="arrow-right-alt" size={18} color="#404C5B" />
                        <Text style={styles.paymentPickText}></Text>
                      </View>
                    </View>
                        </View>
                        <View style={styles.midContainer}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10, }}>
                            <View style={styles.kmContainer}>
                              <MaterialIcons name="arrow-right-alt" size={16} color={Color.greyText} />
                              <VText style={{ fontSize: 12, marginLeft: 8 }}>1.2KM</VText>
                            </View>
                            <View style={styles.minuteContainer}>
                              <Fontisto name="stopwatch" size={16} color={Color.greyText} />
                              <VText bold style={{ fontSize: 12, marginLeft: 8 }}>30DK</VText>
                            </View>
                            <View style={styles.passengerContainer}>
                              <Ionicons name="person" size={16} color={Color.greyText} />
                              <VText bold style={{ fontSize: 12, marginLeft: 8 }}>2 Yolcu</VText>
                            </View>
                          </View>
                          <View style={{ borderWidth: 1, borderColor: Color.greyBorder, borderRadius: 10, paddingHorizontal: 15, paddingVertical: 16, }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <Ionicons name="triangle-sharp" size={11} color="black" />
                                <View style={{ marginLeft: 10 }}>
                                  <VText bold greyText style={{ fontSize: 12, marginBottom: 7 }}>ALINIŞ NOKTASI</VText>
                                  <VText bold style={{ fontSize: 13, }}>Dereboyu kavaklar açsın yeşil yapraklar</VText>
                                </View>
                              </View>
                              <View style={{ marginLeft: 20 }}>
                                <VText bold style={{ fontSize: 13 }}>13.35</VText>
                              </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <FontAwesome name="stop" size={11} color="black" />
                                <View style={{ marginLeft: 10 }}>
                                  <VText bold greyText style={{ fontSize: 12, marginBottom: 7 }}>BIRAKILIŞ SAATİ</VText>
                                  <VText bold style={{ fontSize: 13 }}>Palanga caddesi Emirhan sokak</VText>
                                </View>
                              </View>
                              <View style={{ marginLeft: 20 }}>
                                <VText bold style={{ fontSize: 13 }}>14:20</VText>
                              </View>
                            </View>
                          </View>
                        </View>
                        <View style={styles.bottomContainer}>
                          <View style={styles.buttonContainer}>
                            <TouchableOpacity style={{ flexDirection: 'row', borderWidth: 1, borderRadius: 30, borderColor: Color.greyBorder, flex: 1, marginRight: 10, justifyContent: 'center', paddingVertical: 14, alignItems: 'center' }} onPress={() => { }}>
                              <AntDesign name="close" size={15} color="red" />
                              <VText semibold red style={{ fontSize: 13, marginLeft: 5 }}>Reddet</VText>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ flexDirection: 'row', borderRadius: 25, flex: 1, backgroundColor: Color.green, justifyContent: 'center', paddingVertical: 14, alignItems: 'center' }} onPress={() => { }}>
                              <AntDesign name="check" size={15} color="white" />
                              <VText semibold white style={{ fontSize: 13, marginLeft: 5 }}>Kabul Et</VText>
                            </TouchableOpacity>
                          </View>
                          <TouchableOpacity style={{ flexDirection: 'row', borderWidth: 1, borderRadius: 30, borderColor: Color.greyBorder, justifyContent: 'center', paddingVertical: 14, marginTop: 10, alignItems: 'center', }} onPress={() => { }}>
                            <Entypo name="dots-three-horizontal" size={13} color="#7162EC" />
                            <VText bold purple style={{ fontSize: 13, marginLeft: 5 }}>Detaylar</VText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                    <SvgUri uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/uedts.svg'></SvgUri>

*/}