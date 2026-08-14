import { StyleSheet, Text, View, Button, Dimensions , TouchableOpacity, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react'
import { useState, useEffect } from 'react';
import { CameraView, useCameraPermissions } from "expo-camera";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const Index = () => {
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setFlashMode(false);
    Alert.alert("Başarılı", `Tipi ${type}\nVerisi ${data}`, [
      { text: "Tamam", onPress: () => setScanned(false) }
    ]);
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ textAlign: 'center', marginBottom: 20, fontSize: 16 }}>Kamerayı kullanabilmek için izninize ihtiyacımız var.</Text>
        <Button onPress={requestPermission} title="İzin Ver" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons style={{ position: 'absolute', elevation: 5, zIndex: 5, alignSelf: 'center', top: '50%', marginTop: -1 * Dimensions.get("window").width / 4 }} name="square-rounded-outline" size={Dimensions.get("window").width / 2} color="white" />
      
      <View style={{
          top: 60,
          right: 0,
          marginHorizontal: 20,
          position: "absolute",
          zIndex: 100,
        }}>
          <TouchableOpacity
            style={{ alignItems: "center", marginBottom: 25 }}
            onPress={() => setFlashMode(!flashMode)}
          >
            <MaterialCommunityIcons
              name={flashMode === false ? "flashlight-off" : "flashlight"}
              size={34}
              color={"white"}
            />
          </TouchableOpacity>
        </View>

      <CameraView
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"],
        }}
        enableTorch={flashMode}
        style={StyleSheet.absoluteFillObject}
      />

      {scanned && (
        <TouchableOpacity 
          onPress={() => setScanned(false)} 
          style={{ position: 'absolute', bottom: 120, alignSelf: 'center', backgroundColor: 'white', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30, zIndex: 100, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>Tekrar Tara</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default Index

const styles = StyleSheet.create({
  container: { flex: 1 }
})