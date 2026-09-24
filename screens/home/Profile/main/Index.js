import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert, Image, Linking, Modal, Platform, Pressable,
    RefreshControl, ScrollView, StyleSheet, TouchableOpacity, useWindowDimensions, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as TaskManager from 'expo-task-manager';
import Color from '../../../../components/Color';
import VText from '../../../../components/VText';
import MyCarComponent from '../../../../components/ProfilMain/MyCarComponent';
import MyCarsComponent from '../../../../components/ProfilMain/MyCarsComponent';
import Profile from '../../../../services/vita/Profile';
import useAuthStore from '../../../../zustand/AuthStore';
import useCultureStore from '../../../../zustand/CultureStore';
import useProfileStore from '../../../../zustand/ProfileStore';
import useResponseStore from '../../../../zustand/ResponseStore';
import profileCopy from './profileCopy';

const languages = {
    tr: { title: 'Türkçe', flag: require('../../../../assets/screens/account/appintro/tr.png') },
    en: { title: 'English', flag: require('../../../../assets/screens/account/appintro/en.png') },
    de: { title: 'Deutsch', flag: require('../../../../assets/screens/account/appintro/de.png') },
};

const MenuRow = ({ icon, title, subtitle, onPress, trailing, external, last }) => (
    <TouchableOpacity accessibilityRole="button" activeOpacity={0.65} onPress={onPress} style={styles.menuRow}>
        <View style={styles.menuIcon}><Feather name={icon} size={20} color={Color.primary} /></View>
        <View style={[styles.menuBody, !last && styles.menuBorder]}>
            <View style={styles.menuText}>
                <VText bold style={styles.menuTitle}>{title}</VText>
                {subtitle ? <VText style={styles.menuSubtitle}>{subtitle}</VText> : null}
            </View>
            {trailing}
            <Feather name={external ? 'arrow-up-right' : 'chevron-right'} size={18} color="#8992A3" />
        </View>
    </TouchableOpacity>
);

const ProfileStat = ({ value, label, star, bordered }) => (
    <View style={[styles.stat, bordered && styles.statBorder]}>
        <View style={styles.statValueRow}>
            {star && <MaterialCommunityIcons name="star" size={17} color="#F4C675" />}
            <VText bold style={styles.statValue}>{value}</VText>
        </View>
        <VText style={styles.statLabel}>{label}</VText>
    </View>
);

const Index = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();
    const isFocused = useIsFocused();
    const culture = useCultureStore((state) => state.culture);
    const profileChanged = useProfileStore((state) => state.change);
    const token = useAuthStore((state) => state.loginUser?.token);
    const logOut = useAuthStore((state) => state.logOut);
    const setRes401 = useResponseStore((state) => state.setRes401);
    const setResMessage = useResponseStore((state) => state.setResMessage);
    const t = profileCopy[culture] || profileCopy.tr;
    const language = languages[culture] || languages.tr;
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [photoModalVisible, setPhotoModalVisible] = useState(false);
    const [logoutVisible, setLogoutVisible] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [avatarFailed, setAvatarFailed] = useState(false);
    const pendingPhotoSource = useRef(null);
    const mounted = useRef(true);
    const requestId = useRef(0);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    const getProfile = useCallback(async () => {
        const currentRequest = ++requestId.current;
        try {
            const response = await Profile.Get(culture);
            if (!mounted.current || currentRequest !== requestId.current) return;
            const body = response?.data;
            const code = body?.responseCode ?? body?.ResponseCode;
            if (response?.status === 200 && code === 200 && body?.data) {
                setUser(body.data);
                setLoadError(false);
            } else if (code === 401) {
                setResMessage(body.responseMessage ?? body.ResponseMessage);
                setRes401(true);
                setLoadError(true);
            } else {
                setLoadError(true);
            }
        } catch (error) {
            if (!mounted.current || currentRequest !== requestId.current) return;
            if (error.response?.status === 401) {
                setResMessage(error.response.data?.responseMessage ?? error.response.data?.ResponseMessage);
                setRes401(true);
            }
            setLoadError(true);
        } finally {
            if (mounted.current && currentRequest === requestId.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    }, [culture, setRes401, setResMessage]);

    useEffect(() => { getProfile(); }, [getProfile, profileChanged]);
    useEffect(() => { setAvatarFailed(false); }, [user?.imagePath]);

    const refresh = () => {
        setRefreshing(true);
        getProfile();
    };

    const openSupport = async () => {
        try {
            await Linking.openURL('https://vitarnd.com');
        } catch {
            Alert.alert(t.supportHelp, t.supportError);
        }
    };

    const updatePhoto = async (source) => {
        try {
            if (source === 'camera') {
                const permission = await ImagePicker.requestCameraPermissionsAsync();
                if (!permission.granted) {
                    Alert.alert(t.changeProfilePhoto, t.cameraPermission);
                    return;
                }
            }
            const options = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 };
            const result = source === 'camera'
                ? await ImagePicker.launchCameraAsync(options)
                : await ImagePicker.launchImageLibraryAsync(options);
            if (result.canceled || !result.assets?.[0]?.uri) return;
            setUploading(true);
            const context = ImageManipulator.manipulate(result.assets[0].uri);
            context.resize({ width: 400, height: 400 });
            const renderedImage = await context.renderAsync();
            const photo = await renderedImage.saveAsync({ compress: 1, format: SaveFormat.JPEG });
            const formData = new FormData();
            formData.append('Photo', { uri: photo.uri, name: photo.uri.split('/').pop(), type: 'image/jpeg' });
            formData.append('uid', '');
            const response = await fetch('https://vitadrivetransferapi-test.vitarnd.com/UploadProfileImage_Async', {
                method: 'PUT', body: formData,
                headers: { Authorization: `Bearer ${token}`, 'Accept-Language': culture },
            });
            if (!response.ok) throw new Error('Profile photo upload failed');
            if (mounted.current) setUser((previous) => ({ ...previous, imagePath: photo.uri }));
        } catch {
            if (mounted.current) Alert.alert(t.failed, t.photoError);
        } finally {
            if (mounted.current) setUploading(false);
        }
    };

    // Wait for the iOS sheet to close before presenting the system image picker.
    const selectPhotoSource = (source) => {
        pendingPhotoSource.current = source;
        setPhotoModalVisible(false);
        if (Platform.OS !== 'ios') {
            pendingPhotoSource.current = null;
            updatePhoto(source);
        }
    };
    const onPhotoSheetDismiss = () => {
        const source = pendingPhotoSource.current;
        pendingPhotoSource.current = null;
        if (source) updatePhoto(source);
    };
    const userLogOut = () => {
        setLogoutVisible(false);
        TaskManager.unregisterAllTasksAsync().catch(() => {});
        logOut();
    };

    const vehicles = Array.isArray(user?.vehicles) ? user.vehicles.filter(Boolean) : [];
    const companies = Array.isArray(user?.companies) ? user.companies.filter(Boolean) : [];
    const selectedVehicle = vehicles.find((vehicle) => vehicle.isCurrent === true) || vehicles[0];
    const otherVehicles = vehicles.filter((vehicle) => vehicle !== selectedVehicle);
    const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || t.driver;
    const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'V';
    const rating = user?.rating === null || user?.rating === undefined || user?.rating === '' ? '—' : user.rating;
    const editProfile = () => navigation.navigate('PersonalInformation', { data: { user } });
    // The tab bar floats 30–34 points above the bottom of the screen.
    const bottomPadding = Math.max(insets.bottom + 100, 134);

    return (
        <View style={[styles.screen, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
            {isFocused && <StatusBar style="dark" />}
            <View style={styles.topBar}>
                <View style={styles.heading}>
                    <VText bold style={styles.eyebrow}>{t.account}</VText>
                    <VText bold style={styles.screenTitle}>{t.myProfile}</VText>
                </View>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={t.supportHelp} onPress={openSupport} style={styles.helpButton}>
                    <Feather name="help-circle" size={23} color="#34354D" />
                </TouchableOpacity>
            </View>

            {!user ? (
                <View style={[styles.initialState, { paddingBottom: bottomPadding }]}>
                    {loading ? <ActivityIndicator size="large" color={Color.primary} /> : (
                        <>
                            <View style={styles.emptyIcon}><Feather name="wifi-off" size={26} color={Color.primary} /></View>
                            <VText bold style={styles.emptyTitle}>{t.loadError}</VText>
                            <VText style={styles.emptySubtitle}>{t.connectionHint}</VText>
                            <TouchableOpacity accessibilityRole="button" style={styles.primaryButton} onPress={() => { setLoading(true); getProfile(); }}>
                                <VText bold style={styles.primaryButtonText}>{t.retry}</VText>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            ) : (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Color.primary} colors={[Color.primary]} />}
                >
                    <VText style={styles.screenSubtitle}>{t.profileSubtitle}</VText>
                    {loadError && (
                        <TouchableOpacity accessibilityRole="button" onPress={refresh} style={styles.refreshError}>
                            <Feather name="refresh-cw" size={17} color={Color.primary} />
                            <VText style={styles.refreshErrorText}>{t.loadError} {t.retry}</VText>
                        </TouchableOpacity>
                    )}
                    <View style={styles.heroCard}>
                        <View pointerEvents="none" style={styles.heroOrbit} />
                        <View style={styles.heroRow}>
                            <TouchableOpacity
                                accessibilityRole="button" accessibilityLabel={uploading ? t.uploading : t.changeProfilePhoto}
                                accessibilityState={{ disabled: uploading, busy: uploading }} disabled={uploading}
                                activeOpacity={0.8} onPress={() => setPhotoModalVisible(true)} style={styles.avatarWrapper}
                            >
                                {user.imagePath && !avatarFailed ? (
                                    <Image source={{ uri: user.imagePath }} style={styles.avatarImage} onError={() => setAvatarFailed(true)} />
                                ) : (
                                    <View style={styles.avatarFallback}><VText bold style={styles.avatarInitials}>{initials}</VText></View>
                                )}
                                <View style={styles.cameraBadge}>
                                    {uploading ? <ActivityIndicator size="small" color={Color.primary} /> : <Feather name="camera" size={14} color={Color.primary} />}
                                </View>
                            </TouchableOpacity>
                            <View style={styles.heroInfo}>
                                <View style={styles.driverRow}>
                                    <MaterialCommunityIcons name="steering" size={14} color="#CEC8FF" />
                                    <VText semiBold style={styles.driverLabel}>{t.driver}</VText>
                                </View>
                                <VText bold style={styles.userName}>{fullName}</VText>
                                <TouchableOpacity accessibilityRole="button" onPress={editProfile} style={styles.editProfile} activeOpacity={0.7}>
                                    <VText semiBold style={styles.editProfileText}>{t.editProfile}</VText>
                                    <Feather name="arrow-up-right" size={15} color="#DED9FF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.statsRow}>
                            <ProfileStat star value={rating} label={t.rating} />
                            <ProfileStat bordered value={vehicles.length} label={t.vehicles} />
                            <ProfileStat bordered value={companies.length} label={t.companies} />
                        </View>
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionHeading}>
                                <VText bold style={styles.sectionTitle}>{t.myCars}</VText>
                                <View style={styles.countBadge}><VText bold style={styles.countText}>{vehicles.length}</VText></View>
                            </View>
                            {vehicles.length > 0 && (
                                <TouchableOpacity accessibilityRole="button" onPress={() => navigation.navigate('CarChange', { data: { vehicles } })} style={styles.sectionAction}>
                                    <Feather name="repeat" size={14} color={Color.primary} />
                                    <VText bold style={styles.sectionActionText}>{t.change}</VText>
                                </TouchableOpacity>
                            )}
                        </View>
                        {selectedVehicle ? (
                            <MyCarComponent navigation={navigation} item={selectedVehicle} cultureResource={t} />
                        ) : (
                            <View style={styles.emptyCard}>
                                <View style={styles.emptyIcon}><MaterialCommunityIcons name="car-outline" size={27} color={Color.primary} /></View>
                                <VText bold style={styles.emptyTitle}>{t.noVehicles}</VText>
                                <VText style={styles.emptySubtitle}>{t.noVehiclesSub}</VText>
                            </View>
                        )}
                        {otherVehicles.length > 0 && (
                            <>
                                <VText semiBold style={styles.otherVehiclesLabel}>{t.otherVehicles}</VText>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.otherVehicles}>
                                    {otherVehicles.map((item, index) => <MyCarsComponent key={item.id ?? item.plate ?? index} item={item} cultureResource={t} navigation={navigation} />)}
                                </ScrollView>
                            </>
                        )}
                    </View>

                    <View style={styles.section}>
                        <View style={styles.sectionHeader}><VText bold style={styles.sectionTitle}>{t.accountSettings}</VText></View>
                        <View style={styles.menuCard}>
                            <MenuRow icon="user" title={t.myPersonalInformations} subtitle={t.personalInfoSub} onPress={editProfile} />
                            <MenuRow icon="file-text" title={t.myDocuments} subtitle={t.documentsSub} onPress={() => navigation.navigate('MyDocuments', { data: { user } })} />
                            <MenuRow icon="briefcase" title={t.institutionsIServe} subtitle={t.companiesSub} onPress={() => navigation.navigate('ServeCompany', { data: { companies } })} last />
                        </View>
                    </View>
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}><VText bold style={styles.sectionTitle}>{t.preferences}</VText></View>
                        <View style={styles.menuCard}>
                            <MenuRow icon="globe" title={t.languageSelect} subtitle={language.title} trailing={<Image source={language.flag} style={styles.flag} />} onPress={() => navigation.navigate('CultureSelection')} />
                            <MenuRow icon="help-circle" title={t.supportHelp} subtitle={t.supportSub} onPress={openSupport} external last />
                        </View>
                    </View>
                    <TouchableOpacity accessibilityRole="button" activeOpacity={0.7} onPress={() => setLogoutVisible(true)} style={styles.logoutButton}>
                        <Feather name="log-out" size={18} color="#B44750" />
                        <VText bold style={styles.logoutText}>{t.logout}</VText>
                    </TouchableOpacity>
                    <View style={styles.footer}>
                        <VText bold style={styles.footerBrand}>vitaDrive <VText style={styles.footerProduct}>Transfer</VText></VText>
                        <VText style={styles.footerVersion}>{t.appVersion} {Constants.expoConfig?.version ?? '—'}</VText>
                        <VText style={styles.footerCompany}>vita RnD Teknoloji A.Ş. · info@vitarnd.com</VText>
                    </View>
                </ScrollView>
            )}

            <Modal visible={photoModalVisible} transparent animationType="slide" onRequestClose={() => setPhotoModalVisible(false)} onDismiss={onPhotoSheetDismiss}>
                <View style={styles.sheetBackdrop}>
                    <Pressable accessibilityRole="button" accessibilityLabel={t.close} style={StyleSheet.absoluteFill} onPress={() => setPhotoModalVisible(false)} />
                    <View accessibilityViewIsModal style={[styles.sheet, { maxHeight: windowHeight - insets.top - 20, paddingBottom: Math.max(insets.bottom, 20) }]}>
                        <ScrollView style={styles.modalScroll} bounces={false}>
                            <View style={styles.sheetHandle} />
                            <View style={styles.sheetHeading}>
                                <VText bold style={styles.sheetTitle}>{t.changeProfilePhoto}</VText>
                                <TouchableOpacity accessibilityRole="button" accessibilityLabel={t.close} onPress={() => setPhotoModalVisible(false)} style={styles.closeButton}>
                                    <Feather name="x" size={21} color="#6B778C" />
                                </TouchableOpacity>
                            </View>
                            <MenuRow icon="camera" title={t.takeAPhoto} subtitle={t.takePhotoSub} onPress={() => selectPhotoSource('camera')} />
                            <MenuRow icon="image" title={t.chooseFromLibrary} subtitle={t.choosePhotoSub} onPress={() => selectPhotoSource('library')} last />
                            <TouchableOpacity accessibilityRole="button" onPress={() => setPhotoModalVisible(false)} style={styles.cancelButton}>
                                <VText bold style={styles.cancelText}>{t.canceled}</VText>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal visible={logoutVisible} transparent animationType="fade" onRequestClose={() => setLogoutVisible(false)}>
                <View style={[styles.dialogBackdrop, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
                    <View accessibilityViewIsModal style={[styles.dialog, { maxHeight: windowHeight - insets.top - insets.bottom - 40 }]}>
                        <ScrollView style={styles.modalScroll} bounces={false}>
                            <View style={styles.logoutDialogIcon}><Feather name="log-out" size={26} color="#B44750" /></View>
                            <VText bold style={styles.dialogTitle}>{t.logout}</VText>
                            <VText style={styles.dialogMessage}>{t.logOutText}</VText>
                            <TouchableOpacity accessibilityRole="button" onPress={userLogOut} style={styles.confirmLogout}>
                                <VText bold style={styles.primaryButtonText}>{t.logout}</VText>
                            </TouchableOpacity>
                            <TouchableOpacity accessibilityRole="button" onPress={() => setLogoutVisible(false)} style={styles.cancelButton}>
                                <VText bold style={styles.cancelText}>{t.canceled}</VText>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Index;

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F5F6FA' },
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 16, paddingBottom: 8 },
    heading: { flex: 1, paddingRight: 12 },
    eyebrow: { fontSize: 10, letterSpacing: 2.2, color: '#78758C', marginBottom: 4 },
    screenTitle: { fontSize: 30, letterSpacing: -0.9, color: '#182230' },
    helpButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EBF2', alignItems: 'center', justifyContent: 'center' },
    scrollView: { flex: 1 },
    scrollContent: { paddingTop: 0 },
    screenSubtitle: { fontSize: 14, lineHeight: 21, color: '#6B778C', marginHorizontal: 22, marginBottom: 22 },
    heroCard: { marginHorizontal: 20, borderRadius: 24, backgroundColor: '#29263F', padding: 20, overflow: 'hidden' },
    heroOrbit: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 28, borderColor: 'rgba(177, 160, 255, 0.055)', top: -90, right: -58 },
    heroRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
    avatarWrapper: { width: 76, height: 76, marginRight: 17 },
    avatarImage: { width: 76, height: 76, borderRadius: 26, borderWidth: 2, borderColor: '#6A617F', backgroundColor: '#4B4462' },
    avatarFallback: { width: 76, height: 76, borderRadius: 26, borderWidth: 2, borderColor: '#6A617F', backgroundColor: '#4B4462', alignItems: 'center', justifyContent: 'center' },
    avatarInitials: { color: '#F5F0FF', fontSize: 26 },
    cameraBadge: { position: 'absolute', right: -4, bottom: -3, width: 28, height: 28, borderRadius: 14, borderWidth: 3, borderColor: '#29263F', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    heroInfo: { flex: 1, minWidth: 0 },
    driverRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
    driverLabel: { color: '#CEC8FF', fontSize: 12 },
    userName: { color: '#FFFFFF', fontSize: 23, lineHeight: 29, letterSpacing: -0.5 },
    editProfile: { minHeight: 44, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 7, paddingTop: 4 },
    editProfileText: { fontSize: 12, color: '#DED9FF' },
    statsRow: { flexDirection: 'row', paddingTop: 19, marginTop: 17, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
    stat: { flex: 1, alignItems: 'center', paddingHorizontal: 5 },
    statBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.12)' },
    statValueRow: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 26 },
    statValue: { color: '#FFFFFF', fontSize: 19 },
    statLabel: { color: '#C4BFD6', fontSize: 11, textAlign: 'center', marginTop: 3 },
    section: { marginTop: 25 },
    sectionHeader: { marginHorizontal: 22, marginBottom: 12, minHeight: 30, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 1 },
    sectionTitle: { fontSize: 17, color: '#182230', letterSpacing: -0.3, flexShrink: 1 },
    countBadge: { minWidth: 23, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: '#E9E6FA', alignItems: 'center' },
    countText: { fontSize: 11, color: '#6456C6' },
    sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingLeft: 8 },
    sectionActionText: { fontSize: 12, color: Color.primary },
    otherVehiclesLabel: { fontSize: 12, color: '#6B778C', marginHorizontal: 22, marginTop: 18, marginBottom: 10 },
    otherVehicles: { paddingHorizontal: 20, paddingBottom: 2 },
    menuCard: { marginHorizontal: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E8EBF2', borderRadius: 20, overflow: 'hidden' },
    menuRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 15 },
    menuIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#F0EEFF', alignItems: 'center', justifyContent: 'center', marginRight: 13 },
    menuBody: { flex: 1, flexDirection: 'row', alignItems: 'center', minHeight: 82, paddingVertical: 17, paddingRight: 15, gap: 10 },
    menuBorder: { borderBottomWidth: 1, borderBottomColor: '#EFF0F5' },
    menuText: { flex: 1, minWidth: 0 },
    menuTitle: { color: '#263244', fontSize: 14, lineHeight: 20 },
    menuSubtitle: { color: '#6B778C', fontSize: 12, lineHeight: 18, marginTop: 3 },
    flag: { width: 22, height: 16, borderRadius: 3, resizeMode: 'contain' },
    logoutButton: { marginHorizontal: 20, marginTop: 24, minHeight: 54, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#EADFE3', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 9 },
    logoutText: { fontSize: 14, color: '#B44750' },
    footer: { alignItems: 'center', paddingTop: 28, paddingHorizontal: 20 },
    footerBrand: { fontSize: 17, color: '#7B7B91', letterSpacing: -0.4 },
    footerProduct: { fontSize: 17, color: '#9392A4' },
    footerVersion: { marginTop: 5, fontSize: 11, color: '#797F91' },
    footerCompany: { marginTop: 8, fontSize: 10, color: '#797F91', textAlign: 'center' },
    initialState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
    emptyCard: { marginHorizontal: 20, padding: 24, borderRadius: 20, borderWidth: 1, borderColor: '#E8EBF2', backgroundColor: '#FFFFFF', alignItems: 'center' },
    emptyIcon: { width: 58, height: 58, borderRadius: 18, backgroundColor: '#F0EEFF', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
    emptyTitle: { fontSize: 16, color: '#182230', textAlign: 'center' },
    emptySubtitle: { fontSize: 13, lineHeight: 20, color: '#6B778C', marginTop: 7, textAlign: 'center' },
    refreshError: { marginHorizontal: 20, marginBottom: 14, padding: 14, borderRadius: 12, backgroundColor: '#F0EEFF', flexDirection: 'row', alignItems: 'center', gap: 10 },
    refreshErrorText: { fontSize: 12, color: '#6456C6', flex: 1 },
    primaryButton: { marginTop: 20, backgroundColor: Color.primary, minHeight: 48, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    primaryButtonText: { fontSize: 14, color: '#FFFFFF', textAlign: 'center' },
    sheetBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18, 22, 36, 0.48)' },
    modalScroll: { flexGrow: 0, flexShrink: 1 },
    sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 10, paddingHorizontal: 20 },
    sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: '#DBDDE7', alignSelf: 'center', marginBottom: 17 },
    sheetHeading: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, gap: 12 },
    sheetTitle: { flex: 1, fontSize: 21, color: '#182230', letterSpacing: -0.5 },
    closeButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F5F6FA', alignItems: 'center', justifyContent: 'center' },
    cancelButton: { minHeight: 50, padding: 14, justifyContent: 'center', alignItems: 'center', borderRadius: 14, backgroundColor: '#F5F6FA', marginTop: 12 },
    cancelText: { fontSize: 14, color: '#596376', textAlign: 'center' },
    dialogBackdrop: { flex: 1, justifyContent: 'center', paddingHorizontal: 26, backgroundColor: 'rgba(18, 22, 36, 0.48)' },
    dialog: { backgroundColor: '#FFFFFF', borderRadius: 26, padding: 24, width: '100%', maxWidth: 420, alignSelf: 'center' },
    logoutDialogIcon: { alignSelf: 'center', width: 60, height: 60, borderRadius: 20, backgroundColor: '#FBEEF0', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
    dialogTitle: { color: '#182230', fontSize: 22, textAlign: 'center' },
    dialogMessage: { color: '#6B778C', fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 10, marginBottom: 22 },
    confirmLogout: { minHeight: 50, padding: 14, borderRadius: 14, backgroundColor: '#B44750', justifyContent: 'center', alignItems: 'center' },
});
