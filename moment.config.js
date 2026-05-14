const locale = {
    name: 'tr',
    config: {
      months: 'Ocak_Şubat_Mart_Nisan_Mayıs_Haziran_Temmuz_Ağustos_Eylül_Ekim_Kasım_Aralık'.split(
        '_'
      ),
      monthsShort: 'Oca_Şub_Mar_Nis_May_Haz_Tem_Ağu_Eyl_Eki_Kas_Ara'.split(
        '_'
      ),
      weekdays: 'Pazar_Pazartesi_Salı_Çarşamba_Perşembe_Cuma_Cumartesi'.split('_'),
      weekdaysShort: 'Paz_Pzt_Sal_Çar_Per_Cum_Cmt'.split('_'),
      weekdaysMin: 'Pz_Pt_Sa_Ça_Pe_Cm_Ct'.split('_'),
      longDateFormat: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'DD/MM/YYYY',
        LL: 'D MMMM YYYY',
        LLL: 'D MMMM YYYY LT',
        LLLL: 'dddd D MMMM YYYY LT'
      },
      calendar: {
        sameDay: "[Bugün] LT",
        nextDay: '[Demain à] LT',
        nextWeek: 'dddd [à] LT',
        lastDay: '[Hier à] LT',
        lastWeek: 'dddd [dernier à] LT',
        sameElse: 'L'
      },
      relativeTime: {
        future: 'dans %s',
        past: 'il y a %s',
        s: 'quelques secondes',
        m: 'une minute',
        mm: '%d minutes',
        h: 'une heure',
        hh: '%d heures',
        d: 'un jour',
        dd: '%d jours',
        M: 'un mois',
        MM: '%d mois',
        y: 'une année',
        yy: '%d années'
      },
      ordinalParse: /\d{1,2}(er|ème)/,
      ordinal: function(number) {
        return number + (number === 1 ? 'er' : 'ème');
      },
      meridiemParse: /PD|MD/,
      isPM: function(input) {
        return input.charAt(0) === 'M';
      },
      // in case the meridiem units are not separated around 12, then implement
      // this function (look at locale/id.js for an example)
      // meridiemHour : function (hour, meridiem) {
      //     return /* 0-23 hour, given meridiem token and hour 1-12 */
      // },
      meridiem: function(hours, minutes, isLower) {
        return hours < 12 ? 'PD' : 'MD';
      },
      week: {
        dow: 1, // Monday is the first day of the week.
        doy: 4 // The week that contains Jan 4th is the first week of the year.
      }
    }
  };

  export default locale;