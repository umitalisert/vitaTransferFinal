import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const ChangeAvailableStatus = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/Auth/',
    Post: async (request, culture) => {
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.post(`${ChangeAvailableStatus.rootUrl + 'ChangeAvailableStatus_Async'}`, request, config)
    },
    Get: async (culture) => {
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.get(`${ChangeAvailableStatus.rootUrl + 'GetBreakTypes_Async'}`, config)
    },

}

export default ChangeAvailableStatus;