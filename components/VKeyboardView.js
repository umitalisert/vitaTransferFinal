import React from 'react';
import {
    Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Platform
} from 'react-native';

export default function VKeyboardView(props) {
    return (
        <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
            <KeyboardAvoidingView behavior={Platform.OS == 'android' ? "padding" : "height"} style={{ flex: 1 }}>
                {props.children}
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    )
}