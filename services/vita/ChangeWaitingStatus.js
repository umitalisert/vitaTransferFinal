import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const ChangeWaitingStatus = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/WorkOrder/',
    Post: async (request, culture) => {
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.post(`${ChangeWaitingStatus.rootUrl + 'ChangeWaitingStatus'}`, request, config)
    },
}

export default ChangeWaitingStatus;