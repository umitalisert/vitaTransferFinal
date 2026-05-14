import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import ProfileMain from './main/Index'
import CarChange from './carChange/Index'
import CarDocuments from './carDocuments/Index'
import CultureSelection from './CultureSelection/Index'
import Evaluations from './evaluations/Index'
import CarDocumentShare from './carDocuments/carDocumentShare/Index'
import FuelCard from './fuelCard/Index'
import GPSDevice from './GPSDevice/Index'
import PersonalInformation from './personalInformation/Index'
import PhoneEdit from './personalInformation/phoneEdit/Index'
import PhotoEdit from './personalInformation/photoEdit/Index'
import EmailEdit from './personalInformation/emailEdit/Index'
import BirthdayEdit from './personalInformation/birthdayEdit/Index'
import MyDocuments from './myDocuments/Index'
import MyDocumentShare from './myDocuments/myDocumentShare/Index'
import MyDocumentLoad from './myDocuments/myDocumentLoad/Index'
import ServeCompany from './serveCompany/Index'
import UEDTSInformation from './UEDTSInformation/Index'
import DriverDocuments from './driverDocuments/Index'
import DriverDocumentsShare from './driverDocuments/driverDocumentShare/Index'
import AddFuelPurchase from './fuelCard/addFuelPurchase/Index'
import AddBalance from './fuelCard/addBalance/Index'
import NameEdit from './personalInformation/NameEdit/Index'
import ChangePassword from './personalInformation/changePassword/Index'

const Stack = createNativeStackNavigator();
const Index = () => {
    return (
        <Stack.Navigator>
            {/* <Stack.Screen name="ProfileMain" component={ProfileMain} options={{ headerShown: false }} />
            <Stack.Screen name="CultureSelection" component={CultureSelection} options={{ headerShown: false }} /> */}
            <Stack.Screen name="ProfileMain" component={ProfileMain} options={{ headerShown: false }} />

            <Stack.Screen name="CarChange" component={CarChange} options={{ headerShown: false }} />

            <Stack.Screen name="CarDocuments" component={CarDocuments} options={{ headerShown: false }} />
            <Stack.Screen name="CarDocumentShare" component={CarDocumentShare} options={{ headerShown: false }} />

            <Stack.Screen name="DriverDocuments" component={DriverDocuments} options={{ headerShown: false }} />
            <Stack.Screen name="DriverDocumentShare" component={DriverDocumentsShare} options={{ headerShown: false }} />

            <Stack.Screen name="PersonalInformation" component={PersonalInformation} options={{ headerShown: false }} />
            <Stack.Screen name="PhoneEdit" component={PhoneEdit} options={{ headerShown: false }} />
            <Stack.Screen name="PhotoEdit" component={PhotoEdit} options={{ headerShown: false }} />
            <Stack.Screen name="EmailEdit" component={EmailEdit} options={{ headerShown: false }} />
            <Stack.Screen name="NameEdit" component={NameEdit} options={{ headerShown: false }} />
            <Stack.Screen name="BirthdayEdit" component={BirthdayEdit} options={{ headerShown: false }} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} options={{ headerShown: false }} />

            <Stack.Screen name="MyDocuments" component={MyDocuments} options={{ headerShown: false }} />
            <Stack.Screen name="MyDocumentShare" component={MyDocumentShare} options={{ headerShown: false }} />
            <Stack.Screen name="MyDocumentLoad" component={MyDocumentLoad} options={{ headerShown: false }} />
          
            <Stack.Screen name="ServeCompany" component={ServeCompany} options={{ headerShown: false }} />

            <Stack.Screen name="FuelCard" component={FuelCard} options={{ headerShown: false }} />
            <Stack.Screen name="AddFuelPurchase" component={AddFuelPurchase} options={{ headerShown: false }} />
            <Stack.Screen name="AddBalance" component={AddBalance} options={{ headerShown: false }} />

            <Stack.Screen name="UEDTSInformation" component={UEDTSInformation} options={{ headerShown: false }} />

            <Stack.Screen name="GPSDevice" component={GPSDevice} options={{ headerShown: false }} />
            
            <Stack.Screen name="Evaluations" component={Evaluations} options={{ headerShown: false }} />
        
            <Stack.Screen name="CultureSelection" component={CultureSelection} options={{ headerShown: false }} />
            
          
           
        </Stack.Navigator>
    )
}

export default Index
