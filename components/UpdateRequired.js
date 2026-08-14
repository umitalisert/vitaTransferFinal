import React from 'react'
import { View, Image, Linking, Platform, StyleSheet } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Constants from 'expo-constants'
import VText from './VText'
import VButton from './VButton'
import Color from './Color'
import useCultureStore from '../zustand/CultureStore'

const storeUrl = Platform.select({
    ios: 'itms-apps://itunes.apple.com/app/id1667275115',
    android: 'market://details?id=com.vitarnd.vitaDrive.Transfer',
})
const webUrl = Platform.select({
    ios: 'https://apps.apple.com/tr/app/vitadrive-transfer/id1667275115',
    android: 'https://play.google.com/store/apps/details?id=com.vitarnd.vitaDrive.Transfer',
})

const UpdateRequired = ({ latestVersion }) => {
    const cultureStore = useCultureStore((state) => state)
    const currentVersion = Constants.expoConfig?.version

    const culture_tr = {
        title: 'Yeni Sürüm Yayında',
        description: 'Uygulamayı kullanmaya devam edebilmek ve yeni özelliklerden yararlanabilmek için lütfen en son sürüme güncelleyin.',
        currentVersion: 'Mevcut Sürüm',
        newVersion: 'Yeni Sürüm',
        update: 'Şimdi Güncelle',
        note: 'Güncelleme yalnızca birkaç dakikanızı alacaktır.',
    }
    const culture_en = {
        title: 'New Version Available',
        description: 'Please update to the latest version to continue using the app and benefit from the new features.',
        currentVersion: 'Current Version',
        newVersion: 'New Version',
        update: 'Update Now',
        note: 'The update will only take a few minutes.',
    }
    const culture_de = {
        title: 'Neue Version verfügbar',
        description: 'Bitte aktualisieren Sie auf die neueste Version, um die App weiterhin nutzen und von den neuen Funktionen profitieren zu können.',
        currentVersion: 'Aktuelle Version',
        newVersion: 'Neue Version',
        update: 'Jetzt aktualisieren',
        note: 'Die Aktualisierung dauert nur wenige Minuten.',
    }
    const cultureResource = (cultureStore.culture == 'tr' ? culture_tr : cultureStore.culture == 'en' ? culture_en : cultureStore.culture == 'de' ? culture_de : culture_tr);

    const openStore = async () => {
        try {
            const supported = await Linking.canOpenURL(storeUrl);
            if (supported) {
                await Linking.openURL(storeUrl);
            } else {
                await Linking.openURL(webUrl);
            }
        } catch (error) {
            await Linking.openURL(webUrl);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconWrapper}>
                    <Image source={require('../assets/iconApp.png')} style={styles.appIcon} />
                    <View style={styles.badge}>
                        <MaterialCommunityIcons name="arrow-up-bold" size={16} color={Color.white} />
                    </View>
                </View>

                <VText bold style={styles.title}>{cultureResource.title}</VText>
                <VText greyText medium style={styles.description}>{cultureResource.description}</VText>

                <View style={styles.versionCard}>
                    <View style={styles.versionColumn}>
                        <VText greyText medium style={styles.versionLabel}>{cultureResource.currentVersion}</VText>
                        <VText darkGrey bold style={styles.versionValue}>{currentVersion}</VText>
                    </View>
                    <MaterialCommunityIcons name="arrow-right" size={20} color={Color.greyText} />
                    <View style={styles.versionColumn}>
                        <VText greyText medium style={styles.versionLabel}>{cultureResource.newVersion}</VText>
                        <VText purple bold style={styles.versionValue}>{latestVersion}</VText>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <VButton primary onPress={openStore} style={styles.button}>
                    <View style={styles.buttonInner}>
                        <MaterialCommunityIcons name="cloud-download-outline" size={20} color={Color.white} />
                        <VText white bold style={styles.buttonText}>{cultureResource.update}</VText>
                    </View>
                </VButton>
                <VText greyText style={styles.note}>{cultureResource.note}</VText>
            </View>
        </View>
    )
}

export default UpdateRequired

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.white,
        paddingTop: Constants.statusBarHeight,
        paddingHorizontal: 30,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWrapper: {
        marginBottom: 30,
    },
    appIcon: {
        width: 92,
        height: 92,
        borderRadius: 22,
    },
    badge: {
        position: 'absolute',
        right: -8,
        top: -8,
        backgroundColor: Color.green,
        borderRadius: 100,
        padding: 5,
        borderWidth: 3,
        borderColor: Color.white,
    },
    title: {
        fontSize: 23,
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 23,
        marginBottom: 30,
    },
    versionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        alignSelf: 'stretch',
        backgroundColor: Color.greyLight,
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 10,
    },
    versionColumn: {
        alignItems: 'center',
    },
    versionLabel: {
        fontSize: 13,
        marginBottom: 4,
    },
    versionValue: {
        fontSize: 17,
    },
    footer: {
        paddingBottom: 40,
    },
    button: {
        padding: 16,
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        marginLeft: 8,
    },
    note: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 15,
    },
})
