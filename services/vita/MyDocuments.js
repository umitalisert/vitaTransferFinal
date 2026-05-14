import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const MyDocuments = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/Profile/MyDocuments',
    Get: async (culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token = useAuthStore.getState().loginUser.token

        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.get(`${MyDocuments.rootUrl}`, config)
    }
}

export default MyDocuments;