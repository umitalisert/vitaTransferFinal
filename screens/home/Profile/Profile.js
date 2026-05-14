import { TouchableOpacity, Text, View, StyleSheet, SafeAreaView, Image, Dimensions, Linking } from 'react-native'
import React from 'react'
import { getAuth, signOut } from 'firebase/auth'
import VText from '../../../components/VText'
import * as TaskManager from 'expo-task-manager';
import Profile from '../../../services/vita/Profile';
import { useEffect } from 'react';
import AppLoading from '../../splash/AppLoading';
import { useState } from 'react';
import Color from '../../../components/Color';
import useCultureStore from '../../../zustand/CultureStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ScrollView } from 'react-native-gesture-handler';
import useAuthStore from '../../../zustand/AuthStore';
const Index = ({ navigation }) => {
    const authStore = useAuthStore((state) => state);
    const cultureStore = useCultureStore((state) => state);
    const culture_en = {
        hello: 'Hello',
        help: 'Help',
        settings: 'Settings',
        logout: 'Sign Out',
        completed: 'Completed',
        late: 'Late',
        canceled: 'Canceled',
        vehicles: 'Vehicles',
        companies: 'Companies'
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
        companies: 'Şirketler'
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
        companies: 'Firmen'
    }
    const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);
    let flag = require('../../../assets/screens/account/appintro/tr.png');
    if (cultureStore.culture == "en") {
        flag = require('../../../assets/screens/account/appintro/en.png')
    }
    else if (cultureStore.culture == "tr") {
        flag = require('../../../assets/screens/account/appintro/tr.png')
    }
    else if (cultureStore.culture == "de") {
        flag = require('../../../assets/screens/account/appintro/de.png')
    }
    else {
        flag = require('../../../assets/screens/account/appintro/tr.png')
    }
    const [user, setUser] = useState();
    const [tabState, setTabState] = useState(1);

    function getProfile() {
        Profile.Get().then((response) => {
            setUser(response.data.data);
        })
    }
    useEffect(() => {
        getProfile();
        return () => {
        }
    }, [])
    if (user == null) {
        return (
            <AppLoading></AppLoading>
        )
    }
    else {
        return (
            <View style={styles.container}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.headerContainer}>
                        <View style={styles.headerTitleContainer}>
                            <View style={styles.headerTitle}>
                                <VText numberOfLines={1} primary style={{ fontSize: 16 }}>{cultureResource.hello}!</VText>
                                <VText numberOfLines={1} bold style={{ fontSize: 30 }}>{user.firstName} {user.lastName}</VText>
                            </View>
                            <View style={styles.headerImageContainer}>
                                <Image style={styles.headerImage} source={{ uri: user.imagePath }}></Image>
                            </View>
                        </View>
                        <View style={styles.ratingContainer}>
                            <MaterialCommunityIcons name='star' size={18} color={Color.yellow}></MaterialCommunityIcons>
                            <VText numberOfLines={1} white bold style={{ fontSize: 14 }}>{user.rating}</VText>
                        </View>
                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity onPress={() => { Linking.openURL('https://vitarnd.com') }} style={[styles.headerButton, { marginRight: 10 }]}>
                                <MaterialCommunityIcons name='lifebuoy' size={26} color={Color.primary}></MaterialCommunityIcons>
                                <VText numberOfLines={1} style={{ fontSize: 14 }}>{cultureResource.help}</VText>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => {
                                navigation.navigate('CultureSelection')
                            }} style={[styles.headerButton, { marginRight: 10, marginLeft: 10 }]}>
                                <Image width={24} height={17} source={flag}></Image>
                                <VText style={{ fontSize: 14, marginTop: 6 }}>{cultureStore.culture == "tr" ? "Türkçe" : cultureStore.culture == 'en' ? "English" : cultureStore.culture == 'de' ? 'Deutsch' : 'Türkçe'}</VText>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.headerButton, { marginLeft: 10 }]} onPress={() => {
                                // const auth = getAuth();
                                authStore.logOut()
                                try {
                                    TaskManager.unregisterAllTasksAsync();
                                } catch (error) {

                                }
                                // signOut(auth).then(() => {
                                //     TaskManager.unregisterAllTasksAsync();
                                // }).catch((error) => {
                                // });
                            }}>
                                <MaterialCommunityIcons name='logout' size={26} color={Color.dark}></MaterialCommunityIcons>
                                <VText numberOfLines={1} style={{ fontSize: 14 }}>{cultureResource.logout}</VText>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.tabsContainer}>
                        <TouchableOpacity onPress={() => {
                            setTabState(1)
                        }} style={[styles.tabItem, (tabState == 1 ? styles.activeTab : {})]}>
                            <View style={{ backgroundColor: Color.greyLight, borderRadius: 3, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="car-estate" size={26} color={Color.darkGrey} />
                            </View>
                            <VText style={[{ marginTop: 5 }, (tabState == 1 ? {
                                color: Color.purple,
                                fontFamily: 'Nunito_700Bold',
                                fontWeight: '700'
                            } : {
                                color: Color.darkGrey,
                                fontFamily: 'Nunito_600SemiBold',
                                fontWeight: '600'
                            })]}>{cultureResource.vehicles}</VText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {
                            setTabState(2)
                        }} style={[styles.tabItem, (tabState == 2 ? styles.activeTab : {})]}>
                            <View style={{ backgroundColor: Color.greyLight, borderRadius: 3, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="office-building-marker-outline" size={26} color={Color.darkGrey} />
                            </View>
                            <VText style={[{ marginTop: 5 }, (tabState == 2 ? {
                                color: Color.purple,
                                fontFamily: 'Nunito_700Bold',
                                fontWeight: '700'
                            } : {
                                color: Color.darkGrey,
                                fontFamily: 'Nunito_600SemiBold',
                                fontWeight: '600'
                            })]}>{cultureResource.companies}</VText>
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={{ paddingBottom: 100 }} style={{ paddingBottom: 100 }}>
                        {tabState == 1 && (
                            <View contentContainerStyle={{ paddingBottom: 100 }} style={{ paddingBottom: 100 }}>
                                {user?.vehicles.map((tab, key) => {
                                    return (
                                        <View key={'itemContainer_' + key.toString()} style={[styles.itemContainer]}>
                                            <View key={'clubContainer_' + key.toString()} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 10 }}>
                                                <View style={{ borderRadius: 5, height: 40, width: 40, backgroundColor: Color.greyLight, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image source={{ uri: tab.brandLogo }} style={{ height: 36, width: 36 }}></Image>
                                                </View>
                                                <View style={{ flex: 1, paddingLeft: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <View>
                                                        <VText primary bold style={{ fontSize: 18 }} key={'clubTextDate_' + key.toString()}>{tab.plate}</VText>
                                                        <VText key={'clubText_' + key.toString()}>{tab.brand}</VText>
                                                    </View>
                                                    <VText style={{ fontSize: 20 }} key={'clubText_' + key.toString()}>{tab.modelYear}</VText>
                                                </View>

                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        )}
                        {tabState == 2 && (
                            <View contentContainerStyle={{ paddingBottom: 100 }} style={{ paddingBottom: 100 }}>
                                {user?.companies.map((tab, key) => {
                                    return (
                                        <View key={'itemContainer_' + key.toString()} style={[styles.itemContainer]}>
                                            <View key={'clubContainer_' + key.toString()} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 10 }}>
                                                <View style={{ borderRadius: 5, height: 40, width: 40, backgroundColor: Color.greyLight, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Image source={{ uri: tab.companyImage }} style={{ height: 36, width: 36, resizeMode: 'center' }}></Image>
                                                </View>
                                                <View style={{ flex: 1, paddingLeft: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <View>
                                                        <VText primary bold style={{ fontSize: 18 }} key={'clubTextDate_' + key.toString()}>{tab.companyName}</VText>
                                                        <VText key={'clubText_' + key.toString()}>{tab.companyAddress}</VText>
                                                    </View>
                                                </View>

                                            </View>
                                        </View>
                                    )
                                })}
                            </View>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </View>
        )
    }
}

export default Index
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Color.white },
    headerContainer: { paddingVertical: 10, paddingHorizontal: 20, backgroundColor: Color.white, borderBottomColor: Color.greyLight, borderBottomWidth: 8 },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerTitle: {
        flex: 1,
    },
    headerImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 100,
    },
    itemContainer: {
        borderBottomWidth: 1,
        borderColor: Color.greyBorder,
        paddingVertical: 10,
        marginVertical: 5,
    },
    headerImage: {
        width: 60,
        height: 60
    },
    ratingContainer: {
        backgroundColor: Color.dark,
        paddingVertical: 3,
        flexDirection: 'row',
        borderRadius: 5,
        paddingLeft: 5,
        width: 55
    },
    tabsContainer: {
        backgroundColor: Color.white,
        flexDirection: 'row',
        borderBottomColor: Color.greyLight,
        borderBottomWidth: 1
    },
    activeTab: {
        borderBottomColor: Color.purple,
        borderBottomWidth: 1,
    },
    tabItem: {
        alignItems: 'center',
        paddingHorizontal: 5,
        paddingVertical: 10,
        flex: 1
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 10
    },
    headerButton: {
        flex: 1,
        backgroundColor: Color.greyLight,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        height: 72,
    },
    chartContainer: {
        alignItems: 'center',
        width: '100%',
        marginTop: 20
    }
})

