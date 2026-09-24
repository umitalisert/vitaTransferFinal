import axios from 'axios';
import useAuthStore from '../../zustand/AuthStore';

/**
 * Odometre (kilometre) fotoğrafı okuma ve kaydetme servisi.
 *
 * Uçlarla ilgili tüm ayarlar (adres, alan eşlemesi, Authorization öneki) bu dosyadadır:
 *
 *   1. rootUrl / recognizePath / savePath -> uç adresleri
 *   2. authScheme          -> Authorization başlığının öneki ('Bearer ' ya da '')
 *   3. readRecognizeData   -> API'nin döndüğü alan adlarına göre eşleştir
 *   4. attachToWorkOrderStatus -> kilometre UpdateWorkOrderStatus isteğine de eklenecekse true
 *
 * Beklenen sözleşme:
 *   POST {recognizePath}  multipart/form-data
 *        file (odometre fotoğrafı)
 *        -> { responseCode: 200, data: { bestGuess, candidates, missing, ... } }
 *   POST {savePath}       multipart/form-data   (SaveTransferOdometer)
 *        id       -> iş emri (workOrder) id'si
 *        type     -> 1: sürüşe başla, 4: sürüşü bitir
 *        km       -> sürücünün onayladığı kilometre
 *        isManual -> false: okunan değer değiştirilmeden gönderildi
 *                    true : değer elle düzenlenerek gönderildi
 *        photo    -> çekilen odometre fotoğrafı
 *        -> text/plain ya da { responseCode: 200, data: { ... } }
 */

const Odometer = {
    attachToWorkOrderStatus: true,
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/WorkOrder',
    recognizePath: '/OdometerRead',
    savePath: '/SaveTransferOdometer',
    // Authorization öneki. Projedeki tüm servisler 'Bearer ' kullanır; Swagger çıktısında
    // token öneksiz göründüğü için uç ham token beklerse burası tek satırda '' yapılır.
    authScheme: 'Bearer ',
    // Odometre (kilometre fotoğrafı) akışı yalnızca bu domain'e bağlı firmalarda çalışır.
    // Diğer firmalarda sürücü kamerayı hiç görmez, doğrudan durum güncellemesi yapılır.
    // Birden fazla domain gerekirse burası diziye çevrilip allowedDomains.includes(...) yapılır.
    domain: 127,
    // Bu değerin altındaki okumalarda sürücüye "okuma zayıf" uyarısı gösterilir.
    confidenceThreshold: 0.75,
    minKilometer: 1,
    maxKilometer: 9999999,
    timeout: 45000,
    TYPE_START: 1,
    TYPE_FINISH: 4,

    /**
     * Çekilen odometre fotoğrafını OdometerRead servisine multipart/form-data olarak gönderir.
     * @returns {Promise<{ success: boolean, unauthorized?: boolean, message?: string,
     *                     data?: { kilometer: ?number, bestGuess: ?number, warning: ?string,
     *                              reason: ?string, missing: string[], candidates: Array,
     *                              words: string[], rawText: string, elapsedMs: ?number, imagePath: ?string } }>}
     */
    Recognize: async ({ workOrderId, type, photo, latitude, longitude }, culture = 'tr') => {
        const form = new FormData();
        const filename = photo.name || photo.uri.split('/').pop() || 'odometer.webp';
        const fileType = photo.type || (filename.endsWith('.webp') ? 'image/webp' : 'image/jpeg');

        form.append('file', {
            uri: photo.uri,
            name: filename,
            type: fileType,
        });

        try {
            const headers = buildHeaders(culture, {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'multipart/form-data',
            });

            const response = await axios.post(`${Odometer.rootUrl}${Odometer.recognizePath}`, form, {
                headers,
                timeout: Odometer.timeout,
            });

            return readResponse(response, readRecognizeData, culture, photo?.uri);
        } catch (error) {
            return readError(error, culture);
        }
    },

    /**
     * Sürücünün doğruladığı kilometreyi ve odometre fotoğrafını SaveTransferOdometer
     * ucuna multipart/form-data olarak gönderir.
     *
     * Gönderilen alan adları sözleşmedeki gibi birebir: id, type, km, isManual, photo.
     * İç istek nesnesi (workOrderId / kilometer / isManuallyEdited) ekran tarafıyla
     * uyumlu kalsın diye korunur; sözleşme adlarına dönüşüm sadece burada yapılır.
     *
     * @param {{ workOrderId: (number|string), type: number, kilometer: number,
     *           isManuallyEdited: boolean, photo: ?{ uri: string, name: ?string, type: ?string } }} request
     * @returns {Promise<{ success: boolean, unauthorized?: boolean, message?: string, data?: object }>}
     */
    Confirm: async (request, culture = 'tr') => {
        const photo = request?.photo;

        // km olmadan gönderim anlamsız; boş string göndermek yerine erkenden dur.
        const kilometer = Odometer.parseKilometer(request?.kilometer);
        if (kilometer == null) return { success: false, message: genericError(culture) };

        const form = new FormData();
        // React Native FormData sayı/boolean kabul etmez; her alan string olarak eklenir.
        form.append('id', `${request?.workOrderId ?? ''}`);
        form.append('type', `${request?.type ?? Odometer.TYPE_START}`);
        form.append('km', `${kilometer}`);
        form.append('isManual', request?.isManuallyEdited === true ? 'true' : 'false');

        if (photo?.uri) {
            const filename = photo.name || photo.uri.split('/').pop() || 'odometer.jpg';
            const fileType = photo.type || (filename.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/jpeg');
            form.append('photo', {
                uri: photo.uri,
                name: filename,
                type: fileType,
            });
        }

        try {
            const headers = buildHeaders(culture, {
                // Uç text/plain dönebiliyor; JSON da kabul edilsin diye ikisi birden istenir.
                'Accept': 'text/plain, application/json, */*',
                'Content-Type': 'multipart/form-data',
            });

            const response = await axios.post(`${Odometer.rootUrl}${Odometer.savePath}`, form, {
                headers,
                timeout: Odometer.timeout,
            });

            return readSaveResponse(response, culture, photo?.uri);
        } catch (error) {
            return readError(error, culture);
        }
    },

    /**
     * Oturum açan sürücünün firması odometre akışına dahil mi?
     * Değer önce login cevabındaki data.domain alanından, o yoksa JWT içindeki
     * "Domain" claim'inden okunur (iki giriş yolu da aynı nesneyi saklar).
     */
    isEnabledForUser: () => Odometer.currentDomain() === Odometer.domain,

    /** Oturumdaki domain'i sayı olarak döndürür; okunamazsa null. */
    currentDomain: () => {
        const loginUser = useAuthStore.getState()?.loginUser;
        if (!loginUser) return null;

        const dogrudan = toNumber(loginUser.domain ?? loginUser.Domain);
        if (dogrudan != null) return dogrudan;

        const claim = readJwtClaim(loginUser.token, 'Domain') ?? readJwtClaim(loginUser.token, 'domain');
        return toNumber(claim);
    },

    /** Girilen metni geçerli bir kilometre değerine çevirir, geçersizse null döner. */
    parseKilometer: (value) => {
        if (value == null) return null;
        const digits = `${value}`.replace(/[^0-9]/g, '');
        if (digits.length === 0) return null;
        const parsed = parseInt(digits, 10);
        if (!Number.isFinite(parsed)) return null;
        if (parsed < Odometer.minKilometer || parsed > Odometer.maxKilometer) return null;
        return parsed;
    },
};

function toNumber(value) {
    if (value == null || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

// base64url cozucu. atob RN surumlerine gore degisken oldugu icin elle yazildi;
// yalnizca JWT payload'unu okumak icin kullanilir, imza DOGRULANMAZ.
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function base64UrlDecode(input) {
    const s = `${input}`.replace(/-/g, '+').replace(/_/g, '/');
    let bits = 0, deger = 0, cikti = '';
    for (const ch of s) {
        if (ch === '=') break;
        const idx = B64.indexOf(ch);
        if (idx === -1) continue;
        deger = (deger << 6) | idx;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            cikti += String.fromCharCode((deger >> bits) & 0xff);
        }
    }
    // JWT payload'u UTF-8; Turkce karakterler icin cozumleme gerekir.
    try {
        return decodeURIComponent(cikti.split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    } catch {
        return cikti;
    }
}

/** JWT payload'undan tek bir claim okur. Bozuk/eksik token'da null doner. */
function readJwtClaim(token, claim) {
    if (!token || typeof token !== 'string') return null;
    const parcalar = token.split('.');
    if (parcalar.length < 2) return null;
    try {
        const payload = JSON.parse(base64UrlDecode(parcalar[1]));
        return payload?.[claim] ?? null;
    } catch {
        return null;
    }
}

function buildHeaders(culture, extra) {
    const token = useAuthStore.getState()?.loginUser?.token;
    const headers = { 'Accept-Language': culture || 'tr', ...extra };
    if (token) headers.Authorization = `${Odometer.authScheme}${token}`;
    return headers;
}

// API bazı uçlarda responseCode'u camelCase, bazılarında PascalCase döndürüyor.
function pick(source, ...keys) {
    if (source == null) return undefined;
    for (const key of keys) {
        if (source[key] !== undefined && source[key] !== null) return source[key];
    }
    return undefined;
}

function readRecognizeData(data, photoUri) {
    if (!data) return { kilometer: null, bestGuess: null, hasBestGuess: false, candidates: [] };

    const bestGuess = pick(data, 'bestGuess', 'BestGuess', 'kilometer', 'Kilometer', 'km', 'Km');
    const parsedBestGuess = Odometer.parseKilometer(bestGuess);
    const rawCandidates = pick(data, 'candidates', 'Candidates') || [];
    const candidates = Array.isArray(rawCandidates)
        ? rawCandidates.map((c) => ({
            value: Odometer.parseKilometer(pick(c, 'value', 'Value')),
            score: Number(pick(c, 'score', 'Score') ?? 0),
            reason: pick(c, 'reason', 'Reason') || null,
        })).filter((c) => c.value != null)
        : [];

    // bestGuess null ise ancak candidates varsa en yüksek puanlı adayı varsayılan km olarak belirle
    const effectiveKm = parsedBestGuess ?? (candidates.length > 0 ? candidates[0].value : null);

    const warning = pick(data, 'warning', 'Warning') || null;
    const reason = pick(data, 'reason', 'Reason') || null;
    const rawMissing = pick(data, 'missing', 'Missing');
    const missing = Array.isArray(rawMissing)
        ? rawMissing
        : (rawMissing ? [rawMissing] : []);

    return {
        recognitionId: pick(data, 'recognitionId', 'RecognitionId', 'id', 'Id') ?? null,
        kilometer: effectiveKm,
        bestGuess: parsedBestGuess,
        hasBestGuess: parsedBestGuess != null,
        warning,
        reason,
        missing,
        candidates,
        words: pick(data, 'words', 'Words') || [],
        rawText: pick(data, 'rawText', 'RawText') || '',
        fileName: pick(data, 'fileName', 'FileName') || null,
        sizeKb: pick(data, 'sizeKb', 'SizeKb') || null,
        elapsedMs: pick(data, 'elapsedMs', 'ElapsedMs') || null,
        imagePath: photoUri || null,
        confidence: warning ? 0.6 : (parsedBestGuess != null ? 0.95 : 0.75),
    };
}

function readResponse(response, mapData, culture, photoUri) {
    if (response.status !== 200) return { success: false, message: genericError(culture) };

    const body = response.data ?? {};
    const code = Number(pick(body, 'responseCode', 'ResponseCode') ?? 0);
    const message = pick(body, 'responseMessage', 'ResponseMessage');

    if (code === 200) {
        return { success: true, data: mapData(pick(body, 'data', 'Data') ?? null, photoUri) };
    }
    if (code === 401) {
        return { success: false, unauthorized: true, message: message || genericError(culture) };
    }
    return { success: false, message: message || genericError(culture) };
}

// Gövdede responseCode yoksa (düz metin cevap) değerlendirilecek kalıplar.
// NOT: JS'te \b ASCII tabanlıdır; "başarılı" gibi Türkçe harfle biten sözcüklerde
// çalışmaz. Bu yüzden sınır olarak boşluk/noktalama/satır sonu açıkça yazılır.
const WORD_END = '(\\s|[.,!;:]|$)';
const SAVE_FAILURE_TEXT = new RegExp(`^(false|0|hata|error|fail(ed)?|unauthorized|yetkisiz|başarısız|basarisiz)${WORD_END}`, 'i');
// Açıkça olumlu sayılan gövdeler: "true", "OK", "Başarılı" ya da salt sayı (kayıt id'si).
const SAVE_SUCCESS_TEXT = new RegExp(`^(true|1|ok|success|successful|basarili|başarılı|kaydedildi)${WORD_END}`, 'i');
const SAVE_NUMERIC_TEXT = /^[0-9]+$/;

/**
 * SaveTransferOdometer 'accept: text/plain' ile çağrıldığı için gövde düz metin gelebilir.
 * Gövdeyi tek biçime indirger: JSON nesnesi -> body, çözülemeyen/skaler içerik -> text.
 */
function readSaveBody(raw) {
    if (raw == null) return { body: null, text: '' };
    if (typeof raw === 'object') return { body: raw, text: '' };

    const text = `${raw}`.trim();
    if (text.length === 0) return { body: null, text: '' };
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object') return { body: parsed, text };
        return { body: null, text: `${parsed}` };
    } catch {
        return { body: null, text };
    }
}

/** Ekran tarafı result.data?.imagePath okuduğu için data her zaman nesne olarak döndürülür. */
function readSaveData(body, text, photoUri) {
    const nested = pick(body, 'data', 'Data');
    const source = (nested && typeof nested === 'object') ? nested : (body ?? {});
    return {
        imagePath: pick(source, 'imagePath', 'ImagePath', 'photoPath', 'PhotoPath') ?? photoUri ?? null,
        kilometer: Odometer.parseKilometer(pick(source, 'km', 'Km', 'kilometer', 'Kilometer')),
        message: text || null,
    };
}

function readSaveResponse(response, culture, photoUri) {
    const status = Number(response?.status ?? 0);
    if (status < 200 || status >= 300) return { success: false, message: genericError(culture) };

    const { body, text } = readSaveBody(response?.data);
    const code = pick(body, 'responseCode', 'ResponseCode');
    const message = pick(body, 'responseMessage', 'ResponseMessage', 'message', 'Message');

    // JSON gövde: projedeki diğer uçlarla aynı responseCode kuralı geçerli.
    if (code !== undefined) {
        const numeric = Number(code);
        if (numeric === 200) return { success: true, data: readSaveData(body, text, photoUri) };
        if (numeric === 401) {
            return { success: false, unauthorized: true, message: message || genericError(culture) };
        }
        return { success: false, message: message || genericError(culture) };
    }

    // JSON gövde ama responseCode yok: açık olumsuz bayrak varsa hata.
    const flag = pick(body, 'success', 'Success', 'isSuccess', 'IsSuccess');
    if (flag === false || flag === 'false') {
        return { success: false, message: message || genericError(culture) };
    }
    if (body != null) {
        // responseCode ve olumsuz bayrak yoksa HTTP 2xx başarı sayılır.
        return { success: true, data: readSaveData(body, text, photoUri) };
    }

    // Düz metin gövde. Boş gövde ya da açıkça olumlu metin -> başarı.
    if (text.length === 0 || SAVE_SUCCESS_TEXT.test(text) || SAVE_NUMERIC_TEXT.test(text)) {
        return { success: true, data: readSaveData(body, text, photoUri) };
    }
    // Tanınmayan metin başarı SAYILMAZ: uç 200 ile "Kilometre kaydedilemedi." dönerse
    // bunu başarı kabul etmek iş emrini km kaydı olmadan başlatır. Metni kullanıcıya göster.
    return { success: false, message: text };
}

function readError(error, culture) {
    const data = error?.response?.data;
    const serverMessage = pick(data, 'responseMessage', 'ResponseMessage', 'message', 'Message');
    const is401 = error?.response?.status === 401 || data?.responseCode === 401;

    if (is401) {
        return {
            success: false,
            unauthorized: true,
            message: serverMessage || (culture === 'tr' ? 'Oturum süreniz doldu.' : 'Session expired.'),
        };
    }

    return {
        success: false,
        message: serverMessage || genericError(culture),
    };
}

function genericError(culture) {
    if (culture === 'en') return 'An unexpected error occured. Please try again later.';
    if (culture === 'de') return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
    return 'Beklenmedik bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
}

export default Odometer;
