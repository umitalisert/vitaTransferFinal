import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as Location from 'expo-location';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Color from '../Color';
import VText from '../VText';
import VButton from '../VButton';
import Odometer from '../../services/vita/Odometer';
import getOdometerTexts from './texts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FRAME_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.90), 364);
const FRAME_HEIGHT = Math.round(FRAME_WIDTH / 1.36);
const MASK_COLOR = 'rgba(0, 0, 0, 0.65)';

const STEP = {
    PERMISSION: 'permission',
    CAMERA: 'camera',
    RECOGNIZING: 'recognizing',
    CONFIRM: 'confirm',
    MANUAL: 'manual',
    ERROR: 'error',
};

// Okuma kalitesini düşürmeden yükleme boyutunu makul tutan genişlik.
const MAX_PHOTO_WIDTH = 1600;
// Aynı dosya hem OdometerRead hem SaveTransferOdometer isteğine gider. Sözleşme
// image/jpeg diyor; uç uzantı/ContentType doğruluyorsa webp reddedilir. Boyut kaygısı
// olursa format değil compress değeri düşürülmeli.
const PHOTO_FORMAT = SaveFormat.JPEG;

/**
 * Sürüş başlangıcı / bitişinde araç kilometresini fotoğraflayıp doğrulatan tam ekran akış.
 *
 * Akış: kamera -> fotoğraf API'ye gider -> dönen km sürücüye doğrulatılır ->
 *       yanlışsa elle düzenlenir veya fotoğraf yeniden çekilir -> onaylanan km API'ye gönderilir.
 *
 * @param {boolean}  visible
 * @param {'start'|'finish'} mode
 * @param {number|string} workOrderId
 * @param {string}   culture        'tr' | 'en' | 'de'
 * @param {?number}  minKilometer   Bitişte başlangıç km'sinden küçük değer girilmesini engeller.
 * @param {Function} onClose        Kullanıcı akıştan vazgeçtiğinde çağrılır.
 * @param {Function} onCompleted    ({ kilometer, isManuallyEdited, recognizedKilometer, recognitionId, photoUri, imagePath })
 */
const OdometerCaptureModal = ({
    visible,
    mode = 'start',
    workOrderId,
    culture = 'tr',
    minKilometer = null,
    onClose,
    onCompleted,
    onUnauthorized,
}) => {
    const t = getOdometerTexts(culture);
    const insets = useSafeAreaInsets();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const mounted = useRef(true);
    // Gönderim hata verirse aynı değeri tekrar denemek için saklanır.
    const pendingSubmit = useRef(null);

    const [step, setStep] = useState(STEP.CAMERA);
    const [cameraReady, setCameraReady] = useState(false);
    const [selectedLens, setSelectedLens] = useState(undefined);
    const [torch, setTorch] = useState(false);
    const [capturing, setCapturing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [recognition, setRecognition] = useState(null);
    const [selectedKilometer, setSelectedKilometer] = useState(null);
    const [manualValue, setManualValue] = useState('');
    const [manualError, setManualError] = useState(null);
    const [error, setError] = useState(null);

    const type = mode === 'finish' ? Odometer.TYPE_FINISH : Odometer.TYPE_START;
    const minimum = minKilometer ?? null;
    const title = mode === 'finish' ? t.titleFinish : t.titleStart;

    const sideWidth = Math.max(12, Math.round((SCREEN_WIDTH - FRAME_WIDTH) / 2));
    const frameTop = Math.max(
        insets.top + 70,
        Math.round(SCREEN_HEIGHT * 0.36 - FRAME_HEIGHT / 2),
    );

    // Birden fazla arka kamerası olan cihazlarda ana (Wide Angle) kamerayı seçer
    const configureCameraLenses = useCallback(async () => {
        if (Platform.OS !== 'ios' || !cameraRef.current?.getAvailableLensesAsync) return;
        try {
            const lenses = await cameraRef.current.getAvailableLensesAsync();
            if (Array.isArray(lenses) && lenses.length > 0) {
                const primaryLens = lenses.find((name) => {
                    const lower = name.toLowerCase();
                    const isExcluded = lower.includes('ultra') ||
                        lower.includes('tele') ||
                        lower.includes('front') ||
                        lower.includes('ön') ||
                        lower.includes('triple') ||
                        lower.includes('dual') ||
                        lower.includes('üçlü') ||
                        lower.includes('ikili') ||
                        lower.includes('macro');
                    return !isExcluded && (
                        lower.includes('wide') ||
                        lower.includes('geniş') ||
                        lower.includes('back') ||
                        lower.includes('arka') ||
                        lower.includes('main') ||
                        lower.includes('ana')
                    );
                }) || lenses.find((name) => {
                    const lower = name.toLowerCase();
                    return !lower.includes('ultra') && !lower.includes('tele');
                });

                if (primaryLens) {
                    setSelectedLens(primaryLens);
                }
            }
        } catch {
            // Cihaz varsayılan arka kamerasına güvenle devam eder
        }
    }, []);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    // Her açılışta akış baştan başlar; kapanışta fener kapatılır.
    useEffect(() => {
        if (!visible) {
            setTorch(false);
            return;
        }
        pendingSubmit.current = null;
        setStep(STEP.CAMERA);
        setCameraReady(false);
        setTorch(false);
        setCapturing(false);
        setSubmitting(false);
        setPhoto(null);
        setRecognition(null);
        setSelectedKilometer(null);
        setManualValue('');
        setManualError(null);
        setError(null);
    }, [visible]);

    useEffect(() => {
        if (visible && permission && !permission.granted && permission.canAskAgain) {
            requestPermission();
        }
    }, [visible, permission]);

    const formatKilometer = useCallback(
        (value) => (value == null ? '' : `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, t.thousandSeparator)),
        [t.thousandSeparator],
    );

    const readCoords = async () => {
        try {
            const position = await Location.getLastKnownPositionAsync();
            return { latitude: position?.coords?.latitude ?? null, longitude: position?.coords?.longitude ?? null };
        } catch {
            return { latitude: null, longitude: null };
        }
    };

    const fail = (message, retryStep) => {
        if (!mounted.current) return;
        setError({ message, retryStep });
        setStep(STEP.ERROR);
    };

    // Sadece çerçeve (kare) içerisinde kalan kısmı kırpar, boyutlandırır ve webp olarak sıkıştırır.
    const preparePhoto = async (shot) => {
        const fallback = { uri: shot.uri, name: shot.uri.split('/').pop(), type: 'image/jpeg' };
        try {
            let shotW = shot.width;
            let shotH = shot.height;
            if (!shotW || !shotH) {
                await new Promise((resolve) => {
                    Image.getSize(
                        shot.uri,
                        (w, h) => {
                            shotW = w;
                            shotH = h;
                            resolve();
                        },
                        () => resolve(),
                    );
                });
            }

            const context = ImageManipulator.manipulate(shot.uri);
            if (shotW && shotH) {
                // Kamera görüntüsünün ekrana tam sığdırılma (cover) ölçeği
                const scale = Math.min(shotW / SCREEN_WIDTH, shotH / SCREEN_HEIGHT);
                const visibleWidthOnSensor = SCREEN_WIDTH * scale;
                const visibleHeightOnSensor = SCREEN_HEIGHT * scale;
                const offsetX = (shotW - visibleWidthOnSensor) / 2;
                const offsetY = (shotH - visibleHeightOnSensor) / 2;

                let originX = Math.round(offsetX + sideWidth * scale);
                let originY = Math.round(offsetY + frameTop * scale);
                let cropWidth = Math.round(FRAME_WIDTH * scale);
                let cropHeight = Math.round(FRAME_HEIGHT * scale);

                // Görüntü sınırlarını taşmaması için kenetlenir
                originX = Math.max(0, Math.min(originX, shotW - 10));
                originY = Math.max(0, Math.min(originY, shotH - 10));
                cropWidth = Math.max(10, Math.min(cropWidth, shotW - originX));
                cropHeight = Math.max(10, Math.min(cropHeight, shotH - originY));

                context.crop({ originX, originY, width: cropWidth, height: cropHeight });
                if (cropWidth > MAX_PHOTO_WIDTH) {
                    context.resize({ width: MAX_PHOTO_WIDTH });
                }
            } else if (shot.width > MAX_PHOTO_WIDTH) {
                context.resize({ width: MAX_PHOTO_WIDTH });
            }

            const rendered = await context.renderAsync();
            let saved;
            try {
                saved = await rendered.saveAsync({ compress: 0.85, format: PHOTO_FORMAT });
            } catch {
                saved = await rendered.saveAsync({ compress: 0.85, format: SaveFormat.JPEG });
            }
            const isWebp = saved.uri?.toLowerCase().endsWith('.webp');
            return {
                uri: saved.uri,
                name: isWebp ? 'odometer.webp' : (saved.uri.split('/').pop() || 'odometer.jpg'),
                type: isWebp ? 'image/webp' : 'image/jpeg',
            };
        } catch (err) {
            console.warn('preparePhoto crop error:', err);
            return fallback;
        }
    };

    const recognize = async (target) => {
        setStep(STEP.RECOGNIZING);
        const coords = await readCoords();
        const result = await Odometer.Recognize({ workOrderId, type, photo: target, ...coords }, culture);
        if (!mounted.current) return;

        if (!result.success) {
            fail(result.message || t.recognizeError, STEP.RECOGNIZING);
            return;
        }

        const data = result.data ?? {};
        setRecognition(data);

        const hasCandidates = Array.isArray(data.candidates) && data.candidates.length > 0;

        // Hem sayaç değeri yok hem de aday listesi boşsa doğrudan elle girişe yönlendirilir.
        if (data.kilometer == null && !hasCandidates) {
            setManualValue('');
            const missingReason = Array.isArray(data.missing) && data.missing.length > 0
                ? `${data.missing.join(', ')} tespit edilemedi. Lütfen elle girin veya fotoğrafı yeniden çekin.`
                : (data.warning || t.notRecognized);
            setManualError(missingReason);
            setStep(STEP.MANUAL);
            return;
        }

        const initialKm = data.kilometer ?? (hasCandidates ? data.candidates[0].value : null);
        setSelectedKilometer(initialKm);
        setManualValue(initialKm != null ? `${initialKm}` : '');
        setManualError(null);
        setStep(STEP.CONFIRM);
    };

    const capture = async () => {
        if (capturing || !cameraReady) return;
        setCapturing(true);
        try {
            const shot = await cameraRef.current?.takePictureAsync({
                quality: 1,
                skipProcessing: false,
            });
            if (!shot?.uri) throw new Error('empty capture');
            const prepared = await preparePhoto(shot);
            if (!mounted.current) return;
            setTorch(false);
            setPhoto(prepared);
            await recognize(prepared);
        } catch {
            setTorch(false);
            fail(t.captureError, STEP.CAMERA);
        } finally {
            if (mounted.current) setCapturing(false);
        }
    };

    /**
     * Onaylanan kilometreyi ve fotoğrafı SaveTransferOdometer ucuna gönderir.
     *
     * isManual sözleşmesi: yalnızca elle düzenleme ekranından (MANUAL) gelen gönderimler
     * true'dur. Onay ekranındaki (CONFIRM) onay — aday listesinden seçim yapılmış olsa
     * bile — okunan değerlerden biri gönderildiği için false'tur.
     *
     * @param {number}  kilometer        Gönderilecek kilometre.
     * @param {boolean} isManuallyEdited Değer elle yazıldıysa true.
     * @param {?object} photoOverride    Tekrar denemede saklanan fotoğraf (retry).
     */
    const submit = async (kilometer, isManuallyEdited, photoOverride) => {
        const finalKm = kilometer ?? selectedKilometer ?? recognition?.kilometer;
        const editedFlag = isManuallyEdited === true;
        const photoToSend = photoOverride ?? photo;

        // Fotoğraf zorunlu bir alan; yoksa istek atmak yerine yeniden çekime yönlendirilir.
        if (!photoToSend?.uri) {
            fail(t.captureError, STEP.CAMERA);
            return;
        }

        // Km yoksa gönderim anlamsız.
        if (finalKm == null) {
            setManualValue('');
            setManualError(t.invalidEmpty);
            setStep(STEP.MANUAL);
            return;
        }

        // Bitiş akışında başlangıç km'sinin altına düşülemez. Bu kontrol daha önce yalnız
        // MANUAL ekranındaydı; OCR bir basamağı kaçırırsa CONFIRM onayı sessizce geçiyordu.
        if (minimum != null && finalKm < minimum) {
            setManualValue(`${finalKm}`);
            setManualError(t.invalidMin.replace('{min}', formatKilometer(minimum)));
            setStep(STEP.MANUAL);
            return;
        }

        // Hata sonrası "Tekrar dene" aynı değer ve aynı fotoğrafla çalışsın diye saklanır.
        pendingSubmit.current = { kilometer: finalKm, isManuallyEdited: editedFlag, photo: photoToSend };
        setSubmitting(true);

        let result;
        try {
            const coords = await readCoords();
            result = await Odometer.Confirm(
                {
                    workOrderId,
                    type,
                    recognitionId: recognition?.recognitionId ?? null,
                    kilometer: finalKm,
                    recognizedKilometer: recognition?.bestGuess ?? recognition?.kilometer ?? null,
                    isManuallyEdited: editedFlag,
                    photo: photoToSend,
                    imagePath: recognition?.imagePath ?? photoToSend.uri ?? null,
                    ...coords,
                },
                culture,
            );
        } catch {
            // Beklenmedik bir throw'da submitting true kalirsa modal tamamen kilitlenirdi.
            result = { success: false, message: t.submitError };
        } finally {
            if (mounted.current) setSubmitting(false);
        }
        if (!mounted.current) return;

        if (!result.success) {
            // Oturum dolduysa modal içinde "Tekrar dene" döngüsüne sokmak yerine
            // uygulamanın kendi 401 akışına devredilir.
            if (result.unauthorized) {
                onUnauthorized?.(result.message);
                onClose?.();
                return;
            }
            fail(result.message || t.submitError, STEP.CONFIRM);
            return;
        }
        onCompleted?.({
            kilometer: finalKm,
            isManuallyEdited: editedFlag,
            recognizedKilometer: recognition?.bestGuess ?? recognition?.kilometer ?? null,
            recognitionId: recognition?.recognitionId ?? null,
            photoUri: photoToSend.uri ?? null,
            imagePath: result.data?.imagePath ?? recognition?.imagePath ?? null,
        });
    };

    const submitManual = () => {
        const digits = `${manualValue}`.replace(/[^0-9]/g, '');
        if (digits.length === 0) {
            setManualError(t.invalidEmpty);
            return;
        }
        const parsed = Odometer.parseKilometer(digits);
        if (parsed == null) {
            setManualError(parseInt(digits, 10) > Odometer.maxKilometer
                ? t.invalidRange.replace('{max}', formatKilometer(Odometer.maxKilometer))
                : t.invalidNumber);
            return;
        }
        if (minimum != null && parsed < minimum) {
            setManualError(t.invalidMin.replace('{min}', formatKilometer(minimum)));
            return;
        }
        setManualError(null);
        submit(parsed, true);
    };

    const retry = () => {
        const target = error?.retryStep;
        setError(null);
        if (target === STEP.RECOGNIZING && photo) {
            recognize(photo);
            return;
        }
        if (target === STEP.CONFIRM && pendingSubmit.current) {
            submit(
                pendingSubmit.current.kilometer,
                pendingSubmit.current.isManuallyEdited,
                pendingSubmit.current.photo,
            );
            return;
        }
        retake();
    };

    const retake = () => {
        setPhoto(null);
        setRecognition(null);
        setSelectedKilometer(null);
        setManualValue('');
        setManualError(null);
        setError(null);
        setCameraReady(false);
        setStep(STEP.CAMERA);
    };

    const close = () => {
        if (submitting) return;
        setTorch(false);
        onClose?.();
    };

    // Fotoğraf çekildikten sonra kazara çıkışı engellemek için onay istenir.
    const requestClose = () => {
        if (submitting) return;
        if (step === STEP.CAMERA || step === STEP.PERMISSION) {
            close();
            return;
        }
        Alert.alert(t.closeTitle, t.closeText, [
            { text: t.closeNo, style: 'cancel' },
            { text: t.closeYes, style: 'destructive', onPress: close },
        ]);
    };

    const renderHeader = (dark) => (
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                onPress={requestClose}
                style={[styles.headerButton, dark && styles.headerCircleBtn]}
            >
                <MaterialCommunityIcons name="close" size={24} color={dark ? Color.white : Color.darkGrey} />
            </TouchableOpacity>
            <VText bold white={dark} numberOfLines={1} style={styles.headerTitle}>{title}</VText>
            <View style={styles.headerButton} />
        </View>
    );

    const renderPermission = () => (
        <View style={styles.sheet}>
            {renderHeader(false)}
            <View style={styles.centerContent}>
                <View style={styles.iconCircle}>
                    <MaterialCommunityIcons name="camera-off-outline" size={40} color={Color.primary} />
                </View>
                <VText bold style={styles.centerTitle}>{t.permissionTitle}</VText>
                <VText semiBold greyText style={styles.centerText}>{t.permissionText}</VText>
                <VButton
                    primary
                    style={styles.actionButton}
                    onPress={() => { permission?.canAskAgain ? requestPermission() : Linking.openSettings(); }}
                >
                    <VText bold white style={styles.actionLabel}>
                        {permission?.canAskAgain ? t.permissionButton : t.permissionSettings}
                    </VText>
                </VButton>
            </View>
        </View>
    );

    const renderCamera = () => {
        return (
            <View style={styles.cameraScreen}>
                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    mode="picture"
                    selectedLens={selectedLens}
                    zoom={0}
                    autofocus="off"
                    enableTorch={torch}
                    flash={torch ? 'on' : 'off'}
                    animateShutter={false}
                    onCameraReady={() => {
                        setCameraReady(true);
                        configureCameraLenses();
                    }}
                />

                {/* 1. Üst Karartılmış Alan */}
                <View
                    pointerEvents="box-none"
                    style={[styles.maskBlock, { top: 0, left: 0, right: 0, height: frameTop }]}
                >
                    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
                        <TouchableOpacity
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            onPress={requestClose}
                            style={[styles.headerButton, styles.headerCircleBtn]}
                        >
                            <MaterialCommunityIcons name="close" size={24} color={Color.white} />
                        </TouchableOpacity>
                        <VText bold white numberOfLines={1} style={styles.headerTitle}>{title}</VText>
                        <View style={styles.headerButton} />
                    </View>
                </View>

                {/* 2. Sol Karartılmış Alan */}
                <View
                    pointerEvents="none"
                    style={[styles.maskBlock, { top: frameTop, left: 0, width: sideWidth, height: FRAME_HEIGHT }]}
                />

                {/* 3. Şeffaf Kart Çerçevesi (Merkez) */}
                <View
                    pointerEvents="none"
                    style={[
                        styles.frameBox,
                        {
                            top: frameTop,
                            left: sideWidth,
                            width: FRAME_WIDTH,
                            height: FRAME_HEIGHT,
                        },
                    ]}
                >
                    {/* 4 Köşe Çerçevesi */}
                    <View style={[styles.corner, styles.cornerTopLeft]} />
                    <View style={[styles.corner, styles.cornerTopRight]} />
                    <View style={[styles.corner, styles.cornerBottomLeft]} />
                    <View style={[styles.corner, styles.cornerBottomRight]} />
                    {/* İnce yatay hizalama kılavuzu */}
                    <View style={styles.centerGuideLine} />
                </View>

                {/* 4. Sağ Karartılmış Alan */}
                <View
                    pointerEvents="none"
                    style={[styles.maskBlock, { top: frameTop, right: 0, width: sideWidth, height: FRAME_HEIGHT }]}
                />

                {/* 5. Alt Karartılmış Alan (Ekranın en altına kadar uzanır) */}
                <View
                    pointerEvents="box-none"
                    style={[
                        styles.maskBlock,
                        {
                            top: frameTop + FRAME_HEIGHT,
                            left: 0,
                            right: 0,
                            bottom: 0,
                        },
                    ]}
                >
                    {/* Hizalama İpucu Rozeti */}
                    <View style={styles.hintContainer} pointerEvents="none">
                        <View style={styles.hintBadge}>
                            <MaterialCommunityIcons name="view-finder" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                            <VText bold white style={styles.cameraHintText}>{t.cameraHint}</VText>
                        </View>
                        <VText semiBold style={styles.cameraSubHintText}>{t.cameraSubHint}</VText>
                    </View>

                    {/* Alt Kontroller: Flaş (Sol) ve Deklanşör (Merkez) */}
                    <View style={[styles.bottomControlsBar, { paddingBottom: insets.bottom + 24 }]}>
                        {/* Flaş Butonu */}
                        <TouchableOpacity
                            onPress={() => setTorch(!torch)}
                            activeOpacity={0.7}
                            style={[styles.bottomSideBtn, torch && styles.bottomSideBtnActive]}
                        >
                            <MaterialCommunityIcons
                                name={torch ? "flash" : "flash-off"}
                                size={24}
                                color={torch ? "#FFAA1D" : Color.white}
                            />
                            <VText bold style={[styles.bottomSideBtnText, torch && { color: "#FFAA1D" }]}>
                                {torch ? (culture === 'tr' ? 'Flaş Açık' : 'Flash On') : (culture === 'tr' ? 'Flaş' : 'Flash')}
                            </VText>
                        </TouchableOpacity>

                        {/* Deklanşör (Çekim Butonu) */}
                        <TouchableOpacity
                            onPress={capture}
                            disabled={!cameraReady || capturing}
                            activeOpacity={0.7}
                            style={[styles.shutterRing, (!cameraReady || capturing) && styles.shutterDisabled]}
                        >
                            {capturing ? (
                                <ActivityIndicator size="small" color={Color.primary} />
                            ) : (
                                <View style={styles.shutterCore} />
                            )}
                        </TouchableOpacity>

                        {/* Sağ Dengeleyici (Deklanşörün tam ortada kalması için) */}
                        <View style={styles.bottomPlaceholder} />
                    </View>
                </View>
            </View>
        );
    };

    const renderPhotoPreviewCard = (compact = false) => {
        if (!photo?.uri) return null;
        return (
            <View style={[styles.previewContainer, compact && { marginBottom: 12 }]}>
                <View style={[styles.previewCard, compact && styles.previewCardCompact]}>
                    <Image
                        source={{ uri: photo.uri }}
                        style={[styles.previewImage, compact && styles.previewImageCompact]}
                        resizeMode="cover"
                    />
                    <View style={styles.previewBadge}>
                        <MaterialCommunityIcons name="camera" size={12} color={Color.white} />
                        <VText bold white style={styles.previewBadgeText}>{t.photoBadge}</VText>
                    </View>
                </View>
            </View>
        );
    };

    const renderBusy = (message, hint) => (
        <View style={styles.sheet}>
            {renderHeader(false)}
            <ScrollView
                contentContainerStyle={[styles.scrollBody, { paddingBottom: insets.bottom + 24 }]}
                showsVerticalScrollIndicator={false}
            >
                {renderPhotoPreviewCard()}
                <View style={styles.busyCard}>
                    <ActivityIndicator size="large" color={Color.primary} style={{ marginBottom: 14 }} />
                    <VText bold style={styles.busyTitle}>{message}</VText>
                    {hint != null && <VText semiBold greyText style={styles.busyHint}>{hint}</VText>}
                </View>
            </ScrollView>
        </View>
    );

    const renderConfirm = () => {
        const currentKm = selectedKilometer ?? recognition?.kilometer;
        const hasBestGuess = recognition?.hasBestGuess === true;
        const candidates = Array.isArray(recognition?.candidates) ? recognition.candidates : [];
        const hasCandidates = candidates.length > 0;
        const lowConfidence = recognition?.confidence != null && recognition.confidence < Odometer.confidenceThreshold;

        return (
            <View style={styles.sheet}>
                {renderHeader(false)}
                <ScrollView
                    contentContainerStyle={[styles.scrollBody, { paddingBottom: insets.bottom + 24 }]}
                    showsVerticalScrollIndicator={false}
                >
                    {/* 1. Kırpılmış Fotoğraf Önizlemesi */}
                    {renderPhotoPreviewCard()}

                    {/* 2. bestGuess null ise veya aday seçimi gerekiyorsa Bilgilendirme Uyarısı */}
                    {!hasBestGuess && hasCandidates && (
                        <View style={styles.candidateNoticeBox}>
                            <View style={styles.candidateNoticeIcon}>
                                <MaterialCommunityIcons name="speedometer-slow" size={24} color="#D97706" />
                            </View>
                            <View style={styles.candidateNoticeTextGroup}>
                                <VText bold style={styles.candidateNoticeTitle}>{t.candidatesTitle}</VText>
                                <VText semiBold style={styles.candidateNoticeDesc}>
                                    {recognition?.missing?.[0] || t.candidatesNotice}
                                </VText>
                            </View>
                        </View>
                    )}

                    {/* 3. Adaylar Listesi (Kullanıcının seçebileceği profesyonel liste) */}
                    {hasCandidates && (
                        <View style={styles.candidatesCard}>
                            <View style={styles.candidatesHeader}>
                                <View style={styles.candidatesHeaderLeft}>
                                    <MaterialCommunityIcons name="format-list-bulleted-type" size={18} color={Color.primary} />
                                    <VText bold style={styles.candidatesTitle}>
                                        {hasBestGuess
                                            ? (culture === 'tr' ? 'Diğer Algılanan Değerler' : culture === 'de' ? 'Andere erkannte Werte' : 'Alternative Readings')
                                            : t.candidatesTitle}
                                    </VText>
                                </View>
                                <View style={styles.candidatesCountBadge}>
                                    <VText bold style={styles.candidatesCountText}>
                                        {candidates.length} {culture === 'tr' ? 'Seçenek' : culture === 'de' ? 'Optionen' : 'Options'}
                                    </VText>
                                </View>
                            </View>

                            <VText semiBold style={styles.candidatesGuideText}>
                                {t.candidatesNotice}
                            </VText>

                            <View style={styles.candidatesList}>
                                {candidates.map((cand, idx) => {
                                    const isSelected = currentKm === cand.value;
                                    const isTopCandidate = idx === 0 && cand.score > 0;
                                    return (
                                        <TouchableOpacity
                                            key={`${cand.value}-${idx}`}
                                            onPress={() => {
                                                setSelectedKilometer(cand.value);
                                                setManualValue(`${cand.value}`);
                                            }}
                                            activeOpacity={0.7}
                                            style={[
                                                styles.candidateItem,
                                                isSelected && styles.candidateItemActive,
                                            ]}
                                        >
                                            {/* Radyo Düğmesi */}
                                            <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                                                {isSelected && <View style={styles.radioDot} />}
                                            </View>

                                            {/* Kilometre ve Açıklamalar */}
                                            <View style={styles.candidateDetails}>
                                                <View style={styles.candidateValueRow}>
                                                    <VText bold style={[styles.candidateValue, isSelected && styles.candidateValueActive]}>
                                                        {formatKilometer(cand.value)}
                                                    </VText>
                                                    <VText bold style={[styles.candidateUnit, isSelected && styles.candidateUnitActive]}>
                                                        {t.kmSuffix}
                                                    </VText>
                                                    {isTopCandidate && (
                                                        <View style={[styles.bestMatchPill, isSelected && styles.bestMatchPillActive]}>
                                                            <MaterialCommunityIcons
                                                                name="star"
                                                                size={11}
                                                                color={isSelected ? Color.white : '#059669'}
                                                            />
                                                            <VText bold style={[styles.bestMatchPillText, isSelected && styles.bestMatchPillTextActive]}>
                                                                {t.candidatesBestGuess}
                                                            </VText>
                                                        </View>
                                                    )}
                                                </View>

                                                {cand.reason ? (
                                                    <View style={styles.candidateReasonRow}>
                                                        <MaterialCommunityIcons
                                                            name="information-outline"
                                                            size={13}
                                                            color={isSelected ? '#047857' : '#64748B'}
                                                            style={{ marginRight: 4, marginTop: 1 }}
                                                        />
                                                        <VText
                                                            numberOfLines={2}
                                                            style={[
                                                                styles.candidateReasonText,
                                                                isSelected && styles.candidateReasonTextActive,
                                                            ]}
                                                        >
                                                            {cand.reason}
                                                        </VText>
                                                    </View>
                                                ) : null}
                                            </View>

                                            {/* Skor Rozeti */}
                                            {cand.score > 0 && (
                                                <View style={[styles.scorePill, isSelected && styles.scorePillActive]}>
                                                    <VText bold style={[styles.scorePillText, isSelected && styles.scorePillTextActive]}>
                                                        +{cand.score} P
                                                    </VText>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Elle Giriş Alternatifi */}
                            <TouchableOpacity
                                onPress={() => {
                                    setManualValue(currentKm != null ? `${currentKm}` : '');
                                    setManualError(null);
                                    setStep(STEP.MANUAL);
                                }}
                                activeOpacity={0.7}
                                style={styles.candidateManualLink}
                            >
                                <MaterialCommunityIcons name="pencil-outline" size={15} color={Color.primary} style={{ marginRight: 6 }} />
                                <VText bold primary style={styles.candidateManualLinkText}>
                                    {t.otherKm}
                                </VText>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 4. Sonuç Kartı (Seçilen veya Doğrudan Okunan Değer) */}
                    <View style={styles.resultCard}>
                        <View style={styles.resultHeader}>
                            <View style={styles.resultHeaderLeft}>
                                <MaterialCommunityIcons name="speedometer" size={18} color={Color.primary} />
                                <VText bold style={styles.resultHeaderTitle}>
                                    {hasBestGuess
                                        ? t.confirmTitle
                                        : (culture === 'tr' ? 'Seçilen Kilometre' : culture === 'de' ? 'Ausgewählter Wert' : 'Selected Odometer')}
                                </VText>
                            </View>
                            <View style={[styles.resultBadge, !hasBestGuess && styles.resultBadgeSelected]}>
                                <MaterialCommunityIcons
                                    name={hasBestGuess ? 'check-decagram' : 'checkbox-marked-circle-outline'}
                                    size={14}
                                    color={hasBestGuess ? '#10B981' : Color.primary}
                                />
                                <VText bold style={[styles.resultBadgeText, !hasBestGuess && styles.resultBadgeSelectedText]}>
                                    {hasBestGuess ? (recognition?.reason || t.confirmSubtitle) : (culture === 'tr' ? 'Seçim Yapıldı' : culture === 'de' ? 'Ausgewählt' : 'Selected')}
                                </VText>
                            </View>
                        </View>

                        <View style={styles.resultValueRow}>
                            <VText bold style={styles.resultValue}>{formatKilometer(currentKm)}</VText>
                            <VText bold greyText style={styles.resultUnit}>{t.kmSuffix}</VText>
                        </View>

                        {(recognition?.warning || (hasBestGuess && lowConfidence)) && (
                            <View style={styles.warningBox}>
                                <MaterialCommunityIcons name="alert" size={18} color="#D97706" />
                                <VText semiBold style={styles.warningText}>
                                    {recognition?.warning || t.lowConfidence}
                                </VText>
                            </View>
                        )}
                    </View>

                    {/* 5. Profesyonel Onay Kartı */}
                    <View style={styles.confirmSectionCard}>
                        <View style={styles.confirmSectionHeader}>
                            <View style={styles.questionIconCircle}>
                                <MaterialCommunityIcons name="help" size={20} color={Color.primary} />
                            </View>
                            <View style={styles.questionTextGroup}>
                                <VText bold style={styles.confirmSectionTitle}>
                                    {hasBestGuess
                                        ? t.confirmQuestionTitle
                                        : (culture === 'tr' ? 'Değeri Onaylayın' : culture === 'de' ? 'Wert bestätigen' : 'Confirm Value')}
                                </VText>
                                <VText semiBold greyText style={styles.confirmSectionSub}>
                                    {hasBestGuess
                                        ? t.confirmQuestion
                                        : (culture === 'tr' ? 'Seçilen kilometre gösterge panelinizle eşleşiyor mu?' : culture === 'de' ? 'Entspricht dieser Wert Ihrem Armaturenbrett?' : 'Does the selected value match your dashboard?')}
                                </VText>
                            </View>
                        </View>

                        {/* Ana Onay Butonu */}
                        <TouchableOpacity
                            onPress={() => { if (currentKm != null) submit(currentKm, false); }}
                            activeOpacity={0.8}
                            disabled={currentKm == null}
                            style={[styles.primaryConfirmBtn, currentKm == null && { opacity: 0.5 }]}
                        >
                            <MaterialCommunityIcons name="check-circle" size={22} color={Color.white} style={{ marginRight: 8 }} />
                            <VText bold white style={styles.primaryConfirmText}>
                                {currentKm != null
                                    ? `${formatKilometer(currentKm)} km Olarak Onayla`
                                    : t.correct}
                            </VText>
                        </TouchableOpacity>

                        {/* İkincil Aksiyonlar: Değeri Düzenle & Yeniden Çek */}
                        <View style={styles.secondaryActionsRow}>
                            <TouchableOpacity
                                onPress={() => { setManualValue(`${currentKm ?? ''}`); setManualError(null); setStep(STEP.MANUAL); }}
                                activeOpacity={0.7}
                                style={styles.secondaryBtn}
                            >
                                <MaterialCommunityIcons name="pencil-outline" size={18} color={Color.darkGrey} style={{ marginRight: 6 }} />
                                <VText bold style={styles.secondaryBtnText}>{t.edit}</VText>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={retake}
                                activeOpacity={0.7}
                                style={styles.secondaryBtn}
                            >
                                <MaterialCommunityIcons name="camera-retake-outline" size={18} color={Color.darkGrey} style={{ marginRight: 6 }} />
                                <VText bold style={styles.secondaryBtnText}>{t.retake}</VText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    };

    const renderManual = () => (
        <KeyboardAvoidingView
            style={styles.sheet}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {renderHeader(false)}
            <ScrollView
                contentContainerStyle={[styles.scrollBody, { paddingBottom: insets.bottom + 24 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {renderPhotoPreviewCard(true)}
                <VText bold style={styles.centerTitleLeft}>{t.manualTitle}</VText>
                <VText semiBold greyText style={styles.manualQuestion}>{t.manualQuestion}</VText>
                <View style={[styles.inputRow, manualError != null && styles.inputRowError]}>
                    <TextInput
                        value={manualValue}
                        onChangeText={(text) => { setManualValue(text.replace(/[^0-9]/g, '')); setManualError(null); }}
                        keyboardType="number-pad"
                        maxLength={7}
                        autoFocus
                        placeholder={t.manualPlaceholder}
                        placeholderTextColor={Color.greyText}
                        style={styles.input}
                    />
                    <VText bold greyText style={styles.inputSuffix}>{t.kmSuffix}</VText>
                </View>
                {manualValue.length > 0 && manualError == null && (
                    <VText semiBold greyText style={styles.inputHelp}>{formatKilometer(manualValue)} {t.kmSuffix}</VText>
                )}
                {manualError != null && (
                    <View style={styles.errorRow}>
                        <MaterialCommunityIcons name="alert-circle-outline" size={18} color={Color.red} />
                        <VText semiBold red style={styles.errorText}>{manualError}</VText>
                    </View>
                )}
                <VButton primary style={styles.actionButton} onPress={submitManual}>
                    <MaterialCommunityIcons name="check" size={22} color={Color.white} />
                    <VText bold white style={styles.actionLabel}>{t.manualApprove}</VText>
                </VButton>
                <TouchableOpacity onPress={retake} style={styles.linkButton}>
                    <MaterialCommunityIcons name="camera-retake-outline" size={20} color={Color.primary} />
                    <VText bold primary style={styles.linkLabel}>{t.retake}</VText>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );

    const renderError = () => (
        <View style={styles.sheet}>
            {renderHeader(false)}
            <View style={styles.centerContent}>
                <View style={[styles.iconCircle, styles.iconCircleError]}>
                    <MaterialCommunityIcons name="alert-circle-outline" size={40} color={Color.red} />
                </View>
                <VText bold style={styles.centerTitle}>{t.errorTitle}</VText>
                <VText semiBold greyText style={styles.centerText}>{error?.message}</VText>
                <VButton primary style={styles.actionButton} onPress={retry}>
                    <MaterialCommunityIcons name="refresh" size={22} color={Color.white} />
                    <VText bold white style={styles.actionLabel}>{t.tryAgain}</VText>
                </VButton>
                <VButton
                    secondaryOutline
                    style={styles.actionButton}
                    onPress={() => { setError(null); setManualError(null); setStep(STEP.MANUAL); }}
                >
                    <MaterialCommunityIcons name="pencil-outline" size={22} color={Color.darkGrey} />
                    <VText bold style={styles.actionLabel}>{t.enterManually}</VText>
                </VButton>
                <TouchableOpacity onPress={retake} style={styles.linkButton}>
                    <MaterialCommunityIcons name="camera-retake-outline" size={20} color={Color.primary} />
                    <VText bold primary style={styles.linkLabel}>{t.retake}</VText>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep = () => {
        if (permission == null) {
            return (
                <View style={styles.sheet}>
                    {renderHeader(false)}
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color={Color.primary} />
                    </View>
                </View>
            );
        }
        if (!permission.granted) return renderPermission();
        if (step === STEP.RECOGNIZING) return renderBusy(t.recognizing, t.recognizingHint);
        if (step === STEP.CONFIRM) return renderConfirm();
        if (step === STEP.MANUAL) return renderManual();
        if (step === STEP.ERROR) return renderError();
        return renderCamera();
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={requestClose} statusBarTranslucent>
            <View style={styles.container}>
                {renderStep()}
                {submitting && (
                    <View style={styles.submitOverlay}>
                        <View style={styles.submitCard}>
                            <ActivityIndicator size="large" color={Color.primary} />
                            <VText bold style={styles.submitLabel}>{t.submitting}</VText>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Color.black },
    sheet: { flex: 1, backgroundColor: Color.white },
    cameraScreen: { flex: 1, backgroundColor: Color.black },
    cameraOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },

    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10 },
    headerButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
    headerCircleBtn: {
        borderRadius: 21,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    headerCircleBtnActive: {
        backgroundColor: 'rgba(255, 170, 29, 0.25)',
        borderWidth: 1,
        borderColor: '#FFAA1D',
    },
    headerTitle: { flex: 1, fontSize: 17, textAlign: 'center', marginHorizontal: 8 },

    // Maske blokları (Mutlak konumlandırmalı, 100% ekran kaplama garantisi)
    maskBlock: {
        position: 'absolute',
        backgroundColor: MASK_COLOR,
    },

    // Kart Çerçevesi
    frameBox: {
        position: 'absolute',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.35)',
        overflow: 'hidden',
    },
    corner: { position: 'absolute', width: 34, height: 34, borderColor: Color.white },
    cornerTopLeft: { top: -1, left: -1, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 18 },
    cornerTopRight: { top: -1, right: -1, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 18 },
    cornerBottomLeft: { bottom: -1, left: -1, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 18 },
    cornerBottomRight: { bottom: -1, right: -1, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 18 },
    centerGuideLine: {
        position: 'absolute',
        top: '50%',
        left: 24,
        right: 24,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },

    // İpuçları
    hintContainer: {
        alignItems: 'center',
        paddingTop: 18,
        paddingHorizontal: 20,
    },
    hintBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.18)',
    },
    cameraHintText: { fontSize: 14, textAlign: 'center' },
    cameraSubHintText: { fontSize: 13, textAlign: 'center', marginTop: 8, color: 'rgba(255, 255, 255, 0.72)' },

    // Alt Kontroller
    bottomControlsBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 24,
    },
    bottomSideBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 74,
        height: 64,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.18)',
    },
    bottomSideBtnActive: {
        backgroundColor: 'rgba(255, 170, 29, 0.25)',
        borderColor: '#FFAA1D',
    },
    bottomSideBtnText: {
        fontSize: 11,
        color: Color.white,
        marginTop: 4,
    },
    bottomPlaceholder: {
        width: 74,
    },

    shutterRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 4,
        borderColor: Color.white,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
    },
    shutterDisabled: { opacity: 0.4 },
    shutterCore: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Color.white,
    },

    centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
    iconCircle: { width: 88, height: 88, borderRadius: 44, backgroundColor: Color.greyLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    iconCircleError: { backgroundColor: 'rgba(224,48,36,0.1)' },
    centerTitle: { fontSize: 20, textAlign: 'center', marginTop: 16 },
    centerTitleLeft: { fontSize: 20, marginTop: 4 },
    centerText: { fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22 },

    scrollBody: { paddingHorizontal: 24, paddingTop: 12 },

    // Fotoğraf Önizleme Kartı
    previewContainer: {
        marginBottom: 16,
    },
    previewCard: {
        width: '100%',
        height: Math.round((SCREEN_WIDTH - 48) / 1.36),
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        position: 'relative',
    },
    previewCardCompact: {
        height: 120,
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    previewImageCompact: {
        height: '100%',
    },
    previewBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 12,
    },
    previewBadgeText: {
        fontSize: 11,
        marginLeft: 4,
    },

    // Aday Değer Bilgilendirme Kutusu (bestGuess null iken)
    candidateNoticeBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#FFFBEB',
        borderRadius: 16,
        padding: 14,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    candidateNoticeIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: 'rgba(217, 119, 6, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    candidateNoticeTextGroup: {
        flex: 1,
    },
    candidateNoticeTitle: {
        fontSize: 15,
        color: '#92400E',
        marginBottom: 3,
    },
    candidateNoticeDesc: {
        fontSize: 13,
        lineHeight: 18,
        color: '#B45309',
    },

    // Adaylar Listesi Kartı
    candidatesCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    candidatesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    candidatesHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    candidatesTitle: {
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        color: Color.darkGrey,
        marginLeft: 6,
    },
    candidatesCountBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    candidatesCountText: {
        fontSize: 11,
        color: '#475569',
    },
    candidatesGuideText: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 12,
        lineHeight: 18,
    },
    candidatesList: {
        gap: 10,
    },
    candidateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    candidateItemActive: {
        backgroundColor: '#ECFDF5',
        borderColor: Color.primary,
        shadowColor: Color.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 2,
    },
    radioCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#94A3B8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioCircleActive: {
        borderColor: Color.primary,
        backgroundColor: Color.primary,
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Color.white,
    },
    candidateDetails: {
        flex: 1,
    },
    candidateValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    candidateValue: {
        fontSize: 22,
        color: '#0F172A',
        fontFamily: 'Nunito_700Bold',
    },
    candidateValueActive: {
        color: '#065F46',
    },
    candidateUnit: {
        fontSize: 14,
        color: '#64748B',
        marginLeft: 4,
    },
    candidateUnitActive: {
        color: '#047857',
    },
    bestMatchPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 8,
    },
    bestMatchPillActive: {
        backgroundColor: '#10B981',
    },
    bestMatchPillText: {
        fontSize: 10,
        color: '#047857',
        marginLeft: 3,
    },
    bestMatchPillTextActive: {
        color: Color.white,
    },
    candidateReasonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
    },
    candidateReasonText: {
        fontSize: 12,
        color: '#64748B',
        flex: 1,
    },
    candidateReasonTextActive: {
        color: '#047857',
    },
    scorePill: {
        backgroundColor: '#E2E8F0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    scorePillActive: {
        backgroundColor: '#A7F3D0',
    },
    scorePillText: {
        fontSize: 11,
        color: '#475569',
    },
    scorePillTextActive: {
        color: '#065F46',
    },
    candidateManualLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingVertical: 8,
    },
    candidateManualLinkText: {
        fontSize: 13,
        marginLeft: 4,
    },

    // Okunan Kilometre Sonuç Kartı
    resultCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    resultHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resultHeaderTitle: {
        fontSize: 13,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        color: Color.darkGrey,
        marginLeft: 6,
    },
    resultBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    resultBadgeSelected: {
        backgroundColor: '#F0FDF4',
        borderColor: Color.primary,
    },
    resultBadgeText: {
        fontSize: 11,
        color: '#047857',
        marginLeft: 4,
    },
    resultBadgeSelectedText: {
        color: Color.primary,
    },
    resultValueRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginTop: 4,
    },
    resultValue: {
        fontSize: 44,
        lineHeight: 52,
        color: '#0F172A',
        fontFamily: 'Nunito_700Bold',
    },
    resultUnit: {
        fontSize: 20,
        marginLeft: 8,
        marginBottom: 8,
        color: '#64748B',
    },
    warningBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        padding: 10,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#FDE68A',
    },
    warningText: {
        flex: 1,
        fontSize: 12,
        marginLeft: 8,
        lineHeight: 18,
        color: '#92400E',
    },

    // Profesyonel Onay Kartı (? ile başlayan bölüm)
    confirmSectionCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    confirmSectionHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    questionIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0, 168, 120, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2,
    },
    questionTextGroup: {
        flex: 1,
    },
    confirmSectionTitle: {
        fontSize: 16,
        color: '#0F172A',
        marginBottom: 3,
    },
    confirmSectionSub: {
        fontSize: 13,
        lineHeight: 18,
        color: '#64748B',
    },
    primaryConfirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Color.primary,
        height: 52,
        borderRadius: 14,
        shadowColor: Color.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    primaryConfirmText: {
        fontSize: 16,
        letterSpacing: 0.3,
    },
    secondaryActionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        gap: 10,
    },
    secondaryBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 46,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
    },
    secondaryBtnText: {
        fontSize: 14,
        color: Color.darkGrey,
    },

    // Yükleniyor Kartı
    busyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: 8,
    },
    busyTitle: {
        fontSize: 17,
        textAlign: 'center',
        marginTop: 8,
    },
    busyHint: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 6,
    },

    // Elle Giriş Ekranı
    manualQuestion: {
        fontSize: 14,
        marginTop: 4,
        marginBottom: 8,
    },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Color.greyBorder, borderRadius: 12, paddingHorizontal: 16, marginTop: 16 },
    inputRowError: { borderColor: Color.red },
    input: { flex: 1, paddingVertical: 18, fontSize: 28, color: Color.black, fontFamily: 'Nunito_700Bold', fontWeight: '700' },
    inputSuffix: { fontSize: 18, marginLeft: 8 },
    inputHelp: { fontSize: 13, marginTop: 8 },
    errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    errorText: { flex: 1, fontSize: 13, marginLeft: 6, lineHeight: 19 },

    actionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, marginTop: 16 },
    actionLabel: { fontSize: 15, marginLeft: 6 },
    linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18 },
    linkLabel: { fontSize: 15, marginLeft: 6 },

    submitOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(33,33,33,0.5)', alignItems: 'center', justifyContent: 'center' },
    submitCard: { backgroundColor: Color.white, borderRadius: 16, paddingVertical: 28, paddingHorizontal: 40, alignItems: 'center' },
    submitLabel: { fontSize: 15, marginTop: 14 },
});

export default OdometerCaptureModal;
