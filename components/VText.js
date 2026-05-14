import React from 'react';
import {
    Text,
    StyleSheet,
} from 'react-native';
import Color from './Color';

export default function VText(props) {
    return (
        <Text ref={props.ref} numberOfLines={props.numberOfLines} onKeyPress={props.onKeyPress} style={[(props.light ? styles.light : props.regular ? styles.regular : props.medium ? styles.medium : props.semiBold ? styles.semiBold : props.bold ? styles.bold : styles.regular), (props.white ? styles.white : props.darkGrey ? styles.darkGrey : props.greyText ? styles.greyText : props.green ? styles.green : props.primary ? styles.primary : props.red ? styles.red : props.purple ? styles.purple : styles.black), props.style]}>
            {props.children}
        </Text>
    );
}

const styles = StyleSheet.create({
    light: {
        fontFamily: 'Nunito_300Light',
        fontWeight: '300',
    },
    regular: {
        fontFamily: 'Nunito_400Regular',
        fontWeight: '400'
    },
    medium: {
        fontFamily: 'Nunito_500Medium',
        fontWeight: '500'
    },
    semiBold: {
        fontFamily: 'Nunito_600SemiBold',
        fontWeight: '600'
    },
    bold: {
        fontFamily: 'Nunito_700Bold',
        fontWeight: '700'
    },
    white: {
        color: Color.white
    },
    black: {
        color: Color.black
    },
    darkGrey: {
        color: Color.darkGrey
    },
    greyText: {
        color: Color.greyText
    },
    red: {
        color: Color.red
    },
    green: {
        color: Color.green
    },
    primary: {
        color: Color.primary
    },
    purple: {
        color: Color.primary
    }
});