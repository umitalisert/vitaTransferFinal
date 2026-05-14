import axios from 'axios';
import { getApp } from 'firebase/app';
import { getAuth, getIdToken } from 'firebase/auth';
import useAuthStore from '../../zustand/AuthStore';

const WorkOrder = {
    rootUrl: 'https://vitadrivetransferapi-test.vitarnd.com/api/WorkOrder',
    GetWorkOrders: async (date, culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.get(`${WorkOrder.rootUrl}/GetWorkOrders/${date}`, config)
    },
    GetWorkOrderDetail: async (id, culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.get(`${WorkOrder.rootUrl}/GetWorkOrderDetail/${id}`, config)
    },
    UpdateWorkOrderOfferStatus: async (request, culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token = useAuthStore.getState().loginUser.token
        const config = {
            
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
       
        return axios.post(`${WorkOrder.rootUrl}/UpdateWorkOrderOfferStatus`, request, config);
    },
    UpdateWorkOrderStatus: async (request, culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token = useAuthStore.getState().loginUser.token
         const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.post(`${WorkOrder.rootUrl}/UpdateWorkOrderStatus`, request, config);
    },
    noShow: async (request, culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.post(`${WorkOrder.rootUrl}/UpdateWorkOrderStatus`, request, config);
    },
    RemoveWorkOrderStatus: async (request, culture) => {
        // const app = getApp();
        // const auth = getAuth(app);
        // const token = await getIdToken(auth.currentUser);
        const token = useAuthStore.getState().loginUser.token
        const config = {
            headers: { Authorization: `Bearer ${token}`, "Accept-Language": culture }
        };
        return axios.post(`${WorkOrder.rootUrl}/RemoveWorkOrderStatus`, request, config);
    }
}

export default WorkOrder;