import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const UpdatePassword = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/Profile/UpdatePassword',
    Put: async (request,culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.put(`${UpdatePassword.rootUrl}`,request, config)
    }
}

export default UpdatePassword;