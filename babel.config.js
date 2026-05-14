// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       'react-native-reanimated/plugin',
//     ],
//   };
// };
// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: ['react-native-reanimated/plugin'],
//     env: {
//       production: {
//         plugins: ['react-native-paper/babel'],
//       },
//     },
//   };
// };
// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: [
//       [
//         'babel-plugin-transform-import-meta',
//         {
//           unstable_transformImportMeta: true,
//         },
//       ],
//     ],
//   };
// };

// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: [
//       ['babel-preset-expo', { unstable_transformImportMeta: true }]
//     ],
//     // plugins: [] // Burada plugin eklemene gerek yok
//   };
// };


// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//   };
// };
// module.exports = function(api) {
//   api.cache(true);
//   return {
//     presets: [
//       ['babel-preset-expo', { unstable_transformImportMeta: true }]
//     ],
//   };
// };
// module.exports = function (api) {
//   api.cache(true);
//   return {
//     presets: ['babel-preset-expo'],
//     plugins: ['babel-plugin-transform-import-meta'],
//   };
// };
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'babel-plugin-transform-import-meta',
        {
          polyfill: 'unstable_transformImportMeta', // polyfill aktifleştirildi
        },
      ],
      'react-native-reanimated/plugin', // Bu plugin en sonda olmalı!
    ],
  };
};
