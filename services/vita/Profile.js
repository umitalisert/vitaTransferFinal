import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const Profile = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/Profile',
    Get: async (culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
         const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.get(`${Profile.rootUrl}`, config)
    }
}

export default Profile;