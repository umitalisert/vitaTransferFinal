import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    TextInput,
    View,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import * as Device from 'expo-device';
import Color from '../../../components/Color';
import VText from '../../../components/VText';
import { setLoading, setHasError, setErrorMessage } from '../../../redux/slices/mainSlice';
import AuthPassword from '../../../services/vita/AuthPassword';
import useCultureStore from '../../../zustand/CultureStore';
import useAuthStore from '../../../zustand/AuthStore';

/* ------------------------------------------------------------------ */
/* İÇERİK                                                              */
/* ------------------------------------------------------------------ */

const T = {
    tr: {
        back: 'Geri',
        title: 'Kullanıcı Adı ve Şifre Girin',
        subtitle: 'Kullanıcı adı ve şifrenizle giriş yapın. Şifrenizi profil sekmesinin kişisel bilgiler bölümünden değiştirebilirsiniz.',
        userLabel: 'Kullanıcı adı',
        codePlaceholder: '+90',
        userPlaceholder: '5301112233',
        passwordLabel: 'Şifre',
        passwordPlaceholder: 'Şifrenizi girin',
        showPassword: 'Şifreyi göster',
        hidePassword: 'Şifreyi gizle',
        submit: 'Devam Et',
        genericError: 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
    },
    en: {
        back: 'Back',
        title: 'Enter Username and Password',
        subtitle: 'Sign in with your username and password. You can change your password under Personal Information in the Profile tab.',
        userLabel: 'Username',
        codePlaceholder: '+90',
        userPlaceholder: '5301112233',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        showPassword: 'Show password',
        hidePassword: 'Hide password',
        submit: 'Continue',
        genericError: 'An unexpected error occured. Please try again later.',
    },
    de: {
        back: 'Zurück',
        title: 'Benutzername und Passwort eingeben',
        subtitle: 'Melden Sie sich mit Ihrem Benutzernamen und Passwort an. Ihr Passwort können Sie im Profil-Tab unter Persönliche Daten ändern.',
        userLabel: 'Benutzername',
        codePlaceholder: '+90',
        userPlaceholder: '5301112233',
        passwordLabel: 'Passwort',
        passwordPlaceholder: 'Passwort eingeben',
        showPassword: 'Passwort anzeigen',
        hidePassword: 'Passwort verbergen',
        submit: 'Fortsetzen',
        genericError: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
    },
};

/* ------------------------------------------------------------------ */
/* TASARIM TOKENLARI (AppIntro ile aynı ölçek)                         */
/* ------------------------------------------------------------------ */

const C = {
    canvas: Color.white,
    ink900: '#0B0F19',              // başlık
    ink700: Color.dark,             // #404C5B — alan etiketi / girdi metni
    ink500: '#6B7280',              // açıklama metni (4.83:1)
    ink300: '#9AA1AE',              // placeholder / pasif ikon
    accent: Color.primary,          // #7162EC
    accentPressed: '#6355D8',
    accentRing: 'rgba(113,98,236,0.05)',
    border: '#DCE0EA',              // girdi kenarlığı (boşta)
    hairline: '#ECEEF2',
    disabledBg: '#EEF0F5',
    disabledInk: '#A3AAB8',
    pressTint: 'rgba(11,15,25,0.04)',
};

const FIELD_H = 54;
const BTN_H = 56;

/* ------------------------------------------------------------------ */
/* ALAN BİLEŞENİ                                                       */
/* ------------------------------------------------------------------ */

const Field = React.forwardRef(function Field(
    { focused, onFocus, onBlur, style, right, ...input },
    ref,
) {
    return (
        <View
            style={[
                s.field,
                focused && s.fieldFocused,
                style,
            ]}
        >
            <TextInput
                ref={ref}
                placeholderTextColor={C.ink300}
                selectionColor={C.accent}
                underlineColorAndroid="transparent"
                onFocus={onFocus}
                onBlur={onBlur}
                style={s.input}
                {...input}
            />
            {right}
        </View>
    );
});

/* ------------------------------------------------------------------ */
/* EKRAN                                                               */
/* ------------------------------------------------------------------ */

const Index = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const cultureStore = useCultureStore((state) => state);
    const authStore = useAuthStore((state) => state);

    const culture = cultureStore.culture || 'tr';
    const t = T[culture] || T.tr;

    const [countryCode, setCountryCode] = useState('+90');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const enter = useRef(new Animated.Value(0)).current;

    const formFilled = phoneNumber.trim().length > 0 && password.length > 0;
    const canSubmit = formFilled && !submitting;

    useEffect(() => {
        dispatch(setLoading(false));
    }, []);

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
                {
                    translateY: enter.interpolate({
                        inputRange: [0, 1],
                        outputRange: [12, 0],
                    }),
                },
            ],
        }),
        [enter],
    );

    const fail = (message) => {
        dispatch(setHasError(true));
        dispatch(setErrorMessage(message || t.genericError));
        dispatch(setLoading(false));
        setSubmitting(false);
    };

    function login() {
        if (!canSubmit) return;

        Keyboard.dismiss();
        setSubmitting(true);

        const request = {
            phoneNumber: phoneNumber,
            dialCode: countryCode.replace('+', ''),
            password: password,
            brandName: Device.brand,
            modelName: Device.modelName,
            osVersion: Device.osVersion,
            osInternalBuildId: Device.osInternalBuildId,
            deviceName: Device.deviceName,
        };

        AuthPassword.Token(request, culture)
            .then((response) => {
                if (response.status == 200 && response.data.responseCode == 200) {
                    authStore.setLoginUser(response.data.data);
                    setSubmitting(false);
                    dispatch(setLoading(false));
                    navigation.navigate('Contract', { token: response.data.data.token });
                } else if (response.status == 200) {
                    fail(response.data.responseMessage);
                } else {
                    fail(t.genericError);
                }
            })
            // Ağ hatası / 4xx-5xx: eskiden sessizce yutuluyordu, kullanıcı boş ekranda kalıyordu.
            .catch((err) => {
                fail(err?.response?.data?.responseMessage);
            });
    }

    return (
        <View style={s.root}>
            <StatusBar barStyle="dark-content" backgroundColor={C.canvas} />

            <KeyboardAvoidingView
                style={s.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    style={s.flex}
                    contentContainerStyle={[
                        s.scrollContent,
                        { paddingTop: (insets.top > 0 ? insets.top : 12) + 4 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="interactive"
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    <Animated.View style={enterStyle}>
                        {/* 1 — GERİ */}
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

                        {/* 2 — BAŞLIK */}
                        <VText bold style={s.title}>{t.title}</VText>
                        <VText style={s.subtitle}>{t.subtitle}</VText>

                        {/* 3 — FORM */}
                        <View style={s.form}>
                            <VText semiBold style={s.label}>{t.userLabel}</VText>
                            <View style={s.row}>
                                <Field
                                    style={s.codeField}
                                    focused={focusedField === 'code'}
                                    onFocus={() => setFocusedField('code')}
                                    onBlur={() => setFocusedField(null)}
                                    value={countryCode}
                                    onChangeText={(text) => setCountryCode('+' + text.replace('+', ''))}
                                    placeholder={t.codePlaceholder}
                                    maxLength={4}
                                    keyboardType="number-pad"
                                    textAlign="center"
                                    accessibilityLabel={t.codePlaceholder}
                                />
                                <Field
                                    style={s.phoneField}
                                    focused={focusedField === 'phone'}
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    placeholder={t.userPlaceholder}
                                    maxLength={11}
                                    keyboardType="number-pad"
                                    accessibilityLabel={t.userLabel}
                                />
                            </View>

                            <VText semiBold style={[s.label, s.labelSpaced]}>{t.passwordLabel}</VText>
                            <Field
                                focused={focusedField === 'password'}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                                value={password}
                                onChangeText={setPassword}
                                placeholder={t.passwordPlaceholder}
                                secureTextEntry={!passwordVisible}
                                autoCapitalize="none"
                                autoCorrect={false}
                                spellCheck={false}
                                autoComplete="password"
                                textContentType="password"
                                returnKeyType="go"
                                onSubmitEditing={login}
                                accessibilityLabel={t.passwordLabel}
                                right={
                                    <Pressable
                                        onPress={() => setPasswordVisible((v) => !v)}
                                        hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
                                        accessibilityRole="button"
                                        accessibilityLabel={passwordVisible ? t.hidePassword : t.showPassword}
                                        style={s.eyeBtn}
                                    >
                                        <MaterialCommunityIcons
                                            name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
                                            size={20}
                                            color={C.ink300}
                                        />
                                    </Pressable>
                                }
                            />
                        </View>
                    </Animated.View>
                </ScrollView>

                {/* 4 — AKSİYON */}
                <View style={[s.actions, { paddingBottom: Math.max(insets.bottom, 12) + 12 }]}>
                    <Pressable
                        onPress={login}
                        disabled={!canSubmit}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: !canSubmit, busy: submitting }}
                        accessibilityLabel={t.submit}
                        android_ripple={canSubmit ? { color: 'rgba(255,255,255,0.14)' } : undefined}
                        style={({ pressed }) => [
                            s.primary,
                            formFilled && s.primaryEnabled,
                            {
                                backgroundColor: !formFilled
                                    ? C.disabledBg
                                    : pressed
                                        ? C.accentPressed
                                        : C.accent,
                            },
                        ]}
                    >
                        {submitting ? (
                            <ActivityIndicator color={Color.white} />
                        ) : (
                            <VText
                                bold
                                numberOfLines={1}
                                style={[s.primaryLabel, !formFilled && s.primaryLabelDisabled]}
                            >
                                {t.submit}
                            </VText>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
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
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 24,
    },

    /* 1 — geri */
    backBtn: {
        width: 44,
        height: 44,
        marginLeft: -10,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },

    /* 2 — başlık */
    title: {
        marginTop: 20,
        fontSize: 28,
        lineHeight: 34,
        letterSpacing: -0.8,
        color: C.ink900,
    },
    subtitle: {
        marginTop: 10,
        fontSize: 15,
        lineHeight: 23,
        letterSpacing: -0.1,
        color: C.ink500,
        maxWidth: 340,
    },

    /* 3 — form */
    form: {
        marginTop: 32,
    },
    label: {
        fontSize: 13,
        lineHeight: 16,
        letterSpacing: 0.1,
        color: C.ink700,
        marginBottom: 8,
    },
    labelSpaced: {
        marginTop: 18,
    },
    row: {
        flexDirection: 'row',
        columnGap: 10,
    },
    codeField: {
        width: 84,
    },
    phoneField: {
        flex: 1,
    },
    field: {
        height: FIELD_H,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.canvas,
        paddingHorizontal: 14,
    },
    fieldFocused: {
        borderColor: C.accent,
        // Odak halkası: Android'de de çalışsın diye gölge yerine dış çizgi hissi
        backgroundColor: C.accentRing,
    },
    input: {
        flex: 1,
        height: '100%',
        padding: 0,
        fontSize: 16,
        lineHeight: 20,
        color: C.ink900,
        fontFamily: 'Nunito_500Medium',
        fontWeight: '500',
    },
    eyeBtn: {
        width: 28,
        height: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 6,
    },

    /* 4 — aksiyon */
    actions: {
        paddingHorizontal: 24,
        paddingTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: C.hairline,
        backgroundColor: C.canvas,
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
