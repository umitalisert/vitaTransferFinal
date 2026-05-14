import axios from 'axios';
import moment from 'moment';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken, signOut } from 'firebase/auth';
import * as TaskManager from 'expo-task-manager';
import useAuthStore from '../../zustand/AuthStore';

const Auth = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/Auth',
    Otp: async (request, culture) => {
        const config = {
            headers: { "Accept-Language": culture }
        };
        return axios.post(Auth.rootUrl + '/Otp_Async', request, config)
    },
    Token: async (request, culture) => {
        const config = {
            headers: { "Accept-Language": culture }
        };
        return axios.post(Auth.rootUrl + '/Token_Async', request, config)
    },
    SaveLocation_Async: async (request) => {
        return axios.post(Auth.rootUrl + '/SaveLocation_Async', request)
    },
    UpdateExpoToken_Async: async (request) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token=useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        return axios.post(`${Auth.rootUrl}/UpdateExpoToken_Async`, request, config);
    },
    signOut: () => {
        const auth = getAuth();
        signOut(auth).then(() => {
            TaskManager.unregisterAllTasksAsync();
        }).catch((error) => {
        });
    }
}

export default Auth;