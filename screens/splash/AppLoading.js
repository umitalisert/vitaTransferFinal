import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Color from '../../components/Color'
import LottieView from 'lottie-react-native';

const AppLoading = () => {
    return (
        <View style={{ flex: 1, backgroundColor: Color.white }}>
            <LottieView
                autoPlay
                style={{
                    position: 'absolute',
                    zIndex: 3,
                    elevation: 5,
                    height: 150,
                    alignSelf: 'center',
                    top: '50%',
                    marginTop: -75,
                    aspectRatio: 1
                }}
                source={require('../../assets/loading.json')}
            />
        </View>
    )
}

export default AppLoading

const styles = StyleSheet.create({})