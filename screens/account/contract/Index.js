import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Linking,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useDispatch } from 'react-redux';
import moment from 'moment';
import Color from '../../../components/Color';
import VText from '../../../components/VText';
import Auth from '../../../services/vita/Auth';
import useMainStore from '../../../zustand/MainStore';
import useCultureStore from '../../../zustand/CultureStore';
import useAuthStore from '../../../zustand/AuthStore';
import { setErrorMessage, setHasError } from '../../../redux/slices/mainSlice';

/* ------------------------------------------------------------------ */
/* BELGE ADRESLERİ                                                     */
/* ------------------------------------------------------------------ */
// Boş bırakılan adres tıklanabilir link yerine düz metin olarak çizilir,
// yani ekran bozulmaz. Adresleri girdiğinizde satırlar kendiliğinden açılır.
const LINKS = {
    userAgreement: '',
    privacy: '',
};

/* ------------------------------------------------------------------ */
/* İÇERİK — hukuki cümleler birebir korundu                            */
/* ------------------------------------------------------------------ */

const T = {
    tr: {
        back: 'Geri',
        screenTitle: 'Kullanıcı Sözleşmesi ve KVKK',
        vitaCompany: 'vita RnD Teknoloji Anonim Şirketi (“vita RnD")',
        serveVita: ', ürünü olan "vita Drive- Transfer” uygulaması ile sürücü ve araç sahiplerine iş takibi ve planlama hizmeti sunmaktadır.',
        docsLead: 'vita RnD olarak sunduğumuz ürünle ilişkili olarak aşağıdaki belgelere ulaşabilirsiniz:',
        docUserTitle: 'Kullanıcı Sözleşmesi',
        docUserNote: 'Hizmet kullanım koşulları',
        docPrivacyTitle: 'Gizlilik ve Kişisel Verilerin Korunması Politikası',
        docPrivacyNote: '6698 sayılı KVKK uyarınca hazırlanan aydınlatma bildirimi',
        consentTitle: 'Onaylar',
        text4: 'vita RnD olarak sunduğumuz ürünle ilişkili olarak "Kullanıcı Sözleşmesi”ni kabul ettiğimi kabul, beyan ve taahhüt ederim.',
        text5: 'Kişisel verilerimin işlenmesine ilişkin, "vita RnD Gizlilik ve Kişisel Verilerin Korunması Politikası"nı okuduğumu, kişisel verilerimin işlenmesine ve aktarılmasına ilişkin bilgilendirmeyi anladığımı kabul ve beyan ederim.',
        hint: 'Devam etmek için her iki onayı da işaretleyin.',
        goOn: 'Devam Et',
        linkError: 'Belge açılamadı. Lütfen daha sonra tekrar deneyin.',
    },
    en: {
        back: 'Back',
        screenTitle: 'Terms of Service & Privacy',
        vitaCompany: 'vita RnD Technology Inc. (“vita RnD")',
        serveVita: 'The "vita Drive-Transfer" application, which features the X product, provides job tracking and planning services to drivers and vehicle owners.',
        docsLead: 'In relation to the product we offer as vita RnD, you can access the following documents:',
        docUserTitle: 'Terms of Service',
        docUserNote: 'Conditions of use for the service',
        docPrivacyTitle: 'Privacy and Personal Data Protection Policy',
        docPrivacyNote: 'Notice prepared under Law No. 6698 on the Protection of Personal Data (KVKK)',
        consentTitle: 'Consents',
        text4: 'I acknowledge, declare, and commit that I accept the "User Agreement" related to the product offered by vita RnD.',
        text5: 'I acknowledge and declare that I have read the "vita RnD Privacy and Personal Data Protection Policy" regarding the processing of my personal data, and I understand the information regarding the processing and transfer of my personal data.',
        hint: 'Please tick both consents to continue.',
        goOn: 'Continue',
        linkError: 'The document could not be opened. Please try again later.',
    },
    de: {
        back: 'Zurück',
        screenTitle: 'Nutzungsbedingungen & Datenschutz',
        vitaCompany: 'vita RnD Technologie AG (“vita RnD")',
        serveVita: 'Die Anwendung "vita Drive-Transfer", die das Produkt X enthält, bietet Fahrern und Fahrzeughaltern Dienstleistungen für die Arbeitsverfolgung und Planung an.',
        docsLead: 'Im Zusammenhang mit dem Produkt, das wir als vita RnD anbieten, können Sie auf die folgenden Dokumente zugreifen:',
        docUserTitle: 'Nutzungsbedingungen',
        docUserNote: 'Bedingungen für die Nutzung des Dienstes',
        docPrivacyTitle: 'Datenschutz- und Datenschutzrichtlinie',
        docPrivacyNote: 'Hinweis gemäß dem Gesetz Nr. 6698 zum Schutz personenbezogener Daten (KVKK)',
        consentTitle: 'Zustimmungen',
        text4: 'Ich erkenne an, erkläre und verpflichte mich, dass ich die "Nutzungsbedingungen" im Zusammenhang mit dem von vita RnD angebotenen Produkt akzeptiere',
        text5: 'Ich erkenne an und erkläre, dass ich die "vita RnD-Datenschutz- und Datenschutzrichtlinie" in Bezug auf die Verarbeitung meiner persönlichen Daten gelesen habe und die Informationen über die Verarbeitung und Übertragung meiner persönlichen Daten verstehe.',
        hint: 'Bitte bestätigen Sie beide Zustimmungen, um fortzufahren.',
        goOn: 'Fortsetzen',
        linkError: 'Das Dokument konnte nicht geöffnet werden. Bitte versuchen Sie es später erneut.',
    },
};

/* ------------------------------------------------------------------ */
/* TASARIM TOKENLARI (AppIntro / LoginPassword ile aynı ölçek)         */
/* ------------------------------------------------------------------ */

const C = {
    canvas: Color.white,
    ink900: '#0B0F19',
    ink700: Color.dark,             // #404C5B
    ink500: '#6B7280',
    ink300: '#9AA1AE',
    accent: Color.primary,          // #7162EC
    accentPressed: '#6355D8',
    accentSoft: 'rgba(113,98,236,0.06)',
    border: '#DCE0EA',
    hairline: '#ECEEF2',
    surface: '#F8F9FC',
    disabledBg: '#EEF0F5',
    disabledInk: '#A3AAB8',
    pressTint: 'rgba(11,15,25,0.04)',
};

const BTN_H = 56;

/* ------------------------------------------------------------------ */
/* BELGE SATIRI                                                        */
/* ------------------------------------------------------------------ */

const DocRow = ({ icon, title, note, url, onOpen, divider }) => {
    const tappable = !!url;
    const Row = (
        <>
            <View style={s.docIcon}>
                <MaterialCommunityIcons name={icon} size={18} color={C.accent} />
            </View>
            <View style={s.docText}>
                <VText semiBold style={s.docTitle}>{title}</VText>
                <VText style={s.docNote}>{note}</VText>
            </View>
            {tappable && (
                <MaterialCommunityIcons name="open-in-new" size={18} color={C.ink300} />
            )}
        </>
    );

    if (!tappable) {
        return <View style={[s.docRow, divider && s.docDivider]}>{Row}</View>;
    }

    return (
        <Pressable
            onPress={() => onOpen(url)}
            accessibilityRole="link"
            accessibilityLabel={title}
            style={({ pressed }) => [
                s.docRow,
                divider && s.docDivider,
                { backgroundColor: pressed ? C.pressTint : 'transparent' },
            ]}
        >
            {Row}
        </Pressable>
    );
};

/* ------------------------------------------------------------------ */
/* ONAY SATIRI                                                         */
/* ------------------------------------------------------------------ */

const ConsentRow = ({ checked, onToggle, label }) => (
    <Pressable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        accessibilityLabel={label}
        style={({ pressed }) => [
            s.consentRow,
            checked && s.consentRowChecked,
            pressed && { backgroundColor: C.pressTint },
        ]}
    >
        <View style={[s.checkbox, checked && s.checkboxChecked]}>
            {checked && <MaterialCommunityIcons name="check" size={15} color={Color.white} />}
        </View>
        <VText style={s.consentText}>{label}</VText>
    </Pressable>
);

/* ------------------------------------------------------------------ */
/* EKRAN                                                               */
/* ------------------------------------------------------------------ */

export const Index = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const mainStore = useMainStore((state) => state);
    const cultureStore = useCultureStore((state) => state);
    const authStore = useAuthStore((state) => state);

    const culture = cultureStore.culture || 'tr';
    const t = T[culture] || T.tr;

    const [isUserChecked, setUserChecked] = useState(false);
    const [isKvkkChecked, setKvkkChecked] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const enter = useRef(new Animated.Value(0)).current;

    const bothChecked = isUserChecked && isKvkkChecked;
    const canSubmit = bothChecked && !submitting;

    moment.locale(culture);

    useEffect(() => {
        Animated.timing(enter, {
            toValue: 1,
            duration: 420,
            delay: 60,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [enter]);

    const enterStyle = useMemo(
        () => ({
            opacity: enter,
            transform: [
                { translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
            ],
        }),
        [enter],
    );

    const openDocument = (url) => {
        Linking.openURL(url).catch(() => {
            dispatch(setHasError(true));
            dispatch(setErrorMessage(t.linkError));
        });
    };

    function send() {
        if (!canSubmit) return;
        setSubmitting(true);

        // Push token kaydı bilgilendirme amaçlı; başarısız olsa da giriş engellenmez.
        Auth.UpdateExpoToken_Async({ token: mainStore.pushToken }).catch(() => { });
        authStore.setIsAuthenticated(true);
    }

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

            {/* 1 — BAŞLIK ÇUBUĞU */}
            <View style={[s.headerBar, { paddingTop: (insets.top > 0 ? insets.top : 12) + 4 }]}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 8, left: 8, right: 8, bottom: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={t.back}
                    style={({ pressed }) => [
                        s.backBtn,
                        { backgroundColor: pressed ? C.pressTint : 'transparent' },
                    ]}
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color={C.ink900} />
                </Pressable>
            </View>

            <ScrollView
                style={s.flex}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Animated.View style={enterStyle}>
                    {/* 2 — BAŞLIK + GİRİŞ */}
                    <VText bold style={s.title}>{t.screenTitle}</VText>

                    <VText style={s.intro}>
                        <VText semiBold style={s.introStrong}>{t.vitaCompany}</VText>
                        {t.serveVita}
                    </VText>

                    {/* 3 — BELGELER */}
                    <VText style={s.docsLead}>{t.docsLead}</VText>

                    <View style={s.docCard}>
                        <DocRow
                            icon="file-document-outline"
                            title={t.docUserTitle}
                            note={t.docUserNote}
                            url={LINKS.userAgreement}
                            onOpen={openDocument}
                            divider
                        />
                        <DocRow
                            icon="shield-lock-outline"
                            title={t.docPrivacyTitle}
                            note={t.docPrivacyNote}
                            url={LINKS.privacy}
                            onOpen={openDocument}
                        />
                    </View>

                    {/* 4 — ONAYLAR */}
                    <VText semiBold style={s.sectionLabel}>{t.consentTitle}</VText>

                    <ConsentRow
                        checked={isUserChecked}
                        onToggle={() => setUserChecked((v) => !v)}
                        label={t.text4}
                    />
                    <ConsentRow
                        checked={isKvkkChecked}
                        onToggle={() => setKvkkChecked((v) => !v)}
                        label={t.text5}
                    />
                </Animated.View>
            </ScrollView>

            {/* 5 — AKSİYON */}
            <View style={[s.actions, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
                {!bothChecked && (
                    <VText style={s.hint}>{t.hint}</VText>
                )}
                <Pressable
                    onPress={send}
                    disabled={!canSubmit}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !canSubmit }}
                    accessibilityLabel={t.goOn}
                    android_ripple={canSubmit ? { color: 'rgba(255,255,255,0.14)' } : undefined}
                    style={({ pressed }) => [
                        s.primary,
                        bothChecked && s.primaryEnabled,
                        {
                            backgroundColor: !bothChecked
                                ? C.disabledBg
                                : pressed
                                    ? C.accentPressed
                                    : C.accent,
                        },
                    ]}
                >
                    <VText
                        bold
                        numberOfLines={1}
                        style={[s.primaryLabel, !bothChecked && s.primaryLabelDisabled]}
                    >
                        {t.goOn}
                    </VText>
                </Pressable>
            </View>
        </View>
    );
};

export default Index;

/* ------------------------------------------------------------------ */
/* STİLLER                                                             */
/* ------------------------------------------------------------------ */

const s = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.canvas,
    },
    flex: {
        flex: 1,
    },

    /* 1 — başlık çubuğu */
    headerBar: {
        paddingHorizontal: 24,
        paddingBottom: 4,
    },
    backBtn: {
        width: 44,
        height: 44,
        marginLeft: -10,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },

    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 28,
    },

    /* 2 — başlık + giriş */
    title: {
        marginTop: 8,
        fontSize: 28,
        lineHeight: 34,
        letterSpacing: -0.8,
        color: C.ink900,
    },
    intro: {
        marginTop: 14,
        fontSize: 15,
        lineHeight: 23,
        letterSpacing: -0.1,
        color: C.ink500,
    },
    introStrong: {
        color: C.ink700,
    },

    /* 3 — belgeler */
    docsLead: {
        marginTop: 24,
        fontSize: 15,
        lineHeight: 23,
        letterSpacing: -0.1,
        color: C.ink500,
    },
    docCard: {
        marginTop: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.surface,
        overflow: 'hidden',
    },
    docRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 14,
        minHeight: 64,
    },
    docDivider: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: C.border,
    },
    docIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: C.accentSoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    docText: {
        flex: 1,
        paddingRight: 8,
    },
    docTitle: {
        fontSize: 15,
        lineHeight: 20,
        letterSpacing: -0.2,
        color: C.ink900,
    },
    docNote: {
        marginTop: 2,
        fontSize: 13,
        lineHeight: 18,
        color: C.ink500,
    },

    /* 4 — onaylar */
    sectionLabel: {
        marginTop: 28,
        marginBottom: 10,
        fontSize: 13,
        lineHeight: 16,
        letterSpacing: 0.1,
        color: C.ink700,
    },
    consentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 14,
        paddingHorizontal: 14,
        marginBottom: 10,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.canvas,
    },
    consentRowChecked: {
        borderColor: C.accent,
        backgroundColor: C.accentSoft,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: C.border,
        backgroundColor: C.canvas,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 1,
    },
    checkboxChecked: {
        borderColor: C.accent,
        backgroundColor: C.accent,
    },
    consentText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 21,
        letterSpacing: -0.1,
        color: C.ink700,
    },

    /* 5 — aksiyon */
    actions: {
        paddingHorizontal: 24,
        paddingTop: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: C.hairline,
        backgroundColor: C.canvas,
    },
    hint: {
        marginBottom: 8,
        fontSize: 13,
        lineHeight: 18,
        color: C.ink500,
        textAlign: 'center',
    },
    primary: {
        height: BTN_H,
        borderRadius: 16,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    primaryEnabled: {
        shadowColor: C.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
        elevation: 3,
    },
    primaryLabel: {
        fontSize: 16,
        lineHeight: 20,
        letterSpacing: 0.1,
        color: Color.white,
        textAlign: 'center',
    },
    primaryLabelDisabled: {
        color: C.disabledInk,
    },
});
