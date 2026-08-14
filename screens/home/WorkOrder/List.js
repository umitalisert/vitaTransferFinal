import { Platform } from 'react-native';
import ListIOS from './List.ios';
import ListAndroid from './List.android';

const List = Platform.select({
  ios: ListIOS,
  android: ListAndroid,
  default: ListAndroid,
});

export default List;