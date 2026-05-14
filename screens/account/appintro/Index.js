import React, { Component, useEffect } from 'react'
import { Animated, View, StyleSheet, Image, Dimensions, ScrollView, TouchableOpacity, StatusBar } from 'react-native'
import VText from '../../../components/VText'
import Color from '../../../components/Color'
import VButton from '../../../components/VButton'
import useCultureStore from '../../../zustand/CultureStore'
import { useDispatch } from 'react-redux'
import { setLoading } from '../../../redux/slices/mainSlice'
import * as Localization from 'expo-localization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const deviceWidth = Dimensions.get('window').width
const deviceHeight = Dimensions.get('window').height
const FIXED_BAR_WIDTH = 280
const BAR_SPACE = 10

let data = [{
    image: require('../../../assets/screens/account/appintro/AppIntro_PhoneFrame.png'),
    title: 'İş Teklifleri Alın',
    text: 'Size uygun güzergahları görüntüleyin, teklifler verin ve en uygun iş tekliflerini alın.'
},
{
    image: require('../../../assets/screens/account/appintro/AppIntro_PhoneFrame.png'),
    title: 'Yolcularınızı Bilgilendirin',
    text: 'Yolcularınız ile anlık konumunuzu paylaşın, otomatik bildirimler gönderin.'
},
{
    image: require('../../../assets/screens/account/appintro/AppIntro_PhoneFrame.png'),
    title: 'Faturalarınızı Kesin',
    text: 'Aylık veya günlük gelirinizi hesaplayın, takip edin ve faturalarınızı kesin.'
}]

let data_tr = [{
    image: require('../../../assets/screens/account/appintro/slider_1.png'),
    title: 'İş Teklifleri Alın',
    text: 'Size uygun güzergahları görüntüleyin, teklifler verin ve en uygun iş tekliflerini alın.'
},
{
    image: require('../../../assets/screens/account/appintro/slider_2.png'),
    title: 'Yolcularınızı Bilgilendirin',
    text: 'Yolcularınız ile anlık konumunuzu paylaşın, otomatik bildirimler gönderin.'
},
{
    image: require('../../../assets/screens/account/appintro/slider_3.png'),
    title: 'Faturalarınızı Kesin',
    text: 'Aylık veya günlük gelirinizi hesaplayın, takip edin ve faturalarınızı kesin.'
}]

let data_en = [{
    image: require('../../../assets/screens/account/appintro/slider_1.png'),
    title: 'Get Job Offers',
    text: 'View routes that suit you, submit offers and get the most suitable job offers.'
},
{
    image: require('../../../assets/screens/account/appintro/slider_2.png'),
    title: 'Notify Passengers',
    text: 'Share your instant location with your passengers, send automatic notifications.'
},
{
    image: require('../../../assets/screens/account/appintro/slider_3.png'),
    title: 'Bill Your Transfers',
    text: 'Calculate, track and invoice your monthly or daily income.'
}]

let data_de = [{
    image: require('../../../assets/screens/account/appintro/slider_1.png'),
    title: 'Stellenangebote erhalten',
    text: 'Zeigen Sie Routen an, die zu Ihnen passen, geben Sie Angebote ab und erhalten Sie die am besten geeigneten Stellenangebote.'
},
{
    image: require('../../../assets/screens/account/appintro/slider_2.png'),
    title: 'Fahrgäste benachrichtigen',
    text: 'Teilen Sie Ihren sofortigen Standort mit Ihren Passagieren, senden Sie automatische Benachrichtigungen.'
},
{
    image: require('../../../assets/screens/account/appintro/slider_3.png'),
    title: 'Schneiden Sie Ihre Rechnungen',
    text: 'Berechnen, verfolgen und stellen Sie Ihr monatliches oder tägliches Einkommen in Rechnung.'
}]

const Index = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const numItems = data.length
    const itemWidth = (FIXED_BAR_WIDTH / numItems) - ((numItems - 1) * BAR_SPACE)
    const animVal = new Animated.Value(0);
    let views = [];
    let barArray = [];
    const cultureStore = useCultureStore((state) => state);
    let flag = require('../../../assets/screens/account/appintro/tr.png');
    if (cultureStore.culture == "en") {
        data = data_en;
        flag = require('../../../assets/screens/account/appintro/en.png')
    }
    else if (cultureStore.culture == "tr") {
        data = data_tr;
        flag = require('../../../assets/screens/account/appintro/tr.png')
    }
    else if (cultureStore.culture == "de") {
        data = data_de;
        flag = require('../../../assets/screens/account/appintro/de.png')
    }
    else {
        data = data_tr;
        flag = require('../../../assets/screens/account/appintro/tr.png')
    }

    data.forEach((item, i) => {
        const view = (
            <View key={`viewContainer${i}`} style={styles.viewContainer}>
                <View key={`imageContainer${i}`} style={styles.imageContainer}>
                    <Image
                        key={`image${i}`}
                        source={item.image}
                        style={styles.image}
                    />
                </View>
                <View style={styles.textContainer}>
                    <VText bold style={styles.title}>{item.title}</VText>
                    <VText medium style={styles.text}>{item.text}</VText>
                </View>
            </View>

        )
        views.push(view)
        const scrollBarVal = animVal.interpolate({
            inputRange: [deviceWidth * (i - 1), deviceWidth * (i + 1)],
            outputRange: [-itemWidth, itemWidth],
            extrapolate: 'clamp',
        })

        const thisBar = (
            <View
                key={`bar${i}`}
                style={[
                    styles.track,
                    {
                        width: itemWidth,
                        marginLeft: i === 0 ? 0 : BAR_SPACE,
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.bar,
                        {
                            width: itemWidth,
                            transform: [
                                { translateX: scrollBarVal },
                            ],
                        },
                    ]}
                />
            </View>
        )
        barArray.push(thisBar)
    })

    useEffect(() => {
        dispatch(setLoading(true));
        const supportedLanguages = ['tr', 'en', 'de'];
        const defaultLanguage = 'tr';

        // const deviceLanguage = Localization.locale.split('-')[0];
        const deviceLanguage = (Localization?.locale ?? 'tr').split('-')[0];
        if (supportedLanguages.includes(deviceLanguage)) {
            // const selectLanguage = deviceLanguage == 'tr' ? 'tr-TR' : deviceLanguage == 'en' ? 'en-US' : deviceLanguage == 'ru' ? 'ru-RU' : deviceLanguage == 'ar' ? 'ar-XA' : deviceLanguage == 'fr' ? 'fr-FR' : 'tr-TR'
            cultureStore.setCulture(deviceLanguage);
            dispatch(setLoading(false));
        }
        else {
            cultureStore.setCulture(defaultLanguage);
            dispatch(setLoading(false));
        }
    }, []);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView>
                <View style={styles.cultureSelectorContainer}>
                    <TouchableOpacity style={styles.cultureSelectionButton} onPress={() => {
                        navigation.navigate('CultureSelection')
                    }}>
                        <VText bold style={{ fontSize: 12, color: Color.greyText, marginRight: 5 }}>{
                            cultureStore.culture == "tr" ? "Dil Seçimi:" :
                                cultureStore.culture == 'en' ? "Language:" :
                                    cultureStore.culture == 'de' ? 'Sprache:' :
                                        'Dil Seçimi:'}
                        </VText>
                        <Image width={24} height={17} source={flag}></Image>
                    </TouchableOpacity>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={10}
                    pagingEnabled
                    onScroll={
                        Animated.event([{ nativeEvent: { contentOffset: { x: animVal } } }], { useNativeDriver: false })
                    }>
                    {views}
                </ScrollView>
                <View style={styles.barContainer}>
                    <View style={{ alignItems: 'center', width: deviceWidth, flexDirection: 'row', justifyContent: 'center' }}>
                        {barArray}
                    </View>
                </View>
                <View style={{ position: 'absolute', bottom: 120, width: '100%', paddingHorizontal: 25 }}>
                    <View style={{ flex: 1, marginBottom: 10 }}>
                        <VButton primary onPress={() => { navigation.navigate('Login') }}>
                            <VText white bold style={{ fontSize: 17 }}>{
                                cultureStore.culture == "tr" ? "Telefon Numarası ile " :
                                    cultureStore.culture == 'en' ? "Phone Number" :
                                        cultureStore.culture == 'de' ? 'Telefonnummer' :
                                            'Telefon numarası ile giriş yapın'}
                            </VText>
                        </VButton>
                    </View>
                    <View style={{ flex: 1, }}>
                        <VButton style={{ backgroundColor: Color.white, borderColor: Color.purple, borderWidth: 1, }} onPress={() => { navigation.navigate('LoginPassword') }}>
                            <VText purple bold style={{ fontSize: 17, }}>{
                                cultureStore.culture == "tr" ? "Kullanıcı Adı ve Şifre ile" :
                                    cultureStore.culture == 'en' ? "Username and Password" :
                                        cultureStore.culture == 'de' ? 'Benutzername und Passwort' :
                                            'Kullanıcı adı ve şifre ile giriş yapın'}
                            </VText>
                        </VButton>
                    </View>

                </View>
            </ScrollView>
            <StatusBar backgroundColor={Color.base} barStyle='dark-content'></StatusBar>
        </View>
    )
}

export default Index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Color.base,
    },
    viewContainer: {
        height: deviceHeight - 60,
        width: deviceWidth,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Color.base
    },
    imageContainer: {
        height: (deviceHeight - 60) / 2,
        width: deviceWidth,
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: Color.base
    },
    image: {
        height: (deviceHeight / 2) - 40,
        width: undefined,
        aspectRatio: 1,
        resizeMode: 'contain',
    },
    textContainer: {
        alignItems: 'center',
        paddingTop: 30,
        height: (deviceHeight - 60) / 2,
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        paddingHorizontal: 25
    },
    title: {
        fontSize: 26,
        lineHeight: 36
    },
    text: {
        fontSize: 14,
        color: '#8F9598',
        lineHeight: 19,
        marginTop: 12,
        textAlign: 'center',
        paddingHorizontal: 15
    },
    barContainer: {
        position: 'absolute',
        zIndex: 2,
        top: ((deviceHeight) / 2) + 40,
        alignItems: 'center'

    },
    track: {
        backgroundColor: '#EDEDED',
        overflow: 'hidden',
        height: 2,
    },
    bar: {
        backgroundColor: '#000000',
        height: 2,
        position: 'absolute',
        left: 0,
        top: 0,
    },
    cultureSelectorContainer: {
        marginTop: 10,
        width: '100%',
        alignItems: 'flex-end',
        paddingHorizontal: 25,
    },
    cultureSelectionButton: {
        borderWidth: 1.5,
        borderRadius: 1000,
        flexDirection: 'row',
        justifyContent: 'center',
        width: 127,
        paddingVertical: 10,
        alignItems: 'center',
        borderColor: Color.greyBorder,
    }
})