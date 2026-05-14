import React from 'react'
import { Image, View, Text, TouchableOpacity, ScrollView, Animated, ImageBackground, StyleSheet, Modal } from 'react-native'
import { SvgUri } from 'react-native-svg';
import Color from '../../../../components/Color';
import VText from '../../../../components/VText';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { AntDesign } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import MyCarsComponent from './../../../../components/ProfilMain/MyCarsComponent'
import MyCarComponent from './../../../../components/ProfilMain/MyCarComponent'
import MyDriversComponents from '../../../../components/ProfilMain/MyDriversComponents';
import { Feather } from '@expo/vector-icons';
import Evaluaitons from '../../../../components/ProfilMain/Evaluaitons';
import { FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, signOut, getIdToken } from 'firebase/auth'
import { getApp } from 'firebase/app';
import * as ImagePicker from "expo-image-picker";
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as TaskManager from 'expo-task-manager';
import { useEffect } from 'react';
import { useState, useRef, useMemo, useCallback } from 'react';
import useCultureStore from '../../../../zustand/CultureStore';
import AppLoading from '../../../splash/AppLoading';
import Profile from '../../../../services/vita/Profile';
import useProfileStore from '../../../../zustand/ProfileStore';
import { Camera } from "expo-camera";
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import {
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetBackdrop
} from '@gorhom/bottom-sheet';
import UpdateProfile from '../../../../services/vita/UpdateProfile';
import VButton from '../../../../components/VButton';
import UploadProfileImage from '../../../../services/vita/UploadProfileImage';
import useAuthStore from '../../../../zustand/AuthStore';
import useResponseStore from '../../../../zustand/ResponseStore'
import { Asset } from 'expo-asset';

const Index = ({ navigation }) => {

    const responseStore = useResponseStore((state) => state)
    const [status, setStatus] = useState(0);
    const [change, setChange] = useState(false);
    const [userState, setUserState] = useState(false);
    const [responseMessage, setResponseMessage] = useState();
    const bottomSheetModalRef = useRef();
    const snapPoints = useMemo(() => ['50%'], []);
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
    const [vehicles, setVehicles] = useState();
    const [companies, setCompanies] = useState();
    const cultureStore = useCultureStore((state) => state);
    const profileStore = useProfileStore((state) => state);
    const [pickVehicle, setPickVehicle] = useState();
    const [dataFetch, setDataFetch] = useState(false);
    const [uid, setUid] = useState("");
    const authStore = useAuthStore((state) => state);
    const culture_en = {
        hello: 'Hello',
        help: 'Help',
        settings: 'Settings',
        logout: 'Sign Out',
        completed: 'Completed',
        late: 'Late',
        canceled: 'Canceled',
        vehicles: 'Vehicles',
        companies: 'Companies',
        ok: 'Ok',
        driver: 'Driver',
        usedVehicle: 'Used Vehicle',
        change: 'Change',
        myTools: 'My Tools',
        myCars: 'My Cars',
        driverInformation: 'Driver Information',
        myPersonalInformations: ' My personal informations',
        myDocuments: 'My documents',
        institutionsIServe: 'Institutions I Serve',
        changeProfilePhoto: 'Change Profile Photo',
        takeAPhoto: 'Take a photo',
        chooseFromLibrary: 'Choose From Library',
        failed: 'Failed!',
        successful: 'Successful',
        useCar: 'used vehicle',
        document: 'Documents',
        logOutText: 'Are you sure you want to log out?'

    }
    const culture_tr = {
        hello: 'Merhaba',
        help: 'Destek',
        settings: 'Ayarlar',
        logout: 'Çıkış yap',
        completed: 'Tamamlandı',
        late: 'Gecikti',
        canceled: 'İptal',
        vehicles: 'Araçlar',
        companies: 'Şirketler',
        ok: 'Tamam',
        driver: 'Sürücü',
        usedVehicle: 'Kullanılan araç',
        change: 'Değiştir',
        myCars: 'Araçlarım',
        driverInformation: 'Sürücü Bilgileri',
        myPersonalInformations: 'Kişisel Bilgilerim',
        myDocuments: 'Belgelerim',
        institutionsIServe: 'Hizmet Verdiğim Kurumlar',
        changeProfilePhoto: 'Profil Fotoğrafını Değiştir',
        takeAPhoto: 'Fotoğraf Çek',
        chooseFromLibrary: 'Kütüphaneden Seç',
        failed: 'Başarısız!',
        successful: 'Başarılı',
        useCar: 'kullanılan araç',
        document: 'Belgeler',
        warning: 'Uyarı !',
        logOutText: 'Çıkış yapmak istediğinize emin misiniz?',

    }
    const culture_de = {
        hello: 'Hallo',
        help: 'Hilfe',
        settings: 'Einstellungen',
        logout: 'Ausloggen',
        completed: 'Abgeschlossen',
        late: 'Spät',
        canceled: 'Abgesagt',
        vehicles: 'Fahrzeuge',
        companies: 'Firmen',
        ok: 'Pfeil',
        driver: 'Treiber',
        usedVehicle: 'Gebrauchtfahrzeug',
        change: 'ändern',
        myCars: 'meine Autos',
        driverInformation: 'Fahrerinformationen',
        myPersonalInformations: 'meinePersönlichenInformationen',
        myDocuments: 'meine Dokumente',
        institutionsIServe: 'InstitutionenIServe',
        changeProfilePhoto: 'changeProfilePhoto',
        takeAPhoto: 'Foto machen',
        chooseFromLibrary: 'aus der Bibliothek auswählen',
        failed: 'Fehlgeschlagen!',
        successful: 'Erfolgreich',
        useCar: 'verwendetes Fahrzeug',
        document: 'Dokumente',
        logOutText: 'Möchten Sie sich wirklich abmelden?',
        warning: 'Warnung',
    }
    const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);
    let flag = require('./../../../../assets/screens/account/appintro/tr.png');
    if (cultureStore.culture == "en") {
        flag = require('./../../../../assets/screens/account/appintro/en.png')
    }
    else if (cultureStore.culture == "tr") {
        flag = require('./../../../../assets/screens/account/appintro/tr.png')
    }
    else if (cultureStore.culture == "de") {
        flag = require('./../../../../assets/screens/account/appintro/de.png')
    }
    else {
        flag = require('./../../../../assets/screens/account/appintro/tr.png')
    }
    const [user, setUser] = useState();

    function getProfile() {
        Profile.Get().then((response) => {
            if (response.data.responseCode == 200) {
                setUser(response.data.data);
                setVehicles(response.data.data.vehicles)
                setCompanies(response.data.data.companies)
            } else if (response.data.ResponseCode == 401) {
                responseStore.setRes401(true)
                responseStore.setResMessage(response.data.ResponseMessage)

            } else {

            }


        })
    }
    useEffect(() => {
        getProfile();
        return () => {
        }
    }, [profileStore.change])
    useEffect(() => {
        getProfile();
    }, [])

    useEffect(() => {

        if (user != undefined && user != null) {
            let arr = user.vehicles.filter((item) => {
                return item.isCurrent == true
            })
            setPickVehicle(arr[0])
        }
    }, [user])


    function update() {
        let request = {
            imagePath: profilData
        }
        UpdateProfile.Put(request, cultureStore.culture).then((response) => {
            if (response.data.responseCode == 200) {
                setStatus(0)
                setResponseMessage(response.data.responseMessage)
                setChange(!change)
                profileStore.setChange(!profileStore.change)
            } else if (response.data.ResponseCode == 401) {
                responseStore.setRes401(true)
                responseStore.setResMessage(response.data.ResponseMessage)
            } else {
                setStatus(1)
                setResponseMessage(response.data.responseMessage)
                setChange(!change)
            }

        })
    }
    //2024 10. ay gibi kaldırıldı.
    // useEffect(() => {
    //     setDataFetch(true);
    //     const auth = getAuth();
    //     setUid(auth.currentUser.uid);
    //     ProfileService.getProfile(auth.currentUser.uid, profileRequestCallback);
    //     navigation.setOptions({
    //         title: profileData.firstName + " " + profileData.lastName,
    //     });
    //     return () => { };
    // }, []);
    const profileRequest = () => {
        setDataFetch(true);
        ProfileService.getProfile(useAuthStore.getState()?.loginUser.id, profileRequestCallback);
    };
    const profileRequestCallback = (data) => {
        setProfileData(data);
        setDataFetch(false);
    };

    const takePhoto = async () => {
        bottomSheetModalRef.current?.close()
        const permission = await Camera.getCameraPermissionsAsync();
        if (!permission.granted) {
            await Camera.requestCameraPermissionsAsync();
        } else {
            let result = await ImagePicker.launchCameraAsync({
                quality: 1,
                allowsEditing: true,
                aspect: [1, 1],
            });
            if (result.assets !== undefined && result.assets !== null) {
                imageCallback(result);
            }

            // onClose();
        }
    };

    const pickImage = async () => {
        bottomSheetModalRef.current?.close()
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].uri) {
            imageCallback(result);
        }
    };

    const imageCallback = async (result) => {
        try {

            const context = ImageManipulator.manipulate(result.assets[0].uri);
            context.resize({ width: 400, height: 400 });
            const renderedImage = await context.renderAsync();
            const manipResult = await renderedImage.saveAsync({
                compress: 1,
                format: SaveFormat.JPEG,
            });
            let localUri = manipResult.uri;
            let filename = localUri.split("/").pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;
            let formData = new FormData();


            formData.append("Photo", { uri: localUri, name: filename, type });
            formData.append("uid", uid);
            const token = authStore.loginUser.token;
            let ctr = cultureStore.culture
            await fetch(
                "https://vitadrivetransferapi-test.vitarnd.com/UploadProfileImage_Async",
                {
                    method: "PUT",
                    body: formData,
                    headers: { Authorization: `Bearer ${token}`, "Accept-Language": ctr }
                }
            )
                .then((res) => {
                    setUser((prevState) => ({
                        ...prevState,
                        imagePath: manipResult.uri,

                    }));
                })
                .catch((error) => {  })
                .finally(() => {  });

        } catch (error) {
        }

    };

    function userLogOut() {
        setUserState(false)
        authStore.logOut();
        try {
            TaskManager.unregisterAllTasksAsync();
        } catch (error) {

        }
    }

    return (
        <>
            {user == null && (
                <AppLoading></AppLoading>
            )}
            {
                user != null && (
                    <>
                        <ScrollView style={{ paddingTop: Constants.statusBarHeight }} >
                            <View style={{ flex: 1 }}>
                                <View style={{ margin: 20, }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', }}>
                                        <TouchableOpacity onPress={() => { bottomSheetModalRef.current?.present() }}>
                                            <ImageBackground imageStyle={{ borderRadius: 40, }} style={{ height: 80, width: 80, }} source={{ uri: user.imagePath }} >
                                                <View style={{ backgroundColor: Color.white, height: 25, width: 25, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 55, marginLeft: 55 }}>
                                                    <AntDesign name="pluscircleo" size={25} color={Color.green} style={{}} />
                                                </View>
                                            </ImageBackground>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={{ backgroundColor: Color.greyLight, alignItems: 'center', justifyContent: 'center', borderRadius: 10, height: 72, marginLeft: 10 }}
                                            onPress={() => {
                                                setUserState(true)
                                                // const auth = getAuth();
                                                // signOut(auth).then(() => {
                                                //     TaskManager.unregisterAllTasksAsync();
                                                // }).catch((error) => { });

                                            }}>
                                            <MaterialCommunityIcons name='logout' size={32} color={Color.dark}></MaterialCommunityIcons>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ marginTop: 10, }}>
                                        <VText bold style={{ fontSize: 22, }}>{user.firstName} {user.lastName}</VText>
                                        <View style={{ marginTop: 8, flexDirection: 'row', marginRight: 15 }}>
                                            {/* <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                            <MaterialCommunityIcons name="steering" size={15} color="black" />
                            <VText darkGrey semibold style={{ fontSize: 14, marginLeft: 3 }}>Araç Sahibi</VText>
                        </View> */}
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                                                <MaterialCommunityIcons name="steering" size={15} color="black" />
                                                <VText darkGrey semibold style={{ fontSize: 14, marginLeft: 3 }}>{cultureResource.driver}</VText>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <AntDesign name="star" size={15} color="orange" />
                                                <VText darkGrey semibold style={{ fontSize: 14, marginLeft: 3 }}>{user.rating}</VText>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ marginVertical: 15, borderWidth: 1, borderColor: Color.greyBorder, }}></View>
                                    {pickVehicle != null && pickVehicle != undefined && (
                                        <View style={{ borderWidth: 1, borderColor: Color.purple, borderRadius: 10, paddingTop: 10, paddingHorizontal: 15, paddingBottom: 15, }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderColor: Color.greyBorder, marginBottom: 15 }}>
                                                <Octicons name="dot-fill" size={12} color="lightgreen" />
                                                <VText darkGrey bold style={{ fontSize: 13, textTransform: 'uppercase', marginLeft: 5 }}>{cultureResource.useCar}</VText>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <View style={{ flexDirection: 'row' }}>
                                                    <Image style={{ height: 48, width: 48, }} source={{ uri: pickVehicle.brandLogo }} />
                                                    <View style={{ marginLeft: 10 }}>
                                                        <VText bold style={{ fontSize: 19, textTransform: 'uppercase', marginBottom: 2 }}>{pickVehicle.plate}</VText>
                                                        <VText semibold greyText style={{ fontSize: 13, textTransform: 'capitalize', marginBottom: 2 }}>{pickVehicle.brand}</VText>
                                                    </View>
                                                </View>
                                                <TouchableOpacity onPress={() => { navigation.navigate('CarChange', { data: { vehicles: user.vehicles } }) }} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Color.purple, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 30 }}>
                                                    <MaterialIcons name="loop" size={18} color="white" />
                                                    <VText bold style={{ marginLeft: 5, color: Color.white, fontSize: 15, textTransform: 'capitalize' }}>{cultureResource.change}</VText>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </View>
                                <View style={{ backgroundColor: Color.headerGrey, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: Color.greyBorder, }}>
                                    <View style={{ padding: 20, }}>
                                        <VText bold style={{ fontSize: 19, textTransform: 'capitalize' }}>{cultureResource.myCars}</VText>
                                    </View>
                                    {user != null && (
                                        user.vehicles.length == 1 && (
                                            <MyCarComponent cultureResource={cultureResource} navigation={navigation} item={user.vehicles[0]} />
                                        )
                                    )}
                                    <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} horizontal={true} style={{ paddingLeft: 20, }}>

                                        {user != null && (
                                            user.vehicles.length > 1 && (
                                                user.vehicles.map((item, key) => {
                                                    return (
                                                        <MyCarsComponent navigation={navigation} key={key} item={item} keyItem={key} cultureResource={cultureResource} />
                                                    )
                                                })
                                            )
                                        )}

                                        <View style={{ paddingRight: 30 }}></View>
                                        {/* <View style={{ backgroundColor: Color.white, borderRadius: 10, borderWidth: 1, borderColor: Color.greyBorder, paddingVertical: 16, paddingHorizontal: 15 }}>
                        <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                            <Image style={{ height: 48, width: 48, }} source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} />
                            <View style={{ marginLeft: 10 }}>
                                <VText bold style={{ fontSize: 19, textTransform: 'uppercase', marginBottom: 2 }}>34 ABC 12</VText>
                                <VText semibold greyText style={{ fontSize: 13, textTransform: 'capitalize', marginBottom: 2 }}>Mercedes Sprinter</VText>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', marginRight: 13 }}>
                            <View style={{ flexDirection: 'row', backgroundColor: Color.greyLight, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8, marginRight: 5 }}>
                                <MaterialIcons name="date-range" size={15} color="black" />
                                <VText semibold style={{ fontSize: 12, color: Color.darkGrey, marginLeft: 4 }}>2011</VText>
                            </View>
                            <View style={{ flexDirection: 'row', backgroundColor: Color.greyLight, marginRight: 5, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 }}>
                                <Ionicons name="person" size={15} color="black" />
                                <VText semibold style={{ fontSize: 12, color: Color.darkGrey, marginLeft: 4 }}>5 + 1</VText>
                            </View>
                            <View style={{ flexDirection: 'row', backgroundColor: Color.greyLight, marginRight: 5, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10 }}>
                                <MaterialCommunityIcons name="fuel" size={15} color="black" />
                                <VText semibold style={{ fontSize: 12, color: Color.darkGrey, textTransform: 'capitalize', marginLeft: 4 }}>Dizel</VText>
                            </View>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: Color.greyBorder, marginVertical: 15 }}></View>
                        <TouchableOpacity style={{ borderRadius: 30, flexDirection: 'row', borderWidth: 1, borderColor: Color.purple, paddingVertical: 15, justifyContent: 'center' }}>
                            <MaterialCommunityIcons name="file-document-multiple" size={18} color={Color.purple} />
                            <VText bold style={{ color: Color.purple, fontSize: 13, textTransform: 'capitalize', marginLeft: 5 }}>Belgeler</VText>
                        </TouchableOpacity>
                    </View> */}
                                    </ScrollView>
                                </View>
                                {/* <View style={{ backgroundColor: Color.headerGrey, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Color.greyBorder }}>
                <View style={{ padding: 20, }}>
                    <VText bold style={{ fontSize: 19, textTransform: 'capitalize' }}>Sürücülerim</VText>
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    <MyDriversComponents navigation={navigation} />
                    <View style={{ backgroundColor: Color.white, borderRadius: 10, borderWidth: 1, borderColor: Color.greyBorder, paddingVertical: 16, paddingHorizontal: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image style={{ height: 48, width: 48, borderRadius: 24 }} source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }} />
                                <View style={{ marginLeft: 10 }}>
                                    <VText bold style={{ fontSize: 18, textTransform: 'uppercase', marginBottom: 2 }}>Tarkan Yıldırım</VText>
                                    <VText semibold greyText style={{ fontSize: 13, textTransform: 'capitalize', marginBottom: 2 }}>+90 530 962 66 82</VText>
                                </View>
                            </View>
                            <TouchableOpacity style={{ alignItems: 'center', backgroundColor: Color.purple, height: 40, width: 40, borderRadius: 20, justifyContent: 'center', backgroundColor: Color.purple }}>
                                <View styyle={{}}>
                                    <FontAwesome5 name="phone-alt" size={18} color="white" />
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: Color.greyBorder, marginVertical: 15 }}></View>
                        <TouchableOpacity style={{ borderRadius: 30, flexDirection: 'row', borderWidth: 1, borderColor: Color.purple, paddingVertical: 15, justifyContent: 'center' }}>
                            <MaterialCommunityIcons name="file-document-multiple" size={18} color={Color.purple} />
                            <VText bold style={{ color: Color.purple, fontSize: 13, textTransform: 'capitalize', marginLeft: 5 }}>Belgeler</VText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View> */}
                                <View style={{ backgroundColor: Color.headerGrey, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Color.greyBorder }}>
                                    <View style={{ padding: 20, }}>
                                        <VText bold style={{ fontSize: 19, textTransform: 'capitalize' }}>{cultureResource.driverInformation}</VText>
                                    </View>
                                    <View style={{ backgroundColor: Color.white }}>
                                        <TouchableOpacity onPress={() => { navigation.navigate('PersonalInformation', { data: { user: user } }) }} style={{ flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Color.greyBorder }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Feather name="chevron-right" size={15} color="black" />
                                                <VText bold style={{ marginLeft: 10, fontSize: 15, textTransform: 'capitalize' }}>{cultureResource.myPersonalInformations}</VText>
                                            </View>
                                            <Feather name="chevron-right" size={15} color="black" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { navigation.navigate('MyDocuments', { data: { user: user } }) }} style={{ flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Color.greyBorder }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Feather name="chevron-right" size={15} color="black" />
                                                <VText bold style={{ marginLeft: 10, fontSize: 15, textTransform: 'capitalize' }}>{cultureResource.myDocuments}</VText>
                                            </View>
                                            <Feather name="chevron-right" size={15} color="black" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { navigation.navigate('ServeCompany', { data: { companies: companies } }) }} style={{ flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Color.greyBorder }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <Feather name="chevron-right" size={15} color="black" />
                                                <VText bold style={{ marginLeft: 10, fontSize: 15, textTransform: 'capitalize' }}>{cultureResource.institutionsIServe}</VText>
                                            </View>
                                            <Feather name="chevron-right" size={15} color="black" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => { navigation.navigate('CultureSelection') }} style={{ flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Color.greyBorder }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                                                <Feather name="chevron-right" size={15} color="black" />
                                                <VText bold style={{ marginLeft: 10, fontSize: 15, textTransform: 'capitalize' }}>
                                                    {cultureStore.culture == "tr" ? "Dil Seçimi:" :
                                                        cultureStore.culture == 'en' ? "Language:" :
                                                            cultureStore.culture == 'de' ? 'Sprache:' :
                                                                'Dil Seçimi:'}
                                                </VText>
                                                <Image width={24} height={17} source={flag} style={{ marginLeft: 10 }}></Image>
                                            </View>
                                            <Feather name="chevron-right" size={15} color="black" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {/* <View style={{ backgroundColor: Color.headerGrey, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Color.greyBorder }}>
                <View style={{ padding: 20, }}>
                    <VText bold style={{ fontSize: 19, textTransform: 'capitalize' }}>Entegrasyonlar</VText>
                </View>
                <View style={{ backgroundColor: Color.white }}>
                    <TouchableOpacity onPress={() => { navigation.navigate('FuelCard') }} style={{ flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Color.greyBorder }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather name="chevron-right" size={15} color="black" />
                            <VText bold style={{ marginLeft: 10, fontSize: 15, textTransform: 'capitalize' }}>Yakıt Kartı</VText>
                        </View>
                        <Feather name="chevron-right" size={15} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { navigation.navigate('GPSDevice') }} style={{ flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Color.greyBorder }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather name="chevron-right" size={15} color="black" />
                            <VText bold style={{ marginLeft: 10, fontSize: 15, textTransform: 'capitalize' }}>GPS Cihazı</VText>
                        </View>
                        <Feather name="chevron-right" size={15} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { navigation.navigate('UEDTSInformation') }} style={{ flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: Color.greyBorder }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather name="chevron-right" size={15} color="black" />
                            <VText bold style={{ marginLeft: 10, fontSize: 15, textTransform: 'capitalize' }}>UEDTS Bilgileri</VText>
                        </View>
                        <Feather name="chevron-right" size={15} color="black" />
                    </TouchableOpacity>
                </View>
            </View> */}
                                {/* <View style={{ backgroundColor: Color.headerGrey, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Color.greyBorder }}>
                <View style={{ flexDirection: 'row', padding: 20, justifyContent: 'space-between', alignItems: 'center' }}>
                    <VText bold style={{ fontSize: 19, textTransform: 'capitalize' }}>Değerlendirmeler</VText>
                    <TouchableOpacity onPress={() => { navigation.navigate('Evaluations') }} bold style={{ fontSize: 12, textTransform: 'uppercase', color: Color.purple }}>
                        <VText bold style={{ fontSize: 13, textTransform: 'capitalize', color: Color.purple }}>Tümünü Gör</VText>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 20, marginBottom: 100 }}>
                    <Evaluaitons></Evaluaitons>
                </View>
            </View> */}
                            </View>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Color.headerGrey }}>
                                <SvgUri height={40} width={80} uri='https://store.vitarnd.com/vitakids/assets/images/vita.svg' ></SvgUri>
                                <Text style={{ fontSize: 16, marginVertical: 5, fontWeight: '600' }}>vita RnD Teknoloji AŞ</Text>
                                <Text style={{ fontSize: 14, fontWeight: '400' }}>info@vitarnd.com</Text>
                                <Text style={{ fontSize: 14, fontWeight: '400' }}>App version: {Constants.expoConfig.version}</Text>
                            </View>
                            <View style={{ paddingBottom: 150, backgroundColor: Color.headerGrey }}>

                            </View>
                        </ScrollView >
                        <BottomSheetModalProvider style={{ flex: 1, zIndex: 10 }}>
                            <BottomSheetModal
                                enableDismissOnClose={true}
                                ref={bottomSheetModalRef}
                                index={0}
                                snapPoints={snapPoints}
                                backdropComponent={renderBackdrop}
                                onChange={handleSheetChanges}
                            >
                                <View style={{ flex: 1, paddingHorizontal: 20 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, }}>
                                        <VText bold darkGrey style={{ fontSize: 18, }}>{cultureResource.changeProfilePhoto}</VText>
                                        <TouchableOpacity style={{ paddingVertical: 5, paddingVertical: 5 }} onPress={() => { bottomSheetModalRef.current?.close() }}>
                                            <AntDesign name="close" size={24} color={Color.darkGrey} />
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity onPress={() => { takePhoto() }} style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', padding: 20, borderWidth: 1, borderRadius: 10, borderColor: Color.purple }}>
                                        <Entypo name="camera" size={24} color={Color.darkGrey} />
                                        <VText bold darkGrey style={{ fontSize: 15, marginLeft: 10 }}>{cultureResource.takeAPhoto}</VText>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { pickImage() }} style={{ marginTop: 10, flexDirection: 'row', alignItems: 'center', padding: 20, borderWidth: 1, borderRadius: 10, borderColor: Color.purple, marginBottom: 10 }}>
                                        <FontAwesome name="photo" size={24} color="black" />
                                        <VText bold darkGrey style={{ fontSize: 15, marginLeft: 10 }}>{cultureResource.chooseFromLibrary}</VText>
                                    </TouchableOpacity>
                                </View>
                            </BottomSheetModal>
                        </BottomSheetModalProvider>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={change}
                            onRequestClose={() => { }}>
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
                                <View style={styles.modalView}>
                                    {status == 0 ? <AntDesign name="check" size={60} color="green" /> : <AntDesign name="close" size={60} color="red" />}
                                    <VText bold style={{ marginTop: 20, fontSize: 20 }}>
                                        {status == 0 ? cultureResource.successful : cultureResource.failed}
                                    </VText>
                                    <VText regular style={{ marginTop: 20 }}>
                                        {responseMessage}
                                    </VText>
                                    <VButton primary style={{ paddingHorizontal: 40, paddingVertical: 10, marginTop: 25 }}
                                        onPress={() => { setChange(!change) }}>
                                        <VText white bold>{cultureResource.ok}</VText>
                                    </VButton>
                                </View>
                            </View>
                        </Modal>
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={userState}
                            onRequestClose={() => { setUserState(false) }}>
                            <View style={{ flex: 1, justifyContent: 'center', width: '80%', alignSelf: 'center' }}>
                                <View style={styles.modalView}>
                                    <Ionicons name="warning" size={100} color="orange" />
                                    <VText bold style={{ fontSize: 25, }}>
                                        {cultureResource.warning}
                                    </VText>
                                    <VText regular style={{ marginTop: 20, textAlign: 'center', fontSize: 18, }}>
                                        {cultureResource.logOutText}
                                    </VText>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25, }}>
                                        <VButton primary style={{ flex: 1, paddingVertical: 10, marginRight: 10 }}
                                            onPress={() => { userLogOut() }}>
                                            <VText white bold>{cultureResource.logout}</VText>
                                        </VButton>
                                        <VButton style={{ flex: 1, paddingVertical: 10, borderWidth: 1, borderColor: Color.purple, backgroundColor: Color.white }}
                                            onPress={() => { setUserState(false) }}>
                                            <VText purple bold>{cultureResource.canceled}</VText>
                                        </VButton>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                        <StatusBar barStyle='dark-content'></StatusBar>
                    </>
                )
            }
        </>
    )

}

export default Index

const styles = StyleSheet.create({
    modalView: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 20,
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
})