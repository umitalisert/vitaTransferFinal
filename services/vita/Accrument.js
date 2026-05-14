import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const Accrument = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/Accrument_V2',
    Get: async (startdate, enddate, culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.get(Accrument.rootUrl + '/' + startdate + '/' + enddate, config)
    },
}

export default Accrument;