import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const ToastMessage = ({ message, onHide }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished && onHide) {
          runOnJS(onHide)(); 
        }
      });
    }, 3000);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.toastContainer, animatedStyle]}>
      <Text style={styles.toastText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    maxWidth: width * 0.9,
    zIndex:1000
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ToastMessage;