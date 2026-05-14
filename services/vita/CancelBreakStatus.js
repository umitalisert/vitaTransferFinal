import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const CancelBreakStatus_Async = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/Auth/',
    Post: async (request , culture) => {
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.post(`${CancelBreakStatus_Async.rootUrl + 'CancelBreakStatus_Async'}`,request,  config)
    },
}

export default CancelBreakStatus_Async;