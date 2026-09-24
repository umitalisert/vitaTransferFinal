import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Linking, Platform, Modal, TextInput, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState, } from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Color from '../../../components/Color';
import { useDispatch } from 'react-redux'
import VText from '../../../components/VText';
import VButton from '../../../components/VButton';
import WorkOrder from '../../../services/vita/WorkOrder';
import AppLoading from '../../splash/AppLoading';
import { setLoading } from '../../../redux/slices/mainSlice';
import LottieView from 'lottie-react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import useCultureStore from '../../../zustand/CultureStore';
import Auth from '../../../services/vita/Auth';
import { getDatabase, ref, onValue, remove, off } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Fontisto } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons';
import GetWorkOrderPassengerFlightInfo from './../../../services/vita/GetWorkOrderPassengerFlightInfo'
import BottomSheet, { BottomSheetModal, BottomSheetModalProvider, BottomSheetBackdrop, } from '@gorhom/bottom-sheet';
import { useMemo } from 'react';
import { useCallback } from 'react';
import UnAssignDriver from '../../../services/vita/UnAssignDriver';
import useProfileStore from '../../../zustand/ProfileStore';
import useAuthStore from '../../../zustand/AuthStore';
import useResponseStore from '../../../zustand/ResponseStore';
import * as TaskManager from 'expo-task-manager';
import ChangeWaitingStatus from '../../../services/vita/ChangeWaitingStatus';
import CounterUp from '../../../components/CounterUp';
import useWorkStore from '../../../zustand/workStore';
import ToastMessage from '../../../components/ToastMessage';
import OdometerCaptureModal from '../../../components/OdometerCapture';
import Odometer from '../../../services/vita/Odometer';
import CancelBreakStatus from '../../../services/vita/CancelBreakStatus';
import { designName } from 'expo-device';

// ── TASARIM SABITLERI (liste karti ile ayni olcek) ─────────────────────────────
const D = {
  canvas: '#FFFFFF',
  surface: '#F8F9FC',
  hairline: '#ECEEF2',
  border: '#DCE0EA',
  ink900: '#0B0F19',
  ink700: '#404C5B',
  ink500: '#6B7280',
  ink300: '#9AA1AE',
  accent: '#7162EC',
  accentSoft: 'rgba(113,98,236,0.08)',
};

// Durum paleti liste kartiyla birebir ayni kaynaktan beslenir.
const D_DURUM = {
  iptal: { zemin: 'rgba(224,48,36,0.10)', yazi: '#E03024' },
  uyari: { zemin: 'rgba(255,170,29,0.14)', yazi: '#9A6200' },
  tamam: { zemin: 'rgba(28,201,97,0.12)', yazi: '#0F8B44' },
  aktif: { zemin: 'rgba(113,98,236,0.10)', yazi: '#7162EC' },
  notr: { zemin: 'rgba(107,114,128,0.10)', yazi: '#6B7280' },
};

// Eskiden 8 ayri kosullu blok vardi; tek yerde toplandi.
function detayDurumu(status, ck, dateTimeStr) {
  switch (Number(status)) {
    case -3: return { ...D_DURUM.iptal, etiket: ck.canceled, ikon: 'alert-circle-outline' };
    case -2: return { ...D_DURUM.iptal, etiket: ck.noshow, ikon: 'account-alert-outline' };
    case 0: return { ...D_DURUM.aktif, etiket: ck.willBegin, ikon: 'progress-clock' };
    case 1: return { ...D_DURUM.tamam, etiket: ck.hasCompleted, ikon: 'check-circle-outline' };
    case 2: return { ...D_DURUM.uyari, etiket: ck.late, ikon: 'clock-alert-outline' };
    case 3: return { ...D_DURUM.aktif, etiket: ck.started, ikon: 'play-circle-outline' };
    case 4: return { ...D_DURUM.aktif, etiket: ck.passengerRecieved, ikon: 'account-check-outline' };
    case 5: return { ...D_DURUM.iptal, etiket: ck.notCompleted, ikon: 'close-circle-outline' };
    default: return { ...D_DURUM.notr, etiket: dateTimeStr || '', ikon: 'clock-outline' };
  }
}

// Uzak SvgUri istekleri yerine yerel glif (her render'da ag istegi atiyordu).
function detayTipIkonu(transferType) {
  switch (Number(transferType)) {
    case 2: return 'swap-horizontal';
    case 3: return 'steering';
    case 4: return 'bus';
    default: return 'ray-start-arrow';
  }
}

// Adim gorsel durumu. "aktif" = su an basilabilir olan adim; surucu hangi adimda
// oldugunu tek bakista gorsun diye seridi mor yanar.
function adimDurumu({ tamam, red, aktif }) {
  if (red) return { serit: '#E03024', zemin: 'rgba(224,48,36,0.10)', yazi: '#E03024', ikon: 'close' };
  if (tamam) return { serit: '#1CC961', zemin: 'rgba(28,201,97,0.12)', yazi: '#0F8B44', ikon: 'check' };
  if (aktif) return { serit: '#7162EC', zemin: 'rgba(113,98,236,0.10)', yazi: '#7162EC', ikon: 'chevron-right' };
  return { serit: '#DCE0EA', zemin: 'rgba(107,114,128,0.10)', yazi: '#9AA1AE', ikon: 'circle-outline' };
}

const Detail = ({ navigation, route }) => {
    const responseStore = useResponseStore((state) => state)
    const itemKey = route.params.data.itemKey;
    const cultureResource = route.params.data.cultureResource;
    const cultureStore = useCultureStore((state) => state);
    const profileStr = useProfileStore((state) => state);
    const workStore = useWorkStore((state) => state)

    const [item, setItem] = useState();
    const [hiddenSteps, setHiddenSteps] = useState([]);
    const bottomSheetModalRef = useRef();
    const bottomSheetModalPlaneRef = useRef();
    const snapPoints = useMemo(() => ['50%'], []);
    const snapPointsPlane = useMemo(() => ['65%'], []);
    const dispatch = useDispatch();
    const success = useRef(null);
    const [successModal, setSuccessModal] = useState(false);
    const [passengerSuccessModal, setPassengerSuccessModal] = useState(false);
    const [waypointSuccessModal, setWaypointSuccessModal] = useState(false);
    const [planetStatus, setPlanetStatus] = useState(0);
    const [latitude, setLatitude] = useState();
    const [longitude, setLongitude] = useState();
    const [mapModalVisible, setMapModalVisible] = useState(false);
    const [mapLabel, setMapLabel] = useState();
    const [flightData, setFlightData] = useState();
    const [flightModalVisible, setFlightModalVisible] = useState(false);
    const [passengerDropModal, setPassengerDropModal] = useState(false);
    const scrollRef = useRef(null);
    const dataContainerRef = useRef(null);
    const stepContainerRef = useRef(null);
    const [message, setMessage] = useState();
    const [status, setStatus] = useState(0);
    const [change, setChange] = useState(false);
    const [changeWarning, setChangeWarning] = useState(false);
    const [timerStatus, setTimerStatus] = useState(false)
    const [transferDescription, setTransferDescription] = useState(false)
    const [description, setDescription] = useState('')
    const authStore = useAuthStore((state) => state);
    const [transferWait, setTransferWait] = useState(false)
    const [transferWaitMessage, setTransferWaitMessage] = useState('')
    const [keyboardOpen, setKeyboardOpen] = useState(false);
    const [showToast, setShowToast] = useState(false)
    const [odometerVisible, setOdometerVisible] = useState(false);
    const [odometerMode, setOdometerMode] = useState('start');

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', () => {
            setKeyboardOpen(true);
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            setKeyboardOpen(false);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);


    useFocusEffect(
        useCallback(() => {
            controlLocationInfo()
            return () => {
            }
        }, [])
    );

    async function controlLocationInfo() {
        const isGPSEnabled = await Location.hasServicesEnabledAsync();
        if (!isGPSEnabled) {
            profileStr.setCheckLocation(true)
        } else {
            profileStr.setCheckLocation(false)
        }
    }
    function follow(id) {
        let request = {
            id: id
        }
        UnAssignDriver.Post(request, cultureStore.culture).then((response) => {
            if (response.data.responseCode == 200) {
                setStatus(0)
                setChange(!change)
                setMessage(response.data.responseMessage)

                // profileStore.setChange(!profileStore.change)
            }
            else if (response.data.ResponseCode == 401) {
                responseStore.setRes401(true)
                responseStore.setResMessage(response.data.ResponseMessage)
                dispatch(setLoading(false));
            }
            else {
                setStatus(1)
                setChange(!change)
                setMessage(response.data.responseMessage)
                // setChange(!change)
            }
        })
    }
    function flight(x, y) {
        let request = {
            'id': x,
            'nodeId': y,
        }
        GetWorkOrderPassengerFlightInfo.Post(request, cultureStore.culture).then((response => {
            if (response.data.responseCode == 200) {
                setFlightData(response.data.data)
            } else if (response.data.ResponseCode == 401) {
                responseStore.setRes401(true)
                responseStore.setResMessage(response.data.ResponseMessage)
                dispatch(setLoading(false));
            }
        }))
    }
    function openFlightModal(workOrderId, passengerId) {
        GetWorkOrderPassengerFlightInfo.Post({ id: workOrderId, nodeId: passengerId }, cultureStore.culture).then((response) => {
            if (response.data.responseCode == 200) {
                setFlightData(response.data.data);
                setFlightModalVisible(true);
            } else if (response.data.ResponseCode == 401) {
                responseStore.setRes401(true);
                responseStore.setResMessage(response.data.ResponseMessage);
                dispatch(setLoading(false));
            }
        });
    }
    const handleSheetChangesPlane = useCallback((index) => {
    }, []);
    useEffect(() => {
        getWorkOrderDetail();
    }, [])
    useEffect(() => {
        if (successModal) {
            success.current?.play();
        }
        else {
            success.current?.reset();
        }
    }, [successModal]);
    useEffect(() => {
        if (passengerSuccessModal) {
            setTimeout(() => { setPassengerSuccessModal(false) }, 2000)
        }
    }, [passengerSuccessModal]);
    useEffect(() => {
        if (waypointSuccessModal) {
            setTimeout(() => { setWaypointSuccessModal(false) }, 2000)
        }
    }, [waypointSuccessModal]);
    useEffect(() => {
        if (passengerDropModal) {
            setTimeout(() => { setPassengerDropModal(false) }, 2000)
        }
    }, [passengerDropModal]);
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
    function getWorkOrderDetail() {
        WorkOrder.GetWorkOrderDetail(route.params.data.item.id, cultureStore.culture).then(response => {
            if (response.status == 200) {
                if (response.data.responseCode == 200) {
                    dispatch(setLoading(false));
                    setItem(response.data.data);
                }
                else if (response.data.ResponseCode == 401) {
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
                dispatch(setErrorMessage(cultureStore.culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : cultureStore.culture == 'en' ? 'An unexpected error occured. Please try again later.' : cultureStore.culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
                dispatch(setLoading(false));
            }
        });
    }
    function updateWorkOrderStatus(id, type, stepId, step, description, kilometer) {
        dispatch(setLoading(true));
        Location.getLastKnownPositionAsync().then((res) => {
            // Onbellekte konum yoksa null doner (soguk acilis, kapali otopark, izin yeni verilmis).
            const request = {
                id: id,
                type: type,
                stepId: stepId,
                latitude: res?.coords?.latitude ?? 0,
                longitude: res?.coords?.longitude ?? 0,
                description: description
            }
            // Kilometre kendi ucundan gonderiliyor; API bu istekte de bekliyorsa
            // services/vita/Odometer.js icindeki attachToWorkOrderStatus true yapilir.
            if (Odometer.attachToWorkOrderStatus && kilometer != null) {
                request.kilometer = kilometer;
            }
            WorkOrder.UpdateWorkOrderStatus(request, cultureStore.culture).then(response => {
                if (response.status == 200) {
                    if (response.data.responseCode == 200) {

                        if (stepId == 0 && type == 1) {
                            setItem({
                                ...item,
                                isStarted: true,
                                status: 3
                            });
                        }
                        if (stepId == 0 && type == 4) {
                            setItem({
                                ...item,
                                status: 1
                            });
                            setSuccessModal(true);
                        }
                        if (stepId > 0) {
                            const steps = item.steps;
                            const stepIndex = steps.indexOf(step);
                            if (type != -2) {
                                steps[stepIndex].isCompleted = true;
                                setItem({
                                    ...item,
                                    steps: steps,
                                    status: 4
                                });
                            }
                            else {
                                steps[stepIndex].noShow = true;
                                setItem({
                                    ...item,
                                    steps: steps,
                                    status: 4
                                });
                            }
                            if (type == 2) {
                                if (step.items != null) {
                                    if (step.items.length > 0) {
                                        setPassengerSuccessModal(true);
                                    }
                                    else {
                                        setWaypointSuccessModal(true);
                                    }
                                }
                                else {
                                    setWaypointSuccessModal(true);
                                }
                            }
                            if (type == 3) {
                                setPassengerDropModal(true);
                            }
                            if (type == -2) {
                                const steps = item.steps;
                                const currentStepIndex = steps.indexOf(step)
                                const currentStep = steps[currentStepIndex];
                                let relativeSteps = steps.filter((stepData) => {
                                    return stepData.items.filter((stepItem) => {
                                        return stepItem.id == currentStep.items[0].id
                                    }).length > 0 && stepData.id != currentStep.id && currentStep.id > 0
                                })[0]
                                if (relativeSteps != undefined && relativeSteps != null) {
                                    const stepIndex = steps.indexOf(relativeSteps);
                                    steps[stepIndex].hidden = true;
                                    setItem({
                                        ...item,
                                        steps: steps,
                                        status: 4
                                    });
                                }

                            }
                        }
                        dispatch(setLoading(false));
                    } else if (response.data.responseCode == 401) {
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
                    dispatch(setErrorMessage(cultureStore.culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : cultureStore.culture == 'en' ? 'An unexpected error occured. Please try again later.' : cultureStore.culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
                    dispatch(setLoading(false));
                }
            });
        }).catch((error) => {
            // catch yoktu: konum/istek zinciri patlarsa setLoading(false) hic calismiyor ve
            // ekran sonsuz spinner'da kaliyordu.
            console.warn('updateWorkOrderStatus:', error);
            dispatch(setHasError(true));
            dispatch(setErrorMessage(cultureStore.culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : cultureStore.culture == 'en' ? 'An unexpected error occured. Please try again later.' : cultureStore.culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
            dispatch(setLoading(false));
        });

    }
    function removeWorkOrderStatus(id, type, stepId, step) {
        dispatch(setLoading(true));
        const request = {
            id: id,
            type: type,
            stepId: stepId,
            latitude: 0,
            longitude: 0
        }

        WorkOrder.RemoveWorkOrderStatus(request, cultureStore.culture).then(response => {
            if (response.status == 200) {
                if (response.data.responseCode == 200) {
                    if (stepId > 0) {
                        const steps = item.steps;
                        const stepIndex = steps.indexOf(step);
                        steps[stepIndex].isCompleted = false;
                        steps[stepIndex].noShow = false;

                        const currentStep = steps[stepIndex];
                        let relativeSteps = steps.filter((stepData) => {
                            return stepData.items.filter((stepItem) => {
                                return stepItem.id == currentStep.items[0].id
                            }).length > 0 && stepData.id != currentStep.id && currentStep.id > 0
                        })[0]
                        if (relativeSteps != undefined && relativeSteps != null) {
                            const relativeStepIndex = steps.indexOf(relativeSteps);
                            steps[relativeStepIndex].hidden = false;
                        }
                        if (
                            item.steps.filter(step => {
                                return step.isCompleted === true;
                            }).length == 0) {
                            setItem({
                                ...item,
                                steps: steps,
                                status: 3
                            });
                        }
                        else {
                            setItem({
                                ...item,
                                steps: steps,
                            });
                        }


                    }
                    dispatch(setLoading(false));
                }
                else if (response.data.ResponseCode == 401) {
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
                dispatch(setErrorMessage(cultureStore.culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : cultureStore.culture == 'en' ? 'An unexpected error occured. Please try again later.' : cultureStore.culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
                dispatch(setLoading(false));
            }
        });
    }
    const db = getDatabase();
    const auth = getAuth();
    // const workOrderListChange = ref(db, 'workOrders/' + auth.currentUser.uid);
    const workOrderListChange = ref(db, 'workOrders/' + authStore.loginUser.id);
    onValue(workOrderListChange, (snapshot) => {
        const data = snapshot.val();
        if (data != null) {
            if (data.change != null) {
                if (data.change == route.params.data.item.id) {
                    getWorkOrderDetail();
                    remove(workOrderListChange);
                }
            }
        }
    });
    const isFocused = useIsFocused();
    useEffect(() => {
        return () => {
            off(workOrderListChange, "value");
        };
    }, [navigation, isFocused]);
    const openBottomSheet = (lat, lng, label) => {
        setLatitude(lat);
        setLongitude(lng);
        setMapLabel(label);
        setMapModalVisible(true);
    }
    // const openGps = (destination) => {
    //     var url =
    //         Platform.OS === "ios"
    //             ? "maps:?daddr=" + destination + "&dirflg=d"
    //             : "google.navigation:q=" + destination + "&mode=d";
    //     openExternalApp(url);
    // };
    const openGps = (destination) => {
        const url = Platform.select({
            ios: `comgooglemaps://?daddr=${destination}&zoom=14&views=traffic&directionsmode=driving"`,
            android: `geo://?q=${destination}&mode=d`,
        });
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    return Linking.openURL(url);
                } else {
                    'https://www.google.com/maps?saddr=My+Location&daddr=43.12345,-76.12345'
                    const browser_url = `https://www.google.com/maps?saddr=My+Location&daddr=${destination.replace(' ', '')}`;
                    return Linking.openURL(browser_url);
                }
            })
            .catch(() => {
                if (Platform.OS === 'ios') {
                    Linking.openURL(
                        `maps:?daddr=${destination}&mode=d`,
                    );
                }
                else {
                    alert('Lütfen geçerli bir navigasyon uygulaması yükleyin.')
                }
            });
    };
    useEffect(() => {
        navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });
        return () => {
            navigation.getParent()?.setOptions({
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 30 : 34,
                    height: 68,
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
                }
            });
        }
    }, [])

    async function ChangeWaitingStatusFunc(statusType, id) {
        dispatch(setLoading(true));
        let position = null;
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                dispatch(setLoading(false));
                dispatch(setHasError(true));
                dispatch(setErrorMessage(cultureStore.culture == 'tr' ? 'Konum izni verilmedi. Lütfen ayarlardan konum iznini etkinleştirin.' : cultureStore.culture == 'en' ? 'Location permission was not granted. Please enable location permission in settings.' : cultureStore.culture == 'de' ? 'Standortberechtigung wurde nicht erteilt. Bitte aktivieren Sie die Standortberechtigung in den Einstellungen.' : 'Konum izni verilmedi. Lütfen ayarlardan konum iznini etkinleştirin.'));
                return;
            }
            position = await Location.getLastKnownPositionAsync();
            if (!position) {
                position = await Location.getCurrentPositionAsync();
            }
        } catch (error) {
            console.log('ChangeWaitingStatus location', error)
        }
        let request = {
            statusType: statusType,
            id: id,
            latitude: position?.coords?.latitude ?? 0,
            longitude: position?.coords?.longitude ?? 0
        }
        console.log('ChangeWaitingStatus request URL:', ChangeWaitingStatus.rootUrl + 'ChangeWaitingStatus')
        console.log('ChangeWaitingStatus payload:', JSON.stringify(request, null, 2))
        ChangeWaitingStatus.Post(request, cultureStore?.culture).then(response => {
            if (response.status == 200) {
                if (response.data.responseCode == 200) {
                    const newStatus = workStore.workData.currentStatus === -3 ? -4 : -3;
                    workStore.workData.currentStatus = newStatus;
                    if (statusType == -3) {
                        setTransferWait(true)
                        setTransferWaitMessage('Yolcu bekleme süreniz başlamıştır. Anasayfadan takip edebilirsiniz.')
                    }
                    if (statusType == -4) {
                        setTransferWait(true)
                        setTransferWaitMessage('Yolcu bekleme süresi sonlandırılmıştır. İyi Yolculuklar')
                    }
                    dispatch(setLoading(false));

                } else if (response.data.ResponseCode == 401) {
                    // driverStore.setAvailable(!driverStore.available)
                    responseStore.setRes401(true)
                    responseStore.setResMessage(response.data.ResponseMessage)
                    dispatch(setLoading(false));
                }
                else {
                    // driverStore.setAvailable(!driverStore.available)
                    dispatch(setHasError(true));
                    dispatch(setErrorMessage(response.data.responseMessage));
                    dispatch(setLoading(false));
                }
            }
            else {
                // driverStore.setAvailable(!driverStore.available)
                dispatch(setHasError(true));
                dispatch(setErrorMessage(culture == 'tr' ? 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.' : culture == 'en' ? 'An unexpected error occured. Please try again later.' : culture == 'de' ? 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.' : 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.'));
                dispatch(setLoading(false));
            }
        }).catch((error) => {
            console.log('ChangeWaitingStatus', error)
            // driverStore.setAvailable(!driverStore.available)
            dispatch(setLoading(false));
        })
    }

    const openGoogleMaps = (latitude, longitude) => {
        const latLng = `${latitude},${longitude}`;
        const webUrl = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
        if (Platform.OS === 'ios') {
            const appUrl = `comgooglemaps://?q=${latLng}&center=${latLng}&zoom=14`;
            Linking.canOpenURL(appUrl)
                .then((supported) => Linking.openURL(supported ? appUrl : webUrl))
                .catch(err => console.error('Google Maps açılamadı:', err));
        } else {
            Linking.openURL(webUrl).catch(err => console.error('Google Maps açılamadı:', err));
        }
    };
    const openYandexMap = (startLat, startLng, endLat, endLng) => {
        const rtext = `${startLat},${startLng}~${endLat},${endLng}`;
        const appUrl = `yandexmaps://maps.yandex.ru/?rtext=${rtext}&rtt=auto`;
        const webUrl = `https://yandex.com/maps/?rtext=${rtext}&rtt=auto`;
        Linking.canOpenURL(appUrl)
            .then((supported) => Linking.openURL(supported ? appUrl : webUrl))
            .catch((err) => console.error('Yandex Harita açılamadı:', err));
    };
    const openAppleMaps = (latitude, longitude, label) => {
        const latLng = `${latitude},${longitude}`;
        // ll tek başına sadece haritayı ortalar, pin koymaz. Pinin görünmesi için
        // q etiketi zorunlu; etiket yoksa koordinatı etiket olarak kullanıyoruz.
        const pinLabel = encodeURIComponent(label?.trim() || latLng);
        if (Platform.OS === 'ios') {
            const appUrl = `maps://?ll=${latLng}&q=${pinLabel}`;
            const webUrl = `http://maps.apple.com/?ll=${latLng}&q=${pinLabel}`;
            Linking.openURL(appUrl).catch(() => {
                Linking.openURL(webUrl).catch(err => {
                    console.error('Apple Maps açılamadı:', err);
                });
            });
        } else {
            // Android'de Apple Maps yok, alternatif olarak Google Maps açabilirsin:
            const url = `https://www.google.com/maps/search/?api=1&query=${latLng}`;
            Linking.openURL(url).catch(err => {
                console.error('Google Maps açılamadı:', err);
            });
        }
    };

    const getWhatsappPhoneNumber = (phoneNumber) => {
        if (!phoneNumber) return null;
        const cleanedPhone = `${phoneNumber}`.replace(/[^\d]/g, '');
        return cleanedPhone.length > 0 ? cleanedPhone : null;
    };

    const openWhatsApp = async (phoneNumber) => {
        const cleanedPhone = getWhatsappPhoneNumber(phoneNumber);
        const appUrl = cleanedPhone
            ? `whatsapp://send?phone=${cleanedPhone}`
            : `whatsapp://`;
        const webUrl = cleanedPhone
            ? `https://wa.me/${cleanedPhone}`
            : `https://web.whatsapp.com/`;
        if (Platform.OS === 'ios') {
            // iOS uygulama geçişi için onay diyaloğu gösterir ve kullanıcı "Vazgeç"e
            // bastığında openURL reject olur. Bunu "WhatsApp yüklü değil" sanıp web'e
            // düşersek vazgeçmesine rağmen tarayıcı açılır; o yüzden yüklü olup
            // olmadığını önceden canOpenURL ile belirliyoruz.
            const installed = await Linking.canOpenURL(appUrl).catch(() => false);
            if (installed) {
                Linking.openURL(appUrl).catch(() => {
                    // Kullanıcı vazgeçti; başka bir yere yönlendirmiyoruz.
                });
                return;
            }
            Linking.openURL(webUrl).catch((err) => console.error('WhatsApp açılamadı:', err));
            return;
        }
        // Android'de böyle bir onay diyaloğu yok; canOpenURL ise manifest <queries>
        // girdisi gerektirdiğinden burada catch ile web'e düşmeye devam ediyoruz.
        Linking.openURL(appUrl).catch(() =>
            Linking.openURL(webUrl).catch((err) => console.error('WhatsApp açılamadı:', err))
        );
    };
    // Transfer durumunu ilerletir. Odometre akisi calistiysa kilometre de gonderilir,
    // calismadiysa kilometer null gecer ve istege hic eklenmez.
    function transferDurumunuIlerlet(mode, kilometer) {
        if (mode == 'finish') {
            updateWorkOrderStatus(item.id, 4, 0, null, description, kilometer);
            return;
        }
        if (workStore?.workData?.breakEnd != null) {
            cancelBreakStatus();
        }
        updateWorkOrderStatus(item.id, 1, 0, null, null, kilometer);
    }

    // Surus baslangici ve bitisinde arac kilometresi fotografla dogrulanir.
    // Bu akis yalnizca odometre kapsamindaki firmalarda (Odometer.domain) calisir;
    // kapsam disindaki surucu kamerayi hic gormez, dogrudan durum guncellenir.
    function openOdometer(mode) {
        Keyboard.dismiss();

        if (!Odometer.isEnabledForUser()) {
            transferDurumunuIlerlet(mode, null);
            return;
        }

        setOdometerMode(mode);
        setOdometerVisible(true);
    }

    function onOdometerCompleted(result) {
        setOdometerVisible(false);
        transferDurumunuIlerlet(odometerMode, result.kilometer);
    }

    function cancelBreakStatus() {
        let request = {
            statusType: workStore.workData.currentStatus,
        }
        CancelBreakStatus.Post(request, cultureStore?.culture).then(response => {
            if (response.status == 200) {
                if (response.data.responseCode == 200) {
                    setShowToast(true)
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
            // driverStore.setAvailable(!driverStore.available)
        })
    }
    if (item == null) {
        return (
            <AppLoading></AppLoading>
        )
    }
    else {
        const durum = detayDurumu(item.status, cultureResource, item.dateTimeStr);
        const tipMetni = item.transferType == 2 ? cultureResource.transferType2
            : item.transferType == 3 ? cultureResource.transferType3
                : item.transferType == 4 ? cultureResource.transferType4
                    : cultureResource.transferType1;
        const ucretVar = item.priceText != null && item.priceText != '0,00' && item.priceText != '0';

        return (
            <>
                <View style={styles.container}>
                    <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

                        {/* 1 — HARITA + GERI (geri butonu haritanin uzerinde yuzer) */}
                        <View style={styles.mapKap}>
                            <Image style={styles.map} source={{ uri: item.routeImage }} />
                            <View style={styles.mapPerde} />
                            <SafeAreaView style={styles.header}>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                                    onPress={() => { navigation.goBack() }}
                                    style={styles.geriBtn}>
                                    <MaterialCommunityIcons name='arrow-left' size={22} color={D.ink900} />
                                </TouchableOpacity>
                            </SafeAreaView>
                        </View>

                        <View ref={dataContainerRef} style={styles.dataContainer}>
                            <View key={'workOrder' + itemKey} style={styles.workOrder}>

                                {/* 2 — DURUM */}
                                {!!durum.etiket && (
                                    <View style={styles.durumSatir}>
                                        <View style={[styles.rozet, { backgroundColor: durum.zemin }]}>
                                            <MaterialCommunityIcons name={durum.ikon} size={15} color={durum.yazi} />
                                            <VText semiBold numberOfLines={1} style={[styles.rozetMetin, { color: durum.yazi }]}>{durum.etiket}</VText>
                                        </View>
                                    </View>
                                )}

                                {/* 3 — TESIS KIMLIGI */}
                                <View style={styles.tesisSatir}>
                                    <View style={styles.logoKap}>
                                        <Image style={styles.logo} source={{ uri: item.facilityImage }} />
                                    </View>
                                    <View style={styles.tesisMetinKap}>
                                        <VText semiBold numberOfLines={1} style={styles.tesisAdi}>{item.facilityName}</VText>
                                        <View style={styles.tesisAltSatir}>
                                            <MaterialCommunityIcons name={detayTipIkonu(item.transferType)} size={14} color={D.ink300} style={{ marginRight: 5 }} />
                                            <VText regular numberOfLines={1} style={styles.tesisAltMetin}>{tipMetni}</VText>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.ayirici} />

                                {/* 4 — SAAT ARALIGI: noktali metin yerine gercek bag cizgisi */}
                                <View style={styles.saatSatir}>
                                    <View style={styles.saatHucre}>
                                        <VText semiBold numberOfLines={1} style={styles.saatEtiket}>{cultureResource.start1}</VText>
                                        <VText bold numberOfLines={1} style={styles.saatDeger}>{item.dateTimeStr}</VText>
                                    </View>
                                    <View style={styles.saatBag}>
                                        <View style={styles.saatBagCizgi} />
                                        <View style={styles.saatBagIkon}>
                                            <MaterialCommunityIcons name='arrow-right' size={14} color={D.ink300} />
                                        </View>
                                        <View style={styles.saatBagCizgi} />
                                    </View>
                                    <View style={[styles.saatHucre, { alignItems: 'flex-end' }]}>
                                        <VText semiBold numberOfLines={1} style={styles.saatEtiket}>{cultureResource.finish}</VText>
                                        <VText bold numberOfLines={1} style={styles.saatDeger}>{item.endDateTimeStr}</VText>
                                    </View>
                                </View>

                                {/* 5 — KUNYE: sure / mesafe / yolcu */}
                                <View style={styles.kunye}>
                                    <View style={styles.kunyeHucre}>
                                        <VText semiBold numberOfLines={1} style={styles.kunyeEtiket}>{cultureResource.duration}</VText>
                                        <VText bold numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.kunyeDeger}>{item.durationText || '—'}</VText>
                                    </View>
                                    <View style={styles.kunyeAyrac} />
                                    <View style={styles.kunyeHucre}>
                                        <VText semiBold numberOfLines={1} style={styles.kunyeEtiket}>{cultureResource.distance}</VText>
                                        <VText bold numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={styles.kunyeDeger}>{item.distanceText || '—'}</VText>
                                    </View>
                                    <View style={styles.kunyeAyrac} />
                                    <View style={styles.kunyeHucre}>
                                        <VText semiBold numberOfLines={1} style={styles.kunyeEtiket}>{cultureResource.passenger}</VText>
                                        <VText bold numberOfLines={1} style={styles.kunyeDeger}>{item.peopleCount ?? '—'}</VText>
                                    </View>
                                </View>

                                {/* 6 — TUTAR */}
                                {ucretVar && (
                                    <>
                                        <View style={styles.ayirici} />
                                        <View style={styles.ucretSatir}>
                                            <VText semiBold style={styles.ucretEtiket}>{cultureResource.amount}</VText>
                                            <VText bold numberOfLines={1} style={styles.ucretDeger}>{item.currencySymbol} {item.priceText}</VText>
                                        </View>
                                    </>
                                )}

                                {/* 7 — SURUCU NOTU (textTransform yok: Turkce'de i -> I bozulmasin) */}
                                {item.description != null && (
                                    <View style={styles.notKart}>
                                        <View style={styles.notBaslik}>
                                            <MaterialCommunityIcons name='information-outline' size={16} color={D.accent} />
                                            <VText semiBold style={styles.notBaslikMetin}>{cultureResource.driverNote}</VText>
                                        </View>
                                        <VText medium style={styles.notMetin}>{item.description}</VText>
                                    </View>
                                )}

                                {/* 8 — UETDS */}
                                {item.uetds && (
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => { Linking.openURL(item.uetdsUrl) }}
                                        style={styles.uetds}>
                                        <MaterialCommunityIcons name='shield-check-outline' size={18} color={D.ink300} />
                                        <VText semiBold numberOfLines={1} style={styles.uetdsMetin}>{cultureResource.uetds}</VText>
                                        <VText semiBold style={styles.uetdsAksiyon}>{cultureResource.show}</VText>
                                        <MaterialCommunityIcons name='chevron-right' size={18} color={D.ink300} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View ref={stepContainerRef} style={styles.stepContainer}>

                                {/* ADIM 1 — SURUSE BASLA */}
                                {(() => {
                                    const dur = adimDurumu({ tamam: item.isStarted, aktif: !item.isStarted });
                                    return (
                                        <View style={styles.adimSarmal}>
                                            <View style={styles.adimKart}>
                                                <View style={[styles.adimSerit, { backgroundColor: dur.serit }]} />
                                                <View style={styles.adimIcerik}>
                                                    <View style={styles.adimUst}>
                                                        <View style={[styles.adimRozet, { backgroundColor: dur.zemin }]}>
                                                            <MaterialCommunityIcons name={dur.ikon} size={15} color={dur.yazi} />
                                                        </View>
                                                        <View style={styles.adimBaslikKap}>
                                                            <VText semiBold numberOfLines={2} style={styles.adimBaslik}>{cultureResource.startDriving}</VText>
                                                            <VText regular numberOfLines={2} style={styles.adimAciklama}>{cultureResource.startDrivingText}</VText>
                                                        </View>
                                                    </View>
                                                    {!item.isStarted && (
                                                        <TouchableOpacity
                                                            activeOpacity={0.8}
                                                            onPress={() => { openOdometer('start') }}
                                                            style={[styles.adimBtn, styles.adimBtnBirincil]}>
                                                            <MaterialCommunityIcons name='play' size={19} color={D.canvas} />
                                                            <VText semiBold style={styles.adimBtnBirincilMetin}>{cultureResource.start}</VText>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                            <View style={styles.adimBag} />
                                        </View>
                                    );
                                })()}

                                {/* ARA ADIMLAR */}
                                {item != null && item.steps != null && (
                                    item.steps.map((step, stepKey) => {
                                        if (step.hidden == true) {
                                            return (<View key={'step' + stepKey}></View>)
                                        }

                                        // Buton etiketi iki dalda da ayni; tek yerden turetiliyor.
                                        const tamamlaEtiketi = step.items.length > 0 && step.boardingType == false
                                            ? cultureResource.boarded
                                            : step.items.length > 0 && step.boardingType == true
                                                ? cultureResource.departed
                                                : step.items.length == 0
                                                    ? cultureResource.arrived
                                                    : cultureResource.hasCompleted;
                                        const adresEtiketi = step.addressType == 0
                                            ? cultureResource.pickupLocation
                                            : step.addressType == 1
                                                ? cultureResource.waypointLocation
                                                : cultureResource.dropLocation;
                                        const bitti = step.isCompleted || step.noShow;

                                        const dur = adimDurumu({ tamam: step.isCompleted, red: step.noShow, aktif: !bitti && item.isStarted });

                                        return (
                                            <View key={'step' + stepKey} style={styles.adimSarmal}>
                                                <View style={[styles.adimKart, bitti && styles.adimKartSolgun]}>
                                                    <View style={[styles.adimSerit, { backgroundColor: dur.serit }]} />
                                                    <View style={styles.adimIcerik}>
                                                    <View style={styles.adimUst}>
                                                        <View style={[styles.adimRozet, { backgroundColor: dur.zemin }]}>
                                                            <MaterialCommunityIcons name={dur.ikon} size={15} color={dur.yazi} />
                                                        </View>
                                                        <View style={styles.adimBaslikKap}>
                                                            <VText semiBold numberOfLines={2} style={styles.adimBaslik}>{step.title}</VText>
                                                        </View>
                                                    </View>

                                                    {step.address != null && (
                                                        <View style={styles.adresBlok}>
                                                            <View style={styles.adresUst}>
                                                                <MaterialCommunityIcons
                                                                    name={step.addressType == 0 ? 'circle-slice-8' : step.addressType == 1 ? 'circle-outline' : 'square-rounded'}
                                                                    color={step.addressType == 0 ? D.accent : D.ink300}
                                                                    size={13} />
                                                                <VText semiBold numberOfLines={1} style={styles.adresEtiket}>{adresEtiketi}</VText>
                                                                {!!step.time && (
                                                                    <VText bold numberOfLines={1} style={styles.adresSaat}>{step.time}</VText>
                                                                )}
                                                            </View>
                                                            <VText medium numberOfLines={5} style={styles.adresMetin}>{step.address}</VText>

                                                            {(step.addressType == 0 || step.addressType == 2) && (
                                                                (() => {
                                                                    const whatsappPassenger = step.items?.find((passenger) => getWhatsappPhoneNumber(passenger.phoneNumber));
                                                                    const whatsappPhoneNumber = whatsappPassenger?.phoneNumber;
                                                                    const whatsappEnabled = !!getWhatsappPhoneNumber(whatsappPhoneNumber);
                                                                    if (!whatsappEnabled) return null;
                                                                    return (
                                                                        <TouchableOpacity
                                                                            activeOpacity={0.8}
                                                                            onPress={() => { openWhatsApp(whatsappPhoneNumber) }}
                                                                            style={styles.konumPaylas}>
                                                                            <FontAwesome name='whatsapp' size={15} color={'#0F8B44'} />
                                                                            <VText semiBold style={styles.konumPaylasMetin}>{cultureResource.sendFollowLink}</VText>
                                                                        </TouchableOpacity>
                                                                    );
                                                                })()
                                                            )}
                                                        </View>
                                                    )}

                                                    {step.items != null && step.items.length > 0 && (
                                                        <View style={styles.yolcuListe}>
                                                            {step.items.map((passenger, passengerKey) => (
                                                                <View key={'stepItems' + passengerKey} style={styles.yolcuSatir}>
                                                                    <View style={styles.yolcuKimlik}>
                                                                        <Image key={'stepItemsImage' + passengerKey} style={styles.yolcuFoto} source={{ uri: passenger.imagePath }} />
                                                                        <VText semiBold numberOfLines={1} style={styles.yolcuAd}>{passenger.fullName}</VText>
                                                                    </View>
                                                                    {/* Aksiyonlar kendi satirinda: her buton esit paya sahip (flex:1),
                                                                        44pt yuksekliginde ve aralarinda 8px bosluk var. Once tek satirda
                                                                        36px'lik butonlar 6px araliklarla dizildigi icin yanlis dokunma oluyordu. */}
                                                                    <View style={styles.yolcuAksiyonlar}>
                                                                        {passenger.showFlightBtn && (
                                                                            <TouchableOpacity
                                                                                activeOpacity={0.7}
                                                                                onPress={() => { openFlightModal(item.id, passenger.id) }}
                                                                                style={styles.aksiyonBtn}>
                                                                                <FontAwesome name='plane' size={16} color={D.accent} />
                                                                            </TouchableOpacity>
                                                                        )}
                                                                        <TouchableOpacity
                                                                            activeOpacity={0.7}
                                                                            onPress={() => { openBottomSheet(step.location.latitude, step.location.longitude, adresEtiketi) }}
                                                                            style={styles.aksiyonBtn}>
                                                                            <FontAwesome5 name='location-arrow' size={15} color={D.accent} />
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity
                                                                            activeOpacity={0.7}
                                                                            onPress={() => { openWhatsApp(passenger.phoneNumber) }}
                                                                            style={[styles.aksiyonBtn, styles.aksiyonBtnYesil]}>
                                                                            <FontAwesome name='whatsapp' size={19} color={'#0F8B44'} />
                                                                        </TouchableOpacity>
                                                                        {passenger.showCallBtn && (
                                                                            <TouchableOpacity
                                                                                activeOpacity={0.7}
                                                                                onPress={() => {
                                                                                    const rawPhone = `${passenger.phoneNumber}`.replace(/[^\d]/g, '');
                                                                                    if (rawPhone) Linking.openURL(`tel:+${rawPhone}`);
                                                                                }}
                                                                                style={styles.aksiyonBtn}>
                                                                                <MaterialCommunityIcons name='phone' size={18} color={D.accent} />
                                                                            </TouchableOpacity>
                                                                        )}
                                                                    </View>
                                                                </View>
                                                            ))}
                                                        </View>
                                                    )}

                                                    {!step.isCompleted && !step.noShow && (
                                                        <View key={'stepAction' + stepKey}>
                                                            <TouchableOpacity
                                                                activeOpacity={item.isStarted ? 0.8 : 1}
                                                                disabled={!item.isStarted}
                                                                onPress={() => {
                                                                    step.items.length > 0 && step.boardingType == false
                                                                        ?
                                                                        (ChangeWaitingStatusFunc(-4, item.id),
                                                                            updateWorkOrderStatus(item.id, step.boardingType == false ? 2 : 3, step.id, step))
                                                                        :
                                                                        updateWorkOrderStatus(item.id, step.boardingType == false ? 2 : 3, step.id, step)
                                                                }}
                                                                style={[styles.adimBtn, item.isStarted ? styles.adimBtnBirincil : styles.adimBtnPasif]}>
                                                                <MaterialCommunityIcons name='check' size={19} color={item.isStarted ? D.canvas : D.ink300} />
                                                                <VText semiBold numberOfLines={1} style={item.isStarted ? styles.adimBtnBirincilMetin : styles.adimBtnPasifMetin}>{tamamlaEtiketi}</VText>
                                                            </TouchableOpacity>

                                                            {step.boardingType == false && step.items.length > 0 && (
                                                                <TouchableOpacity
                                                                    activeOpacity={item.isStarted ? 0.8 : 1}
                                                                    disabled={!item.isStarted}
                                                                    onPress={() => { updateWorkOrderStatus(item.id, -2, step.id, step) }}
                                                                    style={[styles.adimBtn, item.isStarted ? styles.adimBtnTehlike : styles.adimBtnPasif]}>
                                                                    <MaterialCommunityIcons name='close' size={19} color={item.isStarted ? '#E03024' : D.ink300} />
                                                                    <VText semiBold numberOfLines={1} style={item.isStarted ? styles.adimBtnTehlikeMetin : styles.adimBtnPasifMetin}>{cultureResource.notBoarded}</VText>
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    )}

                                                    {bitti && (
                                                        <View key={'stepAction' + stepKey}>
                                                            <TouchableOpacity
                                                                activeOpacity={0.8}
                                                                onPress={() => { removeWorkOrderStatus(item.id, step.boardingType == false ? (step.noShow ? -2 : 2) : 3, step.id, step) }}
                                                                style={[styles.adimBtn, styles.adimBtnIkincil]}>
                                                                <MaterialCommunityIcons name='undo-variant' size={19} color={D.ink700} />
                                                                <VText semiBold numberOfLines={1} style={styles.adimBtnIkincilMetin}>{cultureResource.undo}</VText>
                                                            </TouchableOpacity>
                                                        </View>
                                                    )}
                                                    </View>
                                                </View>
                                                <View style={styles.adimBag} />
                                            </View>
                                        )
                                    })
                                )}

                                {/* SON ADIM — SURUSU BITIR */}
                                {(() => {
                                    const bitirilebilir = item.isStarted && item.steps.filter(step => (step.isCompleted == true || step.noShow == true)).length > 0;
                                    const dur = adimDurumu({ tamam: item.status == 1, aktif: bitirilebilir });
                                    return (
                                        <View style={styles.adimKart}>
                                            <View style={[styles.adimSerit, { backgroundColor: dur.serit }]} />
                                            <View style={styles.adimIcerik}>
                                                <View style={styles.adimUst}>
                                                    <View style={[styles.adimRozet, { backgroundColor: dur.zemin }]}>
                                                        <MaterialCommunityIcons name={dur.ikon} size={15} color={dur.yazi} />
                                                    </View>
                                                    <View style={styles.adimBaslikKap}>
                                                        <VText semiBold numberOfLines={2} style={styles.adimBaslik}>{cultureResource.finishWork}</VText>
                                                        <VText regular numberOfLines={2} style={styles.adimAciklama}>{cultureResource.finishDrivingText}</VText>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    activeOpacity={bitirilebilir ? 0.8 : 1}
                                                    disabled={!bitirilebilir}
                                                    onPress={() => { setTransferDescription(true) }}
                                                    style={[styles.adimBtn, bitirilebilir ? styles.adimBtnBirincil : styles.adimBtnPasif]}>
                                                    <MaterialCommunityIcons name='flag-checkered' size={19} color={bitirilebilir ? D.canvas : D.ink300} />
                                                    <VText semiBold numberOfLines={1} style={bitirilebilir ? styles.adimBtnBirincilMetin : styles.adimBtnPasifMetin}>{cultureResource.finishWork}</VText>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    );
                                })()}
                            </View>
                        </View>

                        {/* TRANSFERI BIRAK */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => { setChangeWarning(true) }}
                            style={styles.birakBtn}>
                            <MaterialCommunityIcons name='exit-to-app' size={17} color={'#E03024'} />
                            <VText semiBold style={styles.birakMetin}>{cultureResource.dropTransfer}</VText>
                        </TouchableOpacity>
                    </ScrollView >
                    {item?.isStarted && (
                        <TouchableOpacity onPress={() => { (workStore.workData.currentStatus == -3) ? ChangeWaitingStatusFunc(-4, item.id) : ChangeWaitingStatusFunc(-3, item.id) }} style={{ position: 'absolute', zIndex: 1, bottom: 90, right: 20, borderRadius: 50, backgroundColor: Color.yellow, padding: 10 }}>
                            {workStore.workData.currentStatus == -3 && (
                                <View style={{}}>
                                    <MaterialCommunityIcons name="timer-off-outline" size={36} color="white" />
                                </View>
                            )}
                            {workStore.workData.currentStatus != -3 && (
                                <View style={{}}>
                                    <MaterialCommunityIcons name="timer-outline" size={36} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                    )
                    }
                    {
                        transferWait && (
                            <ToastMessage
                                message={transferWaitMessage}
                                onHide={() => setTransferWait(false)}
                            />
                        )
                    }
                    {
                        showToast && (
                            <ToastMessage
                                message={'Sürüşe başladığınız için molanız sonlandırılmıştır.'}
                                onHide={() => setShowToast(false)}
                            />
                        )
                    }
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={successModal}
                    // onRequestClose={() => { dispatch(setHasError(false)); dispatch(setErrorMessage('')) }}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <LottieView
                                    ref={success}
                                    loop={false}
                                    speed={1}
                                    onAnimationFinish={() => {
                                        setSuccessModal(false);
                                        setTimeout(() => { navigation.goBack() }, 500);
                                    }}
                                    style={{
                                        height: 200,
                                        alignSelf: 'center',
                                        elevation: 5,
                                        aspectRatio: 1
                                    }}
                                    source={require('../../../assets/success.json')}
                                />
                                <VText bold>{cultureResource.completeMessage}</VText>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={passengerSuccessModal}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <MaterialCommunityIcons name='account-check-outline' size={180} color={Color.primary}></MaterialCommunityIcons>
                                <VText bold>{cultureResource.passengerSuccess}</VText>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={waypointSuccessModal}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <MaterialCommunityIcons name='map-marker-path' size={180} color={Color.primary}></MaterialCommunityIcons>
                                <VText bold>{cultureResource.waypointSuccess}</VText>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={passengerDropModal}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <MaterialCommunityIcons name='account-check-outline' size={180} color={Color.primary}></MaterialCommunityIcons>
                                <VText bold>{cultureResource.passengerDropSuccess}</VText>
                            </View>
                        </View>
                    </Modal>


                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={changeWarning}
                        onRequestClose={() => { }}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                            <View style={styles.modalView}>
                                <AntDesign name="warning" size={60} color="yellow" />
                                <VText bold style={{ marginTop: 20, fontSize: 20 }}>{cultureResource.warning}
                                </VText>
                                <VText semibold style={{ marginTop: 20, fontSize: 16, textAlign: 'center' }}>
                                    {cultureResource.transferLeave}
                                </VText>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', }}>
                                    <VButton primary style={{ paddingVertical: 10, marginTop: 25, flex: 0.5, marginRight: 5 }}
                                        onPress={() => { setChangeWarning(!changeWarning), follow(item.id) }}>
                                        <VText white bold>{cultureResource.yesButton}</VText>
                                    </VButton>
                                    <VButton primary style={{ paddingVertical: 10, marginTop: 25, flex: 0.5 }}
                                        onPress={() => { setChangeWarning(!changeWarning) }}>
                                        <VText white bold>{cultureResource.noButton}</VText>
                                    </VButton>
                                </View>
                            </View>
                        </View>
                    </Modal>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={change}
                        onRequestClose={() => { }}>
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                            <View style={styles.modalView}>
                                {status == 0 && (
                                    <AntDesign name="check" size={60} color="green" />
                                )}
                                {status == 1 && (
                                    <AntDesign name="close" size={60} color="red" />
                                )}
                                {status == 0 && (
                                    <VText bold style={{ marginTop: 20, fontSize: 20 }}>{cultureResource.successful}</VText>
                                )}
                                {status == 1 && (
                                    <VText bold style={{ marginTop: 20, fontSize: 20 }}>{cultureResource.failed}</VText>
                                )}
                                {status == 0 && (
                                    <VText semibold style={{ marginTop: 20, fontSize: 16, textAlign: 'center' }}>{cultureResource.leavedTransfer}

                                    </VText>
                                )}
                                {status == 1 && (
                                    <VText semibold style={{ marginTop: 20, fontSize: 16, textAlign: 'center' }}>
                                        {message}
                                    </VText>
                                )}
                                <VButton primary style={{ paddingVertical: 10, marginTop: 10, paddingHorizontal: 40 }}
                                    onPress={() => { setChange(!change), navigation.goBack() }}>
                                    <VText white bold>{cultureResource.yesButton}</VText>
                                </VButton>

                            </View>
                        </View>

                    </Modal>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={transferDescription}
                        onRequestClose={() => { }}>
                        <View style={keyboardOpen ? { flex: 1, paddingTop: 50, backgroundColor: 'rgba(33, 33, 33, 0.5)' } : { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(33, 33, 33, 0.5)' }}>
                            <View style={{ backgroundColor: Color.white, marginHorizontal: 16, borderRadius: 10, paddingVertical: 16, paddingHorizontal: 16 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16 }}>
                                    {/* <Entypo name="info" size={24} color={Color.green} /> */}
                                    <Text style={{ fontSize: 16, fontWeight: 470 }}>Transfer hakkında açıklama yapmak ister misiniz?</Text>
                                </View>
                                <TextInput
                                    style={{
                                        height: 120,
                                        borderColor: '#ccc',
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        padding: 10,
                                        textAlignVertical: 'top',
                                        backgroundColor: 'rgba(0,0,0,0.05)',
                                        color: '#000',

                                    }}
                                    placeholder="Açıklama giriniz..."
                                    placeholderTextColor="#999"
                                    multiline
                                    maxLength={200}
                                    value={description}
                                    onChangeText={setDescription}
                                />

                                <VButton onPress={() => {
                                    setTransferDescription(false);
                                    openOdometer('finish');
                                }} primary style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                                    <MaterialCommunityIcons name='check' size={24} color={Color.white}></MaterialCommunityIcons>
                                    <VText bold white style={{ fontSize: 14, marginLeft: 5 }}>{cultureResource.finishWork}</VText>
                                </VButton>
                            </View>

                        </View>
                    </Modal>
                    {/* <Modal
                        animationType="slide"
                        transparent={true}
                        visible={transferWait}
                        onRequestClose={() => { }}>
                        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(33, 33, 33, 0.5)' }}>
                            <View style={{ backgroundColor: Color.white, marginHorizontal: 16, borderRadius: 10, paddingVertical: 16, paddingHorizontal: 16 }}>
                                <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                                    <MaterialCommunityIcons name='check' size={60} color={Color.green}></MaterialCommunityIcons>
                                </View>
                                <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 18, fontWeight: 450, textAlign: 'center' }}>{transferWaitMessage}</Text>
                                </View>

                                <VButton onPress={() => {
                                    setTransferWait(false)
                                }} primary style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>

                                    <VText bold white style={{ fontSize: 14, marginLeft: 5 }}>Tamam</VText>
                                </VButton>
                            </View>

                        </View>
                    </Modal> */}
                    <StatusBar barStyle='dark-content'></StatusBar>
                </View >
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={mapModalVisible}
                    onRequestClose={() => setMapModalVisible(false)}
                >
                    <TouchableOpacity
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                        activeOpacity={1}
                        onPress={() => setMapModalVisible(false)}
                    >
                        <View style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'white',
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            paddingBottom: 40,
                            paddingTop: 16,
                        }}>
                            <View style={{ width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
                            <TouchableOpacity style={{
                                borderWidth: 1,
                                borderColor: Color.purple,
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 16,
                                marginVertical: 5,
                                marginHorizontal: 15,
                                borderRadius: 8,
                                flexDirection: 'row'
                            }}
                                onPress={() => {
                                    setMapModalVisible(false);
                                    openGoogleMaps(latitude, longitude);
                                }}
                            >
                                <MaterialCommunityIcons name="google-maps" size={32} color="black" />
                                <VText bold darkGrey style={{ fontSize: 18 }}>Google Maps</VText>
                            </TouchableOpacity>
                            <TouchableOpacity style={{
                                borderWidth: 1,
                                borderColor: Color.purple,
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: 16,
                                marginVertical: 5,
                                marginHorizontal: 15,
                                borderRadius: 8,
                                flexDirection: 'row'
                            }}
                                onPress={() => {
                                    setMapModalVisible(false);
                                    Location.getLastKnownPositionAsync().then((res) => {
                                        openYandexMap(res.coords.latitude, res.coords.longitude, latitude, longitude);
                                    });
                                }}
                            >
                                <FontAwesome5 name="yandex-international" size={32} color="black" />
                                <VText bold darkGrey style={{ fontSize: 18 }}>Yandex Maps</VText>
                            </TouchableOpacity>
                            {Platform.OS === 'ios' && (
                                <TouchableOpacity style={{
                                    borderWidth: 1,
                                    borderColor: Color.purple,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 16,
                                    marginVertical: 5,
                                    marginHorizontal: 15,
                                    borderRadius: 8,
                                    flexDirection: 'row'
                                }}
                                    onPress={() => {
                                        setMapModalVisible(false);
                                        openAppleMaps(latitude, longitude, mapLabel);
                                    }}
                                >
                                    <MaterialCommunityIcons name="apple" size={32} color="black" />
                                    <VText bold darkGrey style={{ fontSize: 18 }}>Apple Maps</VText>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={flightModalVisible}
                    onRequestClose={() => setFlightModalVisible(false)}
                >
                    <TouchableOpacity
                        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
                        activeOpacity={1}
                        onPress={() => setFlightModalVisible(false)}
                    >
                        <View style={{
                            position: 'absolute',
                            bottom: 0, left: 0, right: 0,
                            backgroundColor: Color.greyLight,
                            borderTopLeftRadius: 16,
                            borderTopRightRadius: 16,
                            maxHeight: '70%',
                            paddingBottom: 40,
                            paddingTop: 16,
                        }}>
                            <View style={{ width: 40, height: 4, backgroundColor: '#ccc', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
                            {flightData != null && flightData != undefined && (
                                <ScrollView style={{ borderRadius: 10, marginHorizontal: 10 }}>
                                    <View style={{ padding: 10 }}>
                                        <View style={{ backgroundColor: Color.white, borderRadius: 10, marginBottom: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30, backgroundColor: Color.greyLight, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 10 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Image style={{ height: 50, width: 50, borderRadius: 30, backgroundColor: Color.black }} source={{ uri: flightData.passengerImage }} />
                                                    <VText bold style={{ fontSize: 16, textTransform: 'capitalize', marginLeft: 10 }}>{flightData.passengerName}</VText>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderWidth: 1, borderColor: Color.greyBorder, padding: 10, borderRadius: 10, backgroundColor: Color.white }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                {flightData.airlineCompanyIcon == null && (
                                                    <FontAwesome5 name="plane-arrival" size={16} color={Color.greyBorder} />
                                                )}
                                                {flightData.airlineCompanyIcon != null && (
                                                    <Image style={{ height: 20, width: 20, borderRadius: 15 }} source={{ uri: flightData.airlineCompanyIcon }} />
                                                )}
                                                <VText bold greyText style={{ fontSize: 15, textTransform: 'uppercase', marginLeft: 5 }}>{cultureResource.company}</VText>
                                            </View>
                                            <VText bold style={{ fontSize: 14 }}>{flightData.airlineCompany}</VText>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderWidth: 1, borderColor: Color.greyBorder, padding: 10, borderRadius: 10, backgroundColor: Color.white }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Fontisto name="plane-ticket" size={16} color={Color.greyBorder} />
                                                <VText bold greyText style={{ fontSize: 15, textTransform: 'uppercase', marginLeft: 5 }}>{cultureResource.flightCode}</VText>
                                            </View>
                                            <VText bold style={{ fontSize: 14 }}>{flightData.flightNumber}</VText>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderWidth: 1, borderColor: Color.greyBorder, padding: 10, borderRadius: 10, backgroundColor: Color.white }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Ionicons name="timer-outline" size={16} color={Color.greyBorder} />
                                                <VText bold greyText style={{ fontSize: 15, textTransform: 'uppercase', marginLeft: 5 }}>{cultureResource.situation}</VText>
                                            </View>
                                            {flightData.flightStatus == 0 && (
                                                <VText bold style={{ fontSize: 14, textTransform: 'uppercase', color: 'green' }}>{cultureResource.timer}</VText>
                                            )}
                                            {flightData.flightStatus > 0 && (
                                                <VText bold style={{ fontSize: 14, textTransform: 'uppercase', color: 'red' }}>{flightData.flightStatus} {cultureResource.delay}</VText>
                                            )}
                                        </View>
                                        <View style={{ marginBottom: 30, borderWidth: 1, borderColor: Color.greyBorder, padding: 10, borderRadius: 10, backgroundColor: Color.white }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Entypo name="info-with-circle" size={16} color={Color.greyBorder} />
                                                <VText bold greyText style={{ fontSize: 15, textTransform: 'uppercase', marginLeft: 5 }}>{cultureResource.note}</VText>
                                            </View>
                                            <View style={{ borderWidth: 1, borderColor: Color.greyBorder, borderRadius: 10, padding: 10, marginTop: 10 }}>
                                                <VText bold style={{ fontSize: 14 }}>{flightData.greeterNote}</VText>
                                            </View>
                                        </View>
                                    </View>
                                </ScrollView>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>
                <OdometerCaptureModal
                    visible={odometerVisible}
                    mode={odometerMode}
                    workOrderId={item.id}
                    culture={cultureStore.culture}
                    minKilometer={odometerMode == 'finish' ? (item.startKilometer ?? null) : null}
                    onClose={() => { setOdometerVisible(false) }}
                    onCompleted={onOdometerCompleted}
                    onUnauthorized={(message) => {
                        setOdometerVisible(false);
                        responseStore.setResMessage(message);
                        responseStore.setRes401(true);
                    }}
                />
            </>
        )
    }
}

export default Detail

const styles = StyleSheet.create({
    // ── adim kartlari ───────────────────────────────────────────────────
    // Ray kaldirildi: durum bilgisi kartin ICINDE (sol serit + rozet) tasiniyor,
    // boylece kart tam genisligi kullaniyor. Kartlar arasi kisa bag cizgisi
    // siralama hissini koruyor ama yatay alan calmiyor.
    adimSarmal: {},
    adimKart: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#ECEEF2',
        overflow: 'hidden',
        shadowColor: '#0B0F19', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 10, elevation: 2,
    },
    adimSerit: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
    adimIcerik: { paddingLeft: 18, paddingRight: 16, paddingVertical: 16 },
    adimUst: { flexDirection: 'row', alignItems: 'flex-start' },
    adimRozet: {
        width: 28, height: 28, borderRadius: 10, marginRight: 11, marginTop: 1,
        alignItems: 'center', justifyContent: 'center',
    },
    adimBaslikKap: { flex: 1, minWidth: 0 },
    // Kartlar arasi bag: serit ile ayni x ekseninde, 14px bosluk.
    adimBag: { width: 2, height: 14, marginLeft: 18, backgroundColor: '#E7EAF0' },
    // Ray: durum noktasi + adimlari birbirine baglayan dikey cizgi.

    adimKartSolgun: { backgroundColor: '#FBFCFE' },
    adimBaslik: { fontSize: 16, lineHeight: 22, letterSpacing: -0.3, color: '#0B0F19' },
    adimAciklama: { marginTop: 4, fontSize: 13, lineHeight: 18, color: '#6B7280' },

    // adres blogu
    adresBlok: { marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: '#F8F9FC' },
    adresUst: { flexDirection: 'row', alignItems: 'center' },
    adresEtiket: { flex: 1, minWidth: 0, fontSize: 10.5, lineHeight: 14, letterSpacing: 0.6, color: '#9AA1AE', marginLeft: 7 },
    adresSaat: { fontSize: 15, lineHeight: 20, letterSpacing: -0.3, color: '#0B0F19', marginLeft: 8 },
    adresMetin: { marginTop: 6, fontSize: 14, lineHeight: 20, letterSpacing: -0.1, color: '#404C5B' },
    konumPaylas: {
        flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
        marginTop: 10, height: 32, paddingHorizontal: 10, borderRadius: 10,
        backgroundColor: 'rgba(28,201,97,0.10)',
    },
    konumPaylasMetin: { fontSize: 12.5, lineHeight: 16, color: '#0F8B44', marginLeft: 6 },

    // yolcular
    yolcuListe: { marginTop: 12 },
    yolcuSatir: {
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#ECEEF2',
    },
    yolcuKimlik: { flexDirection: 'row', alignItems: 'center' },
    yolcuFoto: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F8F9FC' },
    yolcuAd: { flex: 1, minWidth: 0, fontSize: 15, lineHeight: 20, letterSpacing: -0.2, color: '#0B0F19', marginLeft: 10 },
    // marginRight: -8 -> son butonun sagindaki artik bosluk emilir, butonlar kenara dayanir.
    yolcuAksiyonlar: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginRight: -8 },
    aksiyonBtn: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        marginRight: 8,
        backgroundColor: 'rgba(113,98,236,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    aksiyonBtnYesil: { backgroundColor: 'rgba(28,201,97,0.12)' },

    // adim butonlari
    adimBtn: {
        height: 46, borderRadius: 14, marginTop: 10,
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 14,
    },
    adimBtnBirincil: {
        backgroundColor: '#7162EC',
        shadowColor: '#7162EC', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18, shadowRadius: 10, elevation: 2,
    },
    adimBtnBirincilMetin: { fontSize: 14.5, lineHeight: 19, color: '#FFFFFF', marginLeft: 7 },
    adimBtnIkincil: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DCE0EA' },
    adimBtnIkincilMetin: { fontSize: 14.5, lineHeight: 19, color: '#404C5B', marginLeft: 7 },
    adimBtnTehlike: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(224,48,36,0.35)' },
    adimBtnTehlikeMetin: { fontSize: 14.5, lineHeight: 19, color: '#E03024', marginLeft: 7 },
    // Pasif hal: mor butonun soluk hali degil, acikca "su an basilamaz" gorunumu.
    adimBtnPasif: { backgroundColor: '#EEF0F5' },
    adimBtnPasifMetin: { fontSize: 14.5, lineHeight: 19, color: '#9AA1AE', marginLeft: 7 },

    // transferi birak
    birakBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        alignSelf: 'center', height: 44, paddingHorizontal: 18, marginTop: 6,
        borderRadius: 14,
    },
    birakMetin: { fontSize: 14.5, lineHeight: 19, color: '#E03024', marginLeft: 7 },
    // ── detay ust bolumu ────────────────────────────────────────────────
    mapKap: { width: '100%', backgroundColor: '#E7EAF0' },
    // Haritanin alt kenarinda karta gecisi yumusatan ince perde.
    mapPerde: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 36, backgroundColor: 'rgba(244,246,250,0.55)' },
    geriBtn: {
        width: 40, height: 40, borderRadius: 20, marginTop: 8,
        backgroundColor: 'rgba(255,255,255,0.94)',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#0B0F19', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
    },
    ayirici: { height: StyleSheet.hairlineWidth, backgroundColor: '#ECEEF2', marginVertical: 14 },

    durumSatir: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
    rozet: {
        flexDirection: 'row', alignItems: 'center', height: 28, borderRadius: 10,
        paddingLeft: 9, paddingRight: 12, flexShrink: 1,
    },
    rozetMetin: { fontSize: 12.5, lineHeight: 16, letterSpacing: 0.1, marginLeft: 6, flexShrink: 1 },

    tesisSatir: { flexDirection: 'row', alignItems: 'center' },
    logoKap: {
        width: 44, height: 44, borderRadius: 14, borderWidth: 1, borderColor: '#ECEEF2',
        backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', marginRight: 12,
    },
    logo: { width: 30, height: 30, resizeMode: 'contain' },
    tesisMetinKap: { flex: 1, minWidth: 0 },
    tesisAdi: { fontSize: 18, lineHeight: 24, letterSpacing: -0.4, color: '#0B0F19' },
    tesisAltSatir: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
    tesisAltMetin: { flexShrink: 1, fontSize: 13, lineHeight: 17, color: '#6B7280' },

    saatSatir: { flexDirection: 'row', alignItems: 'center' },
    saatHucre: { flexShrink: 1 },
    saatEtiket: { fontSize: 10.5, lineHeight: 14, letterSpacing: 0.6, color: '#9AA1AE' },
    saatDeger: { marginTop: 3, fontSize: 19, lineHeight: 25, letterSpacing: -0.4, color: '#0B0F19' },
    saatBag: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginTop: 10 },
    saatBagCizgi: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#DCE0EA' },
    saatBagIkon: {
        width: 26, height: 26, borderRadius: 13, marginHorizontal: 6,
        backgroundColor: '#F8F9FC', borderWidth: 1, borderColor: '#ECEEF2',
        alignItems: 'center', justifyContent: 'center',
    },

    kunye: {
        flexDirection: 'row', alignItems: 'stretch', marginTop: 16,
        backgroundColor: '#F8F9FC', borderRadius: 14, paddingVertical: 11, paddingHorizontal: 4,
    },
    kunyeHucre: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 4 },
    kunyeAyrac: { width: StyleSheet.hairlineWidth, backgroundColor: '#DCE0EA', marginVertical: 2 },
    kunyeEtiket: { fontSize: 10.5, lineHeight: 14, letterSpacing: 0.6, color: '#9AA1AE' },
    kunyeDeger: { marginTop: 3, fontSize: 16, lineHeight: 21, letterSpacing: -0.3, color: '#0B0F19' },

    ucretSatir: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
    ucretEtiket: { fontSize: 10.5, lineHeight: 14, letterSpacing: 0.6, color: '#9AA1AE' },
    ucretDeger: { fontSize: 20, lineHeight: 26, letterSpacing: -0.5, color: '#0B0F19', flexShrink: 1, marginLeft: 12 },

    notKart: {
        marginTop: 14, padding: 14, borderRadius: 14,
        backgroundColor: 'rgba(113,98,236,0.06)',
        borderWidth: 1, borderColor: 'rgba(113,98,236,0.18)',
    },
    notBaslik: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
    notBaslikMetin: { fontSize: 12, lineHeight: 16, letterSpacing: 0.4, color: '#7162EC', marginLeft: 6 },
    notMetin: { fontSize: 15, lineHeight: 21, letterSpacing: -0.1, color: '#0B0F19' },

    uetdsMetin: { flex: 1, minWidth: 0, fontSize: 14, lineHeight: 19, color: '#404C5B', marginLeft: 10 },
    uetdsAksiyon: { fontSize: 14, lineHeight: 19, color: '#7162EC', marginRight: 2 },
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
    passenger: {
        backgroundColor: Color.greyLight,
        paddingHorizontal: 6,
        paddingVertical: 10,
        borderRadius: 6,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    stepAddress: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: Color.greyBorder,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        marginTop: 20
    },
    stepContainer: { paddingHorizontal: 16, paddingTop: 6 },
    step: {
        backgroundColor: Color.white,
        padding: 10,
        borderRadius: 8,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: Color.greyBorder
    },
    stepHeader: { flexDirection: 'row' },
    uetds: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#DCE0EA',
        backgroundColor: '#F8F9FC',
        marginTop: 14,
    },
    container: { flex: 1, backgroundColor: '#F4F6FA' },
    header: { position: 'absolute', top: 0, left: 0, zIndex: 3, elevation: 3, paddingLeft: 16 },
    map: { width: '100%', height: 220, resizeMode: 'cover' },
    dataContainer: { flex: 1, width: '100%', marginTop: -28 },
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
        marginTop: 10
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
        paddingHorizontal: 8,
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
        paddingHorizontal: 8,
        flex: 1,
        borderColor: Color.greyBorder,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: 5
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
        paddingHorizontal: 8,
        flex: 1,
        borderColor: Color.greyBorder,
        alignItems: 'center',
        justifyContent: 'space-between',

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
        paddingHorizontal: 8,
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
        backgroundColor: Color.greyLight,
        padding: 15,
        justifyContent: 'center'
    },
    tabButton: {
        borderRadius: 1000,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: Color.white,
        borderWidth: 1.5,
        borderColor: Color.darkGrey,
        marginRight: 8,
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
        marginHorizontal: 16,
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#ECEEF2',
        paddingVertical: 18,
        paddingHorizontal: 18,
        shadowColor: '#0B0F19',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.07,
        shadowRadius: 16,
        elevation: 3,
    },
    workOrderHeaderContainer: {
        // paddingBottom: 25,
        // borderBottomWidth: 1,
        // borderBottomColor: Color.greyBorder,
    },
    workOrderHeader: {
        // flexDirection: 'row',
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
        flexDirection: 'row',
        alignItems: 'center',

    },
    workOrderHeaderDetailsTimeContainer: {
        backgroundColor: Color.darkGrey,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 100,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 8
    },
    workOrderHeaderDetailsTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 100,
        paddingHorizontal: 8,
        paddingVertical: 8,
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
    actions: {
        borderTopColor: Color.greyBorder,
        borderTopWidth: 1,
        marginTop: 20,
        paddingTop: 20
    },
    transferSummaryHeader: {
        flexDirection: 'row',
        marginTop: 20,

    },
    timeContainer: {
        flexDirection: 'row',
        flex: 2,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: Color.greyBorder,
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 10
    },
    timeContainerIcon: {
        paddingHorizontal: 5,
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
        paddingHorizontal: 10,
        maxWidth: '100%',
        overflow: 'hidden',
        marginLeft: 8
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
    paymentPaymentContainer: {
        maxWidth: '100%',
        overflow: 'hidden'
    }

})



//item.udts altındaydı.
{/* <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                                <TouchableOpacity style={{ flex: 1, borderRadius: 100, borderWidth: 1, marginRight: 10, borderColor: Color.purple, backgroundColor: Color.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15 }}>
                                    <Feather name="link-2" size={16} color={Color.purple} />
                                    <VText bold purple style={{ fontSize: 15, marginLeft: 5 }}>{cultureResource.sendFollowLink}</VText>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ flex: 1, borderRadius: 100, borderWidth: 1, borderColor: Color.purple, backgroundColor: Color.purple, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15 }}>
                                    <AntDesign name="pluscircle" size={16} color={Color.white} />
                                    <VText bold white style={{ fontSize: 15, marginLeft: 5 }}>{cultureResource.addAdditionalService}</VText>
                                </TouchableOpacity>
                            </View> */}
{/* <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
                                {planetStatus == 0 && (
                                    <>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                <FontAwesome5 name="plane-arrival" size={24} color={Color.greyBorder} />
                                                <VText bold black style={{ fontSize: 13, textTransform: 'uppercase', marginLeft: 5 }}>Havalimanı transferi</VText>
                                            </View>
                                            <TouchableOpacity onPress={() => { setPlanetStatus(1) }} >
                                                <VText bold purple style={{ fontSize: 13, textTransform: 'uppercase' }}>Görüntüle</VText>
                                            </TouchableOpacity>
                                        </View>

                                    </>
                                )}
                                {planetStatus == 1 && (
                                    <>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                <MaterialCommunityIcons name="airplane-landing" size={24} color="black" />
                                                <VText bold purple style={{ fontSize: 13, textTransform: 'uppercase', marginLeft: 5 }}>Havalimanı transferi</VText>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                <FontAwesome5 name="plane-arrival" size={16} color={Color.purple} />
                                                <VText bold style={{ fontSize: 13, textTransform: 'uppercase', marginLeft: 5 }}>THY</VText>
                                            </View>
                                            <VText bold style={{ fontSize: 13 }}>TK-21390</VText>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                <Entypo name="info-with-circle" size={24} color={Color.greyBorder} />
                                                <VText bold greyText style={{ fontSize: 13, textTransform: 'uppercase', marginLeft: 5 }}>Karşıla</VText>
                                            </View>
                                            <VText bold style={{ fontSize: 13, textTransform: 'uppercase' }}>Gelen YOLCU A KAPISI</VText>
                                        </View>
                                        <View style={{ marginBottom: 10 }}>
                                            <VText greyText style={{ fontSize: 13, textTransform: 'uppercase' }}></VText>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                    <Image style={{ height: 50, width: 50, borderRadius: 30, backgroundColor: Color.black }} source={{ uri: '' }} />
                                                    <VText bold style={{ fontSize: 13, textTransform: 'uppercase', marginLeft: 5 }}>Emin Eren</VText>
                                                </View>
                                                <View style={{ height: 50, width: 50, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: Color.purple }}>
                                                    <Ionicons name="link" size={24} color="white" />
                                                </View>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </View > */}
