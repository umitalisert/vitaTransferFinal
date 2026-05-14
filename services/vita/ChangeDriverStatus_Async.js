import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const ChangeDriverStatus_Async = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/Auth/',
    Get: async (request , culture) => {
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.post(`${ChangeDriverStatus_Async.rootUrl + 'ChangeDriverStatus_Async'}`,request,  config)
    },
}

export default ChangeDriverStatus_Async;