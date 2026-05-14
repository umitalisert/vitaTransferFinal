import axios from 'axios';
import moment from 'moment';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken, signOut } from 'firebase/auth';
import * as TaskManager from 'expo-task-manager';
const AuthPassword = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/Auth',
    Token: async (request, culture) => {
        const config = {
            headers: { "Accept-Language": culture }
        };
        return axios.post(AuthPassword.rootUrl + '/Login_Async', request, config)
    }
   
  
}

export default AuthPassword;