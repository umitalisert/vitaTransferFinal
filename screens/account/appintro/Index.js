import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    Modal,
    Platform,
    Pressable,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Localization from 'expo-localization';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import Color from '../../../components/Color';
import VText from '../../../components/VText';
import { setLoading } from '../../../redux/slices/mainSlice';
import useCultureStore from '../../../zustand/CultureStore';

/* ------------------------------------------------------------------ */
/* İÇERİK                                                              */
/* ------------------------------------------------------------------ */

const SLIDES = {
    tr: [
        {
            id: 'slide_1',
            tag: 'Güzergah & Teklif',
            tagUpper: 'GÜZERGAH & TEKLİF',
            icon: 'routes',
            title: 'İş Teklifleri Alın',
            text: 'Size en uygun transfer güzergahlarını anında görüntüleyin, hızlıca teklif verin ve kazancınızı artırın.',
            image: require('../../../assets/screens/account/appintro/slider_1.png'),
        },
        {
            id: 'slide_2',
            tag: 'Canlı İletişim & Takip',
            tagUpper: 'CANLI İLETİŞİM & TAKİP',
            icon: 'phone-in-talk',
            title: 'Yolcularınızı Bilgilendirin',
            text: 'Anlık konumunuzu ve varış sürenizi yolcunuzla paylaşın, tek dokunuşla iletişime geçerek kusursuz bir transfer sunun.',
            image: require('../../../assets/screens/account/appintro/slider_2.png'),
        },
        {
            id: 'slide_3',
            tag: 'Dijital Ödeme & Fatura',
            tagUpper: 'DİJİTAL ÖDEME & FATURA',
            icon: 'qrcode-scan',
            title: 'Faturalarınızı ve Gelirinizi Yönetin',
            text: 'QR kod ve temassız yöntemlerle ödemeleri anında alın, günlük ve aylık gelirinizi takip edip faturalarınızı kesin.',
            image: require('../../../assets/screens/account/appintro/slider_3.png'),
        },
    ],
    en: [
        {
            id: 'slide_1',
            tag: 'Routes & Offers',
            tagUpper: 'ROUTES & OFFERS',
            icon: 'routes',
            title: 'Get Job Offers',
            text: 'View tailored transfer routes instantly, submit quick offers, and maximize your revenue.',
            image: require('../../../assets/screens/account/appintro/slider_1.png'),
        },
        {
            id: 'slide_2',
            tag: 'Live Tracking & Contact',
            tagUpper: 'LIVE TRACKING & CONTACT',
            icon: 'phone-in-talk',
            title: 'Notify Passengers',
            text: 'Share real-time location and arrival time with passengers, call with one tap, and deliver a 5-star ride.',
            image: require('../../../assets/screens/account/appintro/slider_2.png'),
        },
        {
            id: 'slide_3',
            tag: 'Digital Payment & Billing',
            tagUpper: 'DIGITAL PAYMENT & BILLING',
            icon: 'qrcode-scan',
            title: 'Manage Invoices & Payments',
            text: 'Collect payments via QR or contactless, monitor your daily and monthly income, and bill with ease.',
            image: require('../../../assets/screens/account/appintro/slider_3.png'),
        },
    ],
    de: [
        {
            id: 'slide_1',
            tag: 'Routen & Angebote',
            tagUpper: 'ROUTEN & ANGEBOTE',
            icon: 'routes',
            title: 'Stellenangebote erhalten',
            text: 'Passende Transferrouten sofort einsehen, Angebote abgeben und Ihren Verdienst steigern.',
            image: require('../../../assets/screens/account/appintro/slider_1.png'),
        },
        {
            id: 'slide_2',
            tag: 'Live-Tracking & Kontakt',
            tagUpper: 'LIVE-TRACKING & KONTAKT',
            icon: 'phone-in-talk',
            title: 'Fahrgäste benachrichtigen',
            text: 'Live-Standort und Ankunftszeit mit Fahrgästen teilen, mit einem Klick anrufen und erstklassigen Service bieten.',
            image: require('../../../assets/screens/account/appintro/slider_2.png'),
        },
        {
            id: 'slide_3',
            tag: 'Digitale Zahlung & Rechnung',
            tagUpper: 'DIGITALE ZAHLUNG & RECHNUNG',
            icon: 'qrcode-scan',
            title: 'Rechnungen & Einnahmen verwalten',
            text: 'Zahlungen sofort per QR-Code oder kontaktlos erhalten, Einnahmen verfolgen und Rechnungen mühelos erstellen.',
            image: require('../../../assets/screens/account/appintro/slider_3.png'),
        },
    ],
};

const LANGUAGES = {
    tr: {
        code: 'TR',
        label: 'Türkçe',
        flag: require('../../../assets/screens/account/appintro/tr.png'),
    },
    en: {
        code: 'EN',
        label: 'English',
        flag: require('../../../assets/screens/account/appintro/en.png'),
    },
    de: {
        code: 'DE',
        label: 'Deutsch',
        flag: require('../../../assets/screens/account/appintro/de.png'),
    },
};

const UI_TEXTS = {
    tr: {
        brandTag: 'SÜRÜCÜ & TRANSFER',
        languageSheetTitle: 'Dil Seçimi',
        close: 'Kapat',
        loginPhone: 'Telefon Numarası ile Giriş',
        loginPassword: 'Kullanıcı Adı ve Şifre ile Giriş',
    },
    en: {
        brandTag: 'DRIVER & TRANSFER',
        languageSheetTitle: 'Select Language',
        close: 'Close',
        loginPhone: 'Sign in with Phone Number',
        loginPassword: 'Sign in with Username & Password',
    },
    de: {
        brandTag: 'FAHRER & TRANSFER',
        languageSheetTitle: 'Sprache auswählen',
        close: 'Schließen',
        loginPhone: 'Mit Telefonnummer anmelden',
        loginPassword: 'Mit Benutzername & Passwort',
    },
};

const LANGUAGE_KEYS = Object.keys(LANGUAGES);
const SUPPORTED_LANGUAGES = LANGUAGE_KEYS;

/* ------------------------------------------------------------------ */
/* TASARIM TOKENLARI                                                   */
/* ------------------------------------------------------------------ */

const C = {
    canvas: Color.white,            // #FFFFFF — illüstrasyonlar açık zeminli
    ink900: '#0B0F19',              // başlık / wordmark
    ink700: Color.dark,             // #404C5B — sheet satır etiketi
    ink500: '#6B7280',              // gövde metni (4.83:1)
    ink300: '#9AA1AE',              // dekoratif ikon
    accent: Color.primary,          // #7162EC — buton + gösterge
    accentInk: '#5A4BD4',           // 11px kicker (6.19:1)
    accentPressed: '#6355D8',
    hairline: '#ECEEF2',
    border: '#DCE0EA',              // ikincil buton kenarlığı (görünür ama sessiz)
    rail: '#D7DCE9',
    backdrop: 'rgba(11,15,25,0.35)',
    pressTint: 'rgba(11,15,25,0.03)',
    flagEdge: 'rgba(11,15,25,0.10)',
};

// slider_1..3.png mürekkep (alfa > 8) birleşik sınır kutusu — ölçülmüş değer.
// Yeni bir slider eklenirse bu kutu yeniden ölçülmeli.
const ART = { W: 1176, H: 1338, x: 74, y: 231, w: 1076, h: 995 };
const ART_FIT = 0.97;

const HEADER_H = 44;
const PAGER_H = 44;
const BTN_GAP = 12;
const PAGER_CELL = 44;              // dokunma hücresi (>= 44pt)
const PAGER_SEG = 28;               // görünen segment
const PAGER_SEG_H = 3;
const PAGER_INSET = (PAGER_CELL - PAGER_SEG) / 2;
const KICKER_LH = 14;
const BREATH = 24;

// Tek Animated.Value üzerinden kademeli giriş (yalnız opacity + translateY)
const stage = (value, from, to, dy) => ({
    opacity: value.interpolate({ inputRange: [from, to], outputRange: [0, 1], extrapolate: 'clamp' }),
    transform: [
        { translateY: value.interpolate({ inputRange: [from, to], outputRange: [dy, 0], extrapolate: 'clamp' }) },
    ],
});

/* ------------------------------------------------------------------ */
/* EKRAN                                                               */
/* ------------------------------------------------------------------ */

const AppIntro = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const cultureStore = useCultureStore((state) => state);
    const culture = cultureStore.culture || 'tr';

    const currentLang = LANGUAGES[culture] || LANGUAGES.tr;
    const currentSlides = SLIDES[culture] || SLIDES.tr;
    const ui = UI_TEXTS[culture] || UI_TEXTS.tr;

    const { width: W, height: H } = useWindowDimensions();
    const SMALL = H < 700;
    const GUTTER = W < 380 ? 24 : 28;
    const PRIMARY_H = SMALL ? 54 : 56;
    const SECONDARY_H = SMALL ? 50 : 52;
    const TOP_PAD = (insets.top > 0 ? insets.top : 12) + (Platform.OS === 'android' ? 10 : 6);
    const BOTTOM_PAD = Math.max(insets.bottom, 12) + 16;

    const scrollRef = useRef(null);
    const scrollX = useRef(new Animated.Value(0)).current;
    const enter = useRef(new Animated.Value(0)).current;
    const dialogAnim = useRef(new Animated.Value(0)).current;
    const pressAnim = useRef(new Animated.Value(0)).current;

    const [activeIndex, setActiveIndex] = useState(0);
    const activeRef = useRef(0);
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    /* --- ÖLÇÜ MATEMATİĞİ (dikey bütçe + mürekkep kutusu fit'i) ------- */
    const m = useMemo(() => {
        const titleLh = SMALL ? 32 : 38;
        const bodyLh = SMALL ? 22 : 26;
        const stackGap = SMALL ? 8 : 10;    // kicker -> başlık (sıkı bağ)
        const titleGap = SMALL ? 12 : 16;   // başlık -> gövde (hiyerarşiyi açan boşluk)
        const artGap = SMALL ? 20 : 28;
        const pagerGap = SMALL ? 4 : 8;

        // Metin bloğu yüksekliği tipografi yığınından türetilir (elle sabit değil).
        const textH = KICKER_LH + stackGap + titleLh * 2 + titleGap + bodyLh * 3;

        const wrapperH =
            H
            - (TOP_PAD + HEADER_H)
            - (PAGER_H + pagerGap)
            - (PRIMARY_H + BTN_GAP + SECONDARY_H + BOTTOM_PAD);

        const free = wrapperH - textH - artGap - BREATH;
        const boxW = Math.max(1, W - GUTTER * 2);
        const boxH = Math.max(150, Math.min(free, Math.round(H * 0.34), 340));

        // Görüntüyü değil, ÇİZİMİ kutuya oturt: mürekkep kutusu ortalanır,
        // kalan saydam kenarlar overflow:'hidden' ile kırpılır.
        const scale = Math.min(boxW / ART.w, boxH / ART.h) * ART_FIT;

        return {
            titleLh,
            bodyLh,
            stackGap,
            titleGap,
            artGap,
            pagerGap,
            textH,
            boxH,
            imgW: Math.round(ART.W * scale),
            imgH: Math.round(ART.H * scale),
            imgLeft: Math.round(boxW / 2 - (ART.x + ART.w / 2) * scale),
            imgTop: Math.round(boxH / 2 - (ART.y + ART.h / 2) * scale),
            parallax: Math.round(W * 0.05),
        };
    }, [W, H, SMALL, GUTTER, PRIMARY_H, SECONDARY_H, TOP_PAD, BOTTOM_PAD]);

    /* --- Mount: cihaz dili algılama + loading akışı ------------------ */
    useEffect(() => {
        dispatch(setLoading(true));
        try {
            const deviceLanguage = (Localization.getLocales?.()[0]?.languageCode ?? 'tr')
                .split('-')[0]
                .toLowerCase();
            if (!cultureStore.culture) {
                if (SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
                    cultureStore.setCulture(deviceLanguage);
                } else {
                    cultureStore.setCulture('tr');
                }
            }
        } catch {
            // sessiz devam
        } finally {
            dispatch(setLoading(false));
        }
    }, []);

    /* --- Giriş animasyonu ------------------------------------------- */
    useEffect(() => {
        Animated.timing(enter, {
            toValue: 1,
            duration: 480,
            delay: 80,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [enter]);

    /* --- Rotasyon / split-view: sayfa ofsetini tazele ---------------- */
    useEffect(() => {
        const x = activeRef.current * W;
        scrollRef.current?.scrollTo({ x, animated: false });
        scrollX.setValue(x);
    }, [W, scrollX]);

    /* --- Sheet giriş animasyonu (her açılışta sıfırlanır) ------------ */
    useEffect(() => {
        if (!languageModalVisible) return;
        dialogAnim.setValue(0);
        Animated.timing(dialogAnim, {
            toValue: 1,
            duration: 240,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [languageModalVisible, dialogAnim]);

    const enterHeader = useMemo(() => stage(enter, 0, 0.4, 10), [enter]);
    const enterCarousel = useMemo(() => stage(enter, 0.12, 0.62, 18), [enter]);
    const enterPager = useMemo(() => stage(enter, 0.28, 0.78, 10), [enter]);
    const enterActions = useMemo(() => stage(enter, 0.4, 1, 10), [enter]);

    const thumbX = useMemo(
        () => scrollX.interpolate({
            inputRange: [0, W, 2 * W],
            outputRange: [0, PAGER_CELL, PAGER_CELL * 2],
            extrapolate: 'clamp',
        }),
        [scrollX, W],
    );

    const primaryScale = useMemo(
        () => pressAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.98] }),
        [pressAnim],
    );

    const setIndex = (index) => {
        activeRef.current = index;
        setActiveIndex(index);
    };

    const onMomentumScrollEnd = (e) => {
        const page = Math.round(e.nativeEvent.contentOffset.x / W);
        if (page !== activeRef.current) setIndex(page);
    };

    const goToSlide = (index) => {
        scrollRef.current?.scrollTo({ x: index * W, animated: true });
        setIndex(index);
    };

    const onPrimaryPressIn = () =>
        Animated.spring(pressAnim, { toValue: 1, speed: 40, bounciness: 0, useNativeDriver: true }).start();
    const onPrimaryPressOut = () =>
        Animated.spring(pressAnim, { toValue: 0, speed: 26, bounciness: 6, useNativeDriver: true }).start();

    const selectLanguage = (langKey) => {
        // Önce dili yaz, sonra kapat: metin yenilenmesi kapanış fade'i altında maskelenir.
        cultureStore.setCulture(langKey);
        setLanguageModalVisible(false);
    };

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

            {/* 1 — KÜNYE */}
            <Animated.View
                style={[{ paddingTop: TOP_PAD, paddingHorizontal: GUTTER }, enterHeader]}
            >
                <View style={s.headerRow}>
                    <VText bold style={s.wordmark}>vitaDrive</VText>

                    <Pressable
                        onPress={() => setLanguageModalVisible(true)}
                        hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                        accessibilityRole="button"
                        accessibilityLabel={currentLang.label}
                        style={({ pressed }) => [s.langTrigger, { opacity: pressed ? 0.55 : 1 }]}
                    >
                        <View style={s.flagSm}>
                            <Image source={currentLang.flag} style={s.flagImg} resizeMode="cover" fadeDuration={0} />
                        </View>
                        <VText bold style={s.langCode}>{currentLang.code}</VText>
                        <MaterialCommunityIcons name="chevron-down" size={16} color={C.ink300} />
                    </Pressable>
                </View>
            </Animated.View>

            {/* 2 — KARUSEL (yalnız illüstrasyon + metin kayar) */}
            <Animated.View style={[s.carousel, enterCarousel]}>
                <Animated.ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    bounces={false}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={onMomentumScrollEnd}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: true },
                    )}
                >
                    {currentSlides.map((slide, i) => {
                        const range = [(i - 1) * W, i * W, (i + 1) * W];

                        const textStyle = {
                            opacity: scrollX.interpolate({
                                inputRange: range,
                                outputRange: [0, 1, 0],
                                extrapolate: 'clamp',
                            }),
                            transform: [{
                                translateY: scrollX.interpolate({
                                    inputRange: range,
                                    outputRange: [14, 0, 14],
                                    extrapolate: 'clamp',
                                }),
                            }],
                        };

                        const artStyle = {
                            transform: [{
                                translateX: scrollX.interpolate({
                                    inputRange: range,
                                    outputRange: [-m.parallax, 0, m.parallax],
                                    extrapolate: 'clamp',
                                }),
                            }],
                        };

                        return (
                            <View
                                key={slide.id || `slide-${i}`}
                                style={[s.slide, { width: W, paddingHorizontal: GUTTER }]}
                            >
                                <View style={[s.artBox, { height: m.boxH }]}>
                                    <Animated.View style={[StyleSheet.absoluteFill, artStyle]} pointerEvents="none">
                                        <Image
                                            source={slide.image}
                                            style={{
                                                position: 'absolute',
                                                left: m.imgLeft,
                                                top: m.imgTop,
                                                width: m.imgW,
                                                height: m.imgH,
                                            }}
                                            resizeMode="contain"
                                            fadeDuration={0}
                                        />
                                    </Animated.View>
                                </View>

                                <Animated.View
                                    style={[s.textBlock, { marginTop: m.artGap, minHeight: m.textH }, textStyle]}
                                >
                                    <VText
                                        bold
                                        numberOfLines={1}
                                        style={[s.kicker, { marginBottom: m.stackGap }]}
                                    >
                                        {slide.tagUpper || slide.tag}
                                    </VText>

                                    <View style={{ minHeight: m.titleLh * 2 }}>
                                        <VText
                                            bold
                                            numberOfLines={2}
                                            style={[s.title, {
                                                fontSize: SMALL ? 26 : 32,
                                                lineHeight: m.titleLh,
                                                letterSpacing: SMALL ? -0.6 : -0.9,
                                            }]}
                                        >
                                            {slide.title}
                                        </VText>
                                    </View>

                                    <VText
                                        numberOfLines={3}
                                        style={[s.body, {
                                            marginTop: m.titleGap,
                                            fontSize: SMALL ? 15 : 16,
                                            lineHeight: m.bodyLh,
                                        }]}
                                    >
                                        {slide.text}
                                    </VText>
                                </Animated.View>
                            </View>
                        );
                    })}
                </Animated.ScrollView>
            </Animated.View>

            {/* 3 — SESSİZ GÖSTERGE (ScrollView'in DIŞINDA: kaydırırken kıpırdamaz) */}
            <Animated.View
                style={[
                    s.pager,
                    {
                        width: PAGER_CELL * currentSlides.length,
                        marginBottom: m.pagerGap,
                    },
                    enterPager,
                ]}
            >
                {currentSlides.map((_, i) => (
                    <Pressable
                        key={`pager-${i}`}
                        onPress={() => goToSlide(i)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: activeIndex === i }}
                        style={s.pagerCell}
                    >
                        <View style={s.pagerSeg} />
                    </Pressable>
                ))}
                <Animated.View
                    pointerEvents="none"
                    style={[s.pagerThumb, { transform: [{ translateX: thumbX }] }]}
                />
            </Animated.View>

            {/* 4 — AKSİYONLAR (ScrollView'in DIŞINDA: tek piksel oynamaz) */}
            <Animated.View
                style={[s.actions, { paddingHorizontal: GUTTER, paddingBottom: BOTTOM_PAD }, enterActions]}
            >
                <Animated.View
                    style={[s.primaryShadow, { height: PRIMARY_H, transform: [{ scale: primaryScale }] }]}
                >
                    <Pressable
                        onPress={() => navigation.navigate('Login')}
                        onPressIn={onPrimaryPressIn}
                        onPressOut={onPrimaryPressOut}
                        accessibilityRole="button"
                        accessibilityLabel={ui.loginPhone}
                        android_ripple={{ color: 'rgba(255,255,255,0.14)' }}
                        style={({ pressed }) => [
                            s.primary,
                            { backgroundColor: pressed ? C.accentPressed : C.accent },
                        ]}
                    >
                        <VText bold numberOfLines={1} style={s.primaryLabel}>{ui.loginPhone}</VText>
                    </Pressable>
                </Animated.View>

                <Pressable
                    onPress={() => navigation.navigate('LoginPassword')}
                    accessibilityRole="button"
                    accessibilityLabel={ui.loginPassword}
                    android_ripple={{ color: 'rgba(11,15,25,0.06)' }}
                    style={({ pressed }) => [
                        s.secondary,
                        { height: SECONDARY_H, backgroundColor: pressed ? C.pressTint : C.canvas },
                    ]}
                >
                    <VText semiBold numberOfLines={1} style={s.secondaryLabel}>{ui.loginPassword}</VText>
                </Pressable>
            </Animated.View>

            {/* 5 — DİL SEÇİMİ */}
            <Modal
                visible={languageModalVisible}
                transparent
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View style={s.overlay}>
                    <Pressable style={s.backdrop} onPress={() => setLanguageModalVisible(false)} />

                    <Animated.View
                        style={[
                            s.dialog,
                            {
                                opacity: dialogAnim,
                                transform: [{
                                    scale: dialogAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.94, 1],
                                    }),
                                }],
                            },
                        ]}
                    >
                        <VText bold style={s.dialogTitle}>{ui.languageSheetTitle}</VText>

                        <View accessibilityRole="radiogroup">
                            {LANGUAGE_KEYS.map((langKey, i) => {
                                const lang = LANGUAGES[langKey];
                                const isSelected = culture === langKey;
                                return (
                                    <Pressable
                                        key={langKey}
                                        onPress={() => selectLanguage(langKey)}
                                        accessibilityRole="radio"
                                        accessibilityState={{ selected: isSelected }}
                                        accessibilityLabel={lang.label}
                                        style={({ pressed }) => [
                                            s.langRow,
                                            i < LANGUAGE_KEYS.length - 1 && s.langRowDivider,
                                            { backgroundColor: pressed ? C.pressTint : 'transparent' },
                                        ]}
                                    >
                                        <View style={s.langRowLeft}>
                                            <View style={s.flagLg}>
                                                <Image
                                                    source={lang.flag}
                                                    style={s.flagImg}
                                                    resizeMode="cover"
                                                    fadeDuration={0}
                                                />
                                            </View>
                                            <VText
                                                semiBold={isSelected}
                                                style={[s.langLabel, isSelected && s.langLabelActive]}
                                            >
                                                {lang.label}
                                            </VText>
                                        </View>
                                        {isSelected && (
                                            <MaterialCommunityIcons name="check" size={20} color={C.accent} />
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>

                        <Pressable
                            onPress={() => setLanguageModalVisible(false)}
                            accessibilityRole="button"
                            accessibilityLabel={ui.close}
                            android_ripple={{ color: 'rgba(11,15,25,0.06)' }}
                            style={({ pressed }) => [
                                s.dialogCloseBtn,
                                { backgroundColor: pressed ? C.pressTint : 'transparent' },
                            ]}
                        >
                            <VText semiBold style={s.dialogCloseLabel}>{ui.close}</VText>
                        </Pressable>

                        <Pressable
                            onPress={() => setLanguageModalVisible(false)}
                            hitSlop={{ top: 10, left: 10, right: 10, bottom: 10 }}
                            accessibilityRole="button"
                            accessibilityLabel={ui.close}
                            style={({ pressed }) => [
                                s.dialogCloseIcon,
                                { backgroundColor: pressed ? C.pressTint : 'transparent' },
                            ]}
                        >
                            <MaterialCommunityIcons name="close" size={20} color={C.ink300} />
                        </Pressable>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};

export default AppIntro;

/* ------------------------------------------------------------------ */
/* STİLLER                                                             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.canvas,
    },

    /* 1 — künye */
    headerRow: {
        height: HEADER_H,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    wordmark: {
        fontSize: 18,
        lineHeight: 22,
        letterSpacing: -0.3,
        color: C.ink900,
    },
    langTrigger: {
        height: HEADER_H,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 6,
        paddingLeft: 8,
        paddingRight: 4,
    },
    langCode: {
        fontSize: 13,
        lineHeight: 16,
        letterSpacing: 0.2,
        color: C.ink900,
    },

    /* bayraklar — de.png alfasız olduğu için yuvarlatma kapsayıcıda */
    flagSm: {
        width: 20,
        height: 14,
        borderRadius: 3,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: C.flagEdge,
    },
    flagLg: {
        width: 26,
        height: 18,
        borderRadius: 3,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: C.flagEdge,
        marginRight: 14,
    },
    flagImg: {
        width: '100%',
        height: '100%',
    },

    /* 2 — karusel */
    carousel: {
        flex: 1,
        justifyContent: 'center',
    },
    slide: {
        justifyContent: 'center',
    },
    artBox: {
        width: '100%',
        overflow: 'hidden',
        flexShrink: 1,
    },
    textBlock: {
        alignSelf: 'stretch',
        alignItems: 'flex-start',
    },
    kicker: {
        fontSize: 11,
        lineHeight: KICKER_LH,
        letterSpacing: 1.3,
        color: C.accentInk,
        textAlign: 'left',
    },
    title: {
        color: C.ink900,
        textAlign: 'left',
    },
    body: {
        letterSpacing: -0.1,
        color: C.ink500,
        maxWidth: 336,
        textAlign: 'left',
    },

    /* 3 — gösterge */
    pager: {
        height: PAGER_H,
        alignSelf: 'center',
        flexDirection: 'row',
    },
    pagerCell: {
        width: PAGER_CELL,
        height: PAGER_H,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pagerSeg: {
        width: PAGER_SEG,
        height: PAGER_SEG_H,
        borderRadius: PAGER_SEG_H / 2,
        backgroundColor: C.rail,
    },
    pagerThumb: {
        position: 'absolute',
        left: PAGER_INSET,
        top: (PAGER_H - PAGER_SEG_H) / 2,
        width: PAGER_SEG,
        height: PAGER_SEG_H,
        borderRadius: PAGER_SEG_H / 2,
        backgroundColor: C.accent,
    },

    /* 4 — aksiyonlar */
    actions: {
        alignItems: 'stretch',
    },
    primaryShadow: {
        borderRadius: 16,
        backgroundColor: C.accent,
        shadowColor: C.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 3,
    },
    primary: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    primaryLabel: {
        fontSize: 16,
        lineHeight: 20,
        letterSpacing: 0.1,
        color: Color.white,
        textAlign: 'center',
    },
    secondary: {
        marginTop: BTN_GAP,
        borderRadius: 16,
        overflow: 'hidden',         // Android ripple'ı yuvarlatılmış kenarın içinde tutar
        borderWidth: 1,
        borderColor: C.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryLabel: {
        // Nötr ton: mor yalnız kicker + gösterge + ana butonda kalsın (8.7:1)
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: -0.1,
        color: C.ink700,
    },

    /* 5 — dil diyaloğu (ekran ortasında) */
    overlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: C.backdrop,
    },
    dialog: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: C.canvas,
        borderRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 8,
        shadowColor: C.ink900,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.16,
        shadowRadius: 28,
        elevation: 16,
    },
    dialogTitle: {
        fontSize: 17,
        lineHeight: 22,
        letterSpacing: -0.2,
        color: C.ink900,
        textAlign: 'center',
        paddingHorizontal: 36,
        marginBottom: 12,
    },
    dialogCloseIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogCloseBtn: {
        height: 50,
        marginTop: 4,
        marginHorizontal: -20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: C.hairline,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogCloseLabel: {
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: -0.1,
        color: C.ink700,
    },
    langRow: {
        height: 56,
        marginHorizontal: -20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    langRowDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.hairline,
    },
    langRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    langLabel: {
        fontSize: 16,
        lineHeight: 20,
        letterSpacing: -0.1,
        color: C.ink700,
    },
    langLabelActive: {
        color: C.ink900,
    },
});
