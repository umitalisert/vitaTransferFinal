import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const UnAssignDriver = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/WorkOrder/UnAssignDriver',
    Post: async (request, culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.post(`${UnAssignDriver.rootUrl}`, request, config)
    },




}

export default UnAssignDriver;