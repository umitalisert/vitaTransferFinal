import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Linking, Platform, Modal, TextInput, Keyboard } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState, } from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Color from '../../../components/Color';
import { SvgUri } from 'react-native-svg';
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
import { MaterialIcons } from '@expo/vector-icons';
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
import CancelBreakStatus from '../../../services/vita/CancelBreakStatus';
import { designName } from 'expo-device';

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
    function updateWorkOrderStatus(id, type, stepId, step, description) {
        dispatch(setLoading(true));
        Location.getLastKnownPositionAsync().then((res) => {
            const request = {
                id: id,
                type: type,
                stepId: stepId,
                latitude: res.coords.latitude,
                longitude: res.coords.longitude,
                description: description
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
        return (
            <>
                <View style={styles.container}>
                    <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 100 }}>
                        <SafeAreaView style={styles.header}>
                            <TouchableOpacity onPress={() => { navigation.goBack() }}>
                                <MaterialCommunityIcons name='arrow-left' size={34} color={Color.black}></MaterialCommunityIcons>
                            </TouchableOpacity>
                        </SafeAreaView>
                        <Image style={styles.map} source={{ uri: item.routeImage }}></Image>
                        <View ref={dataContainerRef} style={styles.dataContainer}>
                            <View key={'workOrder' + itemKey} style={styles.workOrder}>
                                <View key={'workOrderHeaderContainer' + itemKey} style={styles.workOrderHeaderContainer}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                        <View key={'workOrderHeader' + itemKey} style={styles.workOrderHeader}>
                                            <View key={'workOrderHeaderTitleContainer' + itemKey} style={styles.workOrderHeaderTitleContainer}>
                                                <View key={'workOrderHeaderImage' + itemKey} style={styles.workOrderHeaderImageContainer}>
                                                    <Image key={'facilityImage' + itemKey} style={styles.workOrderHeaderImage} source={{ uri: item.facilityImage }}></Image>
                                                </View>
                                                <View key={'workOrderHeaderTitle' + itemKey} style={styles.workOrderHeaderTitle}>
                                                    <VText numberOfLines={1} key={'facilityName' + itemKey} bold style={{ fontSize: 16 }}>{item.facilityName}</VText>
                                                </View>
                                            </View>
                                        </View>
                                        <View key={'workOrderHeaderDetailsContainer' + itemKey} style={styles.workOrderHeaderDetailsContainer}>
                                            {item.status == -2 && (
                                                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.white, borderWidth: 1, borderColor: Color.red }]}>
                                                    <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='account-alert-outline' size={22} color={Color.red}></MaterialCommunityIcons>
                                                    <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold red style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.noshow}</VText>
                                                </View>
                                            )}
                                            {item.status == -3 && (
                                                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.red }]}>
                                                    <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='alert' size={22} color={Color.white}></MaterialCommunityIcons>
                                                    <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.canceled}</VText>
                                                </View>
                                            )}
                                            {item.status == 0 && (
                                                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.primary }]}>
                                                    <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='progress-clock' size={22} color={Color.white}></MaterialCommunityIcons>
                                                    <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.willBegin}</VText>
                                                </View>
                                            )}
                                            {item.status == 1 && (
                                                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.green }]}>
                                                    <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='check' size={22} color={Color.white}></MaterialCommunityIcons>
                                                    <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.hasCompleted}</VText>
                                                </View>
                                            )}
                                            {item.status == 2 && (
                                                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.white, borderWidth: 1, borderColor: Color.yellow }]}>
                                                    <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='clock-alert-outline' size={22} color={Color.yellow}></MaterialCommunityIcons>
                                                    <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold black style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.late}</VText>
                                                </View>
                                            )}
                                            {item.status == 3 && (
                                                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.primary }]}>
                                                    <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='clock-check-outline' size={22} color={Color.white}></MaterialCommunityIcons>
                                                    <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.started}</VText>
                                                </View>
                                            )}
                                            {item.status == 4 && (
                                                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.primary }]}>
                                                    <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='account-check-outline' size={22} color={Color.white}></MaterialCommunityIcons>
                                                    <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.passengerRecieved}</VText>
                                                </View>
                                            )}
                                            {item.status == 5 && (
                                                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={[styles.workOrderHeaderDetailsTimeContainer, { backgroundColor: Color.white, borderWidth: 1, borderColor: Color.red }]}>
                                                    <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='close' size={22} color={Color.red}></MaterialCommunityIcons>
                                                    <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold red style={{ fontSize: 16, marginLeft: 5 }}>{cultureResource.notCompleted}</VText>
                                                </View>
                                            )}
                                            {(item.status > 5 || item.status < -2) && (
                                                <View key={'workOrderHeaderDetailsTimeContainer' + itemKey} style={styles.workOrderHeaderDetailsTimeContainer}>
                                                    <MaterialCommunityIcons key={'workOrderHeaderDetailsTimeIconContainer' + itemKey} name='clock' size={14} color={Color.white}></MaterialCommunityIcons>
                                                    <VText key={'workOrderHeaderDetailsTimedateTimeStrContainer' + itemKey} bold white style={{ fontSize: 16, marginLeft: 5 }}>{item.dateTimeStr}</VText>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    <View key={'transferSummaryHeader' + itemKey} style={[styles.transferSummaryHeader, { justifyContent: 'space-between' }]}>
                                        <View key={'timeContainer' + itemKey} style={styles.timeContainer}>
                                            <View key={'begining' + itemKey} style={[styles.begining, { marginRight: 3 }]}>
                                                <VText key={'begin' + itemKey} bold greyText style={{ fontSize: 12, marginBottom: 6 }}>{cultureResource.start1}</VText>
                                                <VText key={'beginTime' + itemKey} bold style={{ fontSize: 19 }}>{item.dateTimeStr}</VText>
                                            </View>

                                            <View style={{ overflow: 'hidden', flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 6, marginLeft: 3 }}>
                                                <VText numberOfLines={1} darkGrey style={{}}>..........................</VText>
                                            </View>
                                            <View key={'timeContainerIcon' + itemKey} style={[styles.timeContainerIcon, { margin: 3 }]}>
                                                <MaterialIcons name="watch-later" size={16} color="black" />
                                            </View>
                                            <View style={{ overflow: 'hidden', flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 6, marginRight: 3 }}>
                                                <VText numberOfLines={1} darkGrey style={{}}>.................................</VText>
                                            </View>
                                            <View key={'finish' + itemKey} style={[styles.finish, { marginLeft: 3 }]}>
                                                <VText key={'finishing' + itemKey} bold greyText style={{ marginBottom: 6, fontSize: 11 }}>{cultureResource.finish}</VText>
                                                <VText key={'finishTime' + itemKey} bold style={{ fontSize: 18 }}>{item.endDateTimeStr}</VText>
                                            </View>
                                        </View>
                                        {item.priceText != '0,00' && (
                                            <View key={'progressPayment' + itemKey} style={styles.progressPayment}>
                                                <View key={'progressPaymentIcon' + itemKey} style={styles.progressPaymentIcon}>
                                                    <VText bold style={{ fontSize: 18 }}>{item.currencySymbol}</VText>
                                                </View>
                                                <View key={'paymentPaymentContainer' + itemKey} style={styles.paymentPaymentContainer}>
                                                    <VText key={'proressPayment' + itemKey} bold greyText style={{ fontSize: 12, marginBottom: 6 }}>{cultureResource.amount}</VText>
                                                    <VText key={'proressPaymentText' + itemKey} bold numberOfLines={1} style={{ fontSize: 17, }}>{item.priceText}</VText>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <View key={'workOrderDetailSummaryContainer' + itemKey} style={styles.workOrderDetailSummaryContainer}>
                                        <View key={'workOrderSummaryItemContainer' + itemKey} style={styles.workOrderSummaryItemContainer}>
                                            <View key={'summaryDistance' + itemKey} style={styles.summaryDistance}>
                                                <SvgUri key={'summaryDistanceSvg' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/distance.svg' />
                                                <VText key={'summaryDistanceText' + itemKey} numberOfLines={1} bold style={{ fontSize: 16, marginLeft: 8 }}>{item.distanceText}</VText>
                                            </View>
                                            <View key={'summaryDuration' + itemKey} style={styles.summaryDuration}>
                                                <SvgUri key={'summaryDurationSvg' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/duration.svg' />
                                                <VText key={'summaryDurationText' + itemKey} numberOfLines={1} bold style={{ fontSize: 16, marginLeft: 8 }}>{item.durationText}</VText>
                                            </View>
                                            <View key={'summaryPassenger' + itemKey} style={styles.summaryPassenger}>
                                                <SvgUri key={'summaryPassengerSvg' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/passenger.svg' />
                                                <VText key={'summaryPassengerText' + itemKey} bold style={{ fontSize: 16, marginLeft: 8, flex: 1 }}>{item.peopleCount} {cultureResource.passenger}</VText>
                                            </View>
                                        </View>
                                        {item.description != null && (

                                            <View style={{ borderWidth: 1, borderColor: Color.greyBorder, padding: 10, borderRadius: 10, backgroundColor: Color.white, marginTop: 10 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                    <Entypo name="info-with-circle" size={16} color={Color.greyBorder} />
                                                    <VText bold greyText style={{ fontSize: 15, textTransform: 'uppercase', marginLeft: 5 }}>{cultureResource.driverNote}</VText>
                                                </View>
                                                <View style={{ borderWidth: 1, borderColor: Color.greyBorder, borderRadius: 10, padding: 10, marginTop: 10 }}>
                                                    <VText bold primary style={{ fontSize: 16 }}>{item.description}</VText>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                    <View style={{ marginTop: 10 }}>
                                        <View key={'workOrderHeaderDetailsContainer' + itemKey} style={styles.workOrderHeaderDetailsContainer}>
                                            <View key={'workOrderHeaderDetailsTypeContainer' + itemKey} style={styles.workOrderHeaderDetailsTypeContainer}>

                                                {item.transferType == 1 && (
                                                    <SvgUri key={'workOrderHeaderDetailsTypeSvgContainer' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype1.svg' />
                                                )}
                                                {item.transferType == 2 && (
                                                    <SvgUri key={'workOrderHeaderDetailsTypeSvgContainer' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype2.svg' />
                                                )}
                                                {item.transferType == 3 && (
                                                    <SvgUri key={'workOrderHeaderDetailsTypeSvgContainer' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype3.svg' />
                                                )}
                                                {item.transferType == 4 && (
                                                    <SvgUri key={'workOrderHeaderDetailsTypeSvgContainer' + itemKey} uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/transfertype4.svg' />
                                                )}
                                                <VText numberOfLines={1} key={'workOrderHeaderDetailsTypeTextContainer' + itemKey} bold darkGrey style={{ fontSize: 16, marginLeft: 5 }}>
                                                    {item.transferType == 1 ? cultureResource.transferType1 : item.transferType == 2 ? cultureResource.transferType2 : item.transferType == 3 ? cultureResource.transferType3 : item.transferType == 4 ? cultureResource.transferType4 : cultureResource.transferType1}
                                                </VText>
                                            </View>
                                        </View>
                                        {/* <View key={'workOrderHeaderDetailsContainer' + itemKey} style={[styles.workOrderHeaderDetailsContainer, { marginTop: 10 }]}>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            borderRadius: 100,
                                            paddingHorizontal: 8,
                                            paddingVertical: 8,
                                            backgroundColor: Color.greyLight,
                                            marginRight: 5
                                        }}>
                                            <VText bold darkGrey style={{ fontSize: 15, marginRight: 5 }}>Bebek Koltuğu</VText>
                                        </View>
                                        <View style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            borderRadius: 100,
                                            paddingHorizontal: 8,
                                            paddingVertical: 8,
                                            backgroundColor: Color.greyLight
                                        }}>
                                            <VText bold darkGrey style={{ fontSize: 15, marginRight: 5 }}>Avrasya Tüneli</VText>
                                        </View>
                                    </View> */}
                                    </View>

                                </View>
                                {item.uetds && (
                                    <View style={styles.uetds}>
                                        <View style={{}}>
                                            <SvgUri uri='https://store.kodnova.com/vitadrive-transfer/assets/icons/uedts.svg'></SvgUri>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <VText bold greyText style={{ fontSize: 14, marginLeft: 8 }}>{cultureResource.uetds}</VText>
                                        </View>
                                        <View>
                                            <TouchableOpacity onPress={() => { Linking.openURL(item.uetdsUrl) }}>
                                                <VText bold green style={{ fontSize: 14, marginLeft: 8 }}>
                                                    {cultureResource.show}
                                                </VText>
                                            </TouchableOpacity>

                                            {/* {
                                                item.uetds && (
                                                    <TouchableOpacity onPress={() => { Linking.openURL(item.uetdsUrl) }}>
                                                        <VText bold green style={{ fontSize: 14, marginLeft: 8 }}>
                                                            {cultureResource.show}
                                                        </VText>
                                                    </TouchableOpacity>
                                                )
                                            }
                                            {
                                                !item.uetds && (
                                                    <TouchableOpacity>
                                                        <VText bold green style={{ fontSize: 14, marginLeft: 8, textDecorationLine: 'underline' }}>
                                                            {cultureResource.create}
                                                        </VText>
                                                    </TouchableOpacity>
                                                )
                                            } */}
                                        </View>

                                    </View>
                                )}
                            </View>
                            <View ref={stepContainerRef} style={styles.stepContainer}>
                                <View style={styles.step}>
                                    <View style={styles.stepHeader}>
                                        <MaterialCommunityIcons name='check-circle' size={24} color={item.isStarted ? Color.green : Color.greyText}></MaterialCommunityIcons>
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <VText numberOfLines={1} bold style={{ fontSize: 18 }}>{cultureResource.startDriving}</VText>
                                            <VText numberOfLines={1} semiBold style={{ fontSize: 14, marginTop: 10 }}>{cultureResource.startDrivingText}</VText>
                                        </View>

                                    </View>
                                    {!item.isStarted && (
                                        <View style={styles.stepAction}>
                                            <VButton onPress={() => {
                                                workStore?.workData.breakEnd != null ? (cancelBreakStatus(), updateWorkOrderStatus(item.id, 1, 0)) : updateWorkOrderStatus(item.id, 1, 0)

                                                workStore.workData.breakEnd != null ? cancelBreakStatus() : console.log('asdasddedededed')
                                            }} primary style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                                                <MaterialCommunityIcons name='play' size={24} color={Color.white}></MaterialCommunityIcons>
                                                <VText bold white style={{ fontSize: 14, marginLeft: 5 }}>{cultureResource.start}</VText>
                                            </VButton>
                                        </View>
                                    )}
                                </View>
                                {item != null && item.steps != null && (
                                    item.steps.map((step, stepKey) => {
                                        if (step.hidden == true) {
                                            return (<View key={'step' + stepKey}></View>)
                                        }
                                        else {
                                            return (
                                                <View key={'step' + stepKey}
                                                    style={styles.step}>
                                                    <View key={'stepHeader' + stepKey} style={styles.stepHeader}>
                                                        <MaterialCommunityIcons key={'stepIcon' + stepKey} name='check-circle' size={24} color={step.noShow ? Color.red : (step.isCompleted ? Color.green : Color.greyText)}></MaterialCommunityIcons>
                                                        <View key={'stepTitleContainer' + stepKey} style={{ flex: 1, marginLeft: 10 }}>
                                                            <VText key={'stepTitle' + stepKey} numberOfLines={2} bold style={{ fontSize: 18 }}>{step.title}</VText>
                                                        </View>
                                                    </View>
                                                    {step.address != null && (
                                                        <View key={'stepAddress' + stepKey} style={styles.stepAddress}>
                                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                                <MaterialCommunityIcons key={'stepAddressIcon' + stepKey} name={step.addressType == 0 ? 'triangle' : step.addressType == 1 ? 'circle' : 'square'} color={Color.black} size={14}></MaterialCommunityIcons>
                                                                {(step.addressType == 0 || step.addressType == 2) && (
                                                                    (() => {
                                                                        const whatsappPassenger = step.items?.find((passenger) => getWhatsappPhoneNumber(passenger.phoneNumber));
                                                                        const whatsappPhoneNumber = whatsappPassenger?.phoneNumber;
                                                                        const whatsappEnabled = !!getWhatsappPhoneNumber(whatsappPhoneNumber);

                                                                        return (
                                                                    <TouchableOpacity
                                                                            onPress={() => {
                                                                                if (whatsappEnabled) {
                                                                                    openWhatsApp(whatsappPhoneNumber);
                                                                                }
                                                                            }}
                                                                            disabled={!whatsappEnabled}
                                                                            style={{ backgroundColor: whatsappEnabled ? Color.green : Color.greyBorder, borderRadius: 100, width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginLeft: 8 }}
                                                                    >
                                                                        <FontAwesome name='whatsapp' size={18} color={Color.white}></FontAwesome>
                                                                    </TouchableOpacity>
                                                                        );
                                                                    })()
                                                                )}
                                                            </View>
                                                            <View key={'stepAddressContainer' + stepKey} style={{ flex: 1, marginLeft: 12, justifyContent: 'center' }}>
                                                                <VText key={'stepAddressTitle' + stepKey} bold greyText style={{ fontSize: 12, marginBottom: 8 }}>{step.addressType == 0 ? cultureResource.pickupLocation : step.addressType == 1 ? cultureResource.waypointLocation : cultureResource.dropLocation}</VText>
                                                                <VText key={'stepAddressText' + stepKey} numberOfLines={5} semiBold style={{ fontSize: 14 }}>{step.address}</VText>
                                                            </View>
                                                            <VText key={'stepTime' + stepKey} bold style={{ fontSize: 16 }}>{step.time}</VText>
                                                        </View>
                                                    )}
                                                    {step.items != null && (
                                                        <View style={{ marginTop: 20 }}>
                                                            {step.items.map((passenger, passengerKey) => (
                                                                <View key={'stepItems' + passengerKey} style={styles.passenger}>
                                                                    <Image key={'stepItemsImage' + passengerKey} style={styles.workOrderHeaderImage} source={{ uri: passenger.imagePath }}></Image>
                                                                    <VText key={'stepItemsFullName' + passengerKey} bold style={{ fontSize: 14, flex: 1, marginLeft: 10 }}>{passenger.fullName}</VText>
                                                                    <View style={{ flexDirection: 'row' }}>
                                                                        {passenger.showFlightBtn && (
                                                                            <TouchableOpacity onPress={() => { openFlightModal(item.id, passenger.id) }} style={{ backgroundColor: Color.primary, borderRadius: 100, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 5 }}>
                                                                                <FontAwesome name="plane" size={24} color="white" />
                                                                            </TouchableOpacity>
                                                                        )}

                                                                        <TouchableOpacity onPress={() => { openBottomSheet(step.location.latitude, step.location.longitude, step.addressType == 0 ? cultureResource.pickupLocation : step.addressType == 1 ? cultureResource.waypointLocation : cultureResource.dropLocation) }} style={{ backgroundColor: Color.primary, borderRadius: 100, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 5 }}>
                                                                            <FontAwesome5 name='location-arrow' size={16} color={Color.white}></FontAwesome5>
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity
                                                                            onPress={() => { openWhatsApp(passenger.phoneNumber) }}
                                                                            style={{ backgroundColor: Color.primary, borderRadius: 100, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 5 }}
                                                                        >
                                                                            <FontAwesome name="whatsapp" size={24} color="white" />
                                                                        </TouchableOpacity>
                                                                        {passenger.showCallBtn && (
                                                                            <TouchableOpacity onPress={() => {
                                                                                const rawPhone = `${passenger.phoneNumber}`.replace(/[^\d]/g, '');
                                                                                if (rawPhone) Linking.openURL(`tel:+${rawPhone}`);
                                                                            }} style={{ backgroundColor: Color.primary, borderRadius: 100, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', marginRight: 5 }}>
                                                                                <MaterialCommunityIcons name='phone' size={24} color={Color.white}></MaterialCommunityIcons>
                                                                            </TouchableOpacity>
                                                                        )}


                                                                    </View>

                                                                </View>
                                                            )
                                                            )}
                                                        </View>
                                                    )}
                                                    {!step.isCompleted && !step.noShow && (
                                                        <View key={'stepAction' + stepKey} style={styles.stepAction}>
                                                            {item.isStarted && (
                                                                <VButton onPress={() => {
                                                                    step.items.length > 0 && step.boardingType == false
                                                                        ?
                                                                        (ChangeWaitingStatusFunc(-4, item.id),
                                                                            updateWorkOrderStatus(item.id, step.boardingType == false ? 2 : 3, step.id, step))
                                                                        :
                                                                        updateWorkOrderStatus(item.id, step.boardingType == false ? 2 : 3, step.id, step)
                                                                }} primary style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                                                                    <MaterialCommunityIcons name='check' size={24} color={Color.white}></MaterialCommunityIcons>
                                                                    <VText bold white style={{ fontSize: 14, marginLeft: 5 }}>{step.items.length > 0 && step.boardingType == false ? cultureResource.boarded : step.items.length > 0 && step.boardingType == true ? cultureResource.departed : step.items.length == 0 ? cultureResource.arrived : cultureResource.hasCompleted}</VText>
                                                                </VButton>
                                                            )}
                                                            {!item.isStarted && (
                                                                <VButton primary disabled style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                                                                    <MaterialCommunityIcons name='check' size={24} color={Color.white}></MaterialCommunityIcons>
                                                                    <VText bold white style={{ fontSize: 14, marginLeft: 5 }}>{step.items.length > 0 && step.boardingType == false ? cultureResource.boarded : step.items.length > 0 && step.boardingType == true ? cultureResource.departed : step.items.length == 0 ? cultureResource.arrived : cultureResource.hasCompleted}</VText>
                                                                </VButton>
                                                            )}
                                                            {item.isStarted && step.boardingType == false && step.items.length > 0 && (
                                                                <VButton onPress={() => {
                                                                    updateWorkOrderStatus(item.id, -2, step.id, step)
                                                                }} secondary style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                                                                    <MaterialCommunityIcons name='close' size={24} color={Color.white}></MaterialCommunityIcons>
                                                                    <VText bold white style={{ fontSize: 14, marginLeft: 5 }}>{cultureResource.notBoarded}</VText>
                                                                </VButton>
                                                            )}
                                                            {!item.isStarted && step.boardingType == false && step.items.length > 0 && (
                                                                <VButton secondary disabled style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                                                                    <MaterialCommunityIcons name='close' size={24} color={Color.white}></MaterialCommunityIcons>
                                                                    <VText bold white style={{ fontSize: 14, marginLeft: 5 }}>{cultureResource.notBoarded}</VText>
                                                                </VButton>
                                                            )}
                                                        </View>
                                                    )
                                                    }
                                                    {
                                                        (step.isCompleted || step.noShow) && (
                                                            <View key={'stepAction' + stepKey} style={styles.stepAction}>
                                                                <VButton onPress={() => {
                                                                    removeWorkOrderStatus(item.id, step.boardingType == false ? (step.noShow ? -2 : 2) : 3, step.id, step)
                                                                }} secondary style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                                                                    <MaterialCommunityIcons name='undo-variant' size={24} color={Color.white}></MaterialCommunityIcons>
                                                                    <VText bold white style={{ fontSize: 14, marginLeft: 5 }}>{cultureResource.undo}</VText>
                                                                </VButton>

                                                            </View>
                                                        )
                                                    }
                                                </View>
                                            )
                                        }

                                    }
                                    )
                                )}
                                <View style={styles.step}>
                                    <View style={styles.stepHeader}>
                                        <MaterialCommunityIcons name='check-circle' size={24} color={item.status == 1 ? Color.green : Color.greyText}></MaterialCommunityIcons>
                                        <View style={{ flex: 1, marginLeft: 10 }}>
                                            <VText numberOfLines={1} bold style={{ fontSize: 18 }}>{cultureResource.finishWork}</VText>
                                            <VText numberOfLines={1} semiBold style={{ fontSize: 14, marginTop: 10 }}>{cultureResource.finishDrivingText}</VText>
                                        </View>
                                    </View>
                                    {item.isStarted && item.steps.filter(step => {
                                        return (step.isCompleted == true || step.noShow == true)
                                    }).length > 0 && (
                                            <View style={styles.stepAction}>
                                                <VButton onPress={() => {
                                                   
                                                    // updateWorkOrderStatus(item.id, 4, 0)
                                                    setTransferDescription(true)
                                                }} primary style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                                                    <MaterialCommunityIcons name='check' size={24} color={Color.white}></MaterialCommunityIcons>
                                                    <VText bold white style={{ fontSize: 14, marginLeft: 5 }}>{cultureResource.finishWork}</VText>
                                                </VButton>
                                            </View>
                                        )}
                                    {(!item.isStarted || item.steps.filter(step => {
                                        return (step.isCompleted == true || step.noShow == true)
                                    }).length == 0) && (
                                            <View style={styles.stepAction}>
                                                <VButton primary disabled style={{ marginTop: 20, flexDirection: 'row', alignItems: 'center', paddingVertical: 15 }}>
                                                    <MaterialCommunityIcons name='check' size={24} color={Color.white}></MaterialCommunityIcons>
                                                    <VText bold white style={{ fontSize: 14, marginLeft: 5 }}>{cultureResource.finishWork}</VText>
                                                </VButton>
                                            </View>
                                        )}
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => { setChangeWarning(true) }} style={{ marginTop: 10, padding: 10, justifyContent: 'center', alignItems: 'center' }}>
                            <VText semibold style={{ fontSize: 18, marginLeft: 5, color: 'red', borderBottomWidth: 1, borderBottomColor: 'red' }}>{cultureResource.dropTransfer}</VText>
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
                                    // console.log('burasını basıyoruz.......' , item.id , 4 , 0 , null , description)
                                    updateWorkOrderStatus(item.id, 4, 0,null, description);
                                    setTransferDescription(false);
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
            </>
        )
    }
}

export default Detail

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
    stepContainer: {
        padding: 10
    },
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
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: Color.greyBorder,
        marginTop: 20
    },
    container: { flex: 1, backgroundColor: Color.greyLight },
    header: { position: 'absolute', zIndex: 3, elevation: 3, marginLeft: 20, marginTop: 50 },
    map: {
        width: '100%',
        height: 200,
        resizeMode: 'cover'
    },
    dataContainer: {
        flex: 1,
        width: '100%',
        marginTop: -10
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
        marginBottom: 10,
        backgroundColor: Color.white,
        paddingVertical: 20,
        paddingHorizontal: 15,
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
