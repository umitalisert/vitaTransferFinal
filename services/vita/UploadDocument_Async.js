import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const UploadDocument_Async = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/Profile/UploadDocument_Async',
    Put: async (request,culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization:`${token}`, "Accept-Language": culture  ,   "content-type": "multipart/form-data", },
            //  headers: {
            //       "content-type": "multipart/form-data",
            //     },
        };
        return axios.put(`${UploadDocument_Async.rootUrl}`,request, config)
    }
}

export default UploadDocument_Async;