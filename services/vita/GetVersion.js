import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const GetVersion = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/Auth/',
    Get: async () => {
        // const token = useAuthStore.getState().loginUser.token
        // const config = {
        //     headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        // };
        return axios.get(`${GetVersion.rootUrl + 'GetVersion'}`)
    },

}

export default GetVersion;