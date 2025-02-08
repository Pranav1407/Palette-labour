import { fetchHoardingsResponse, FetchRequestDetailsResponse, FetchSingleHoardingResponse, LoginCredentials, LoginResponse, MediaUploadResponse } from "@/types/Types";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
        const response = await axios.post(`${API_URL}/user/login`, credentials);
        return response.data;
    }
    catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

export const fetchHoardings = async (): Promise<fetchHoardingsResponse> => {
    const user_id = sessionStorage.getItem('user_id');
    try {
        const response = await axios.post(`${API_URL}/list/hoardings/labour?user_id=${user_id}`);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching hoardings:', error);
        throw error;
    }
};

export const addHoardingTask = async (taskData: any): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/add/hoardings_task`, taskData);
        return response.data;
    }
    catch (error) {
        console.error('Error adding hoarding task:', error);
        throw error;
    }
};

export const uploadMedia = async (mediaData: FormData): Promise<MediaUploadResponse> => {
    try {
        const response = await axios.post(`${API_URL}/media/upload`, mediaData);
        return response.data;
    }
    catch (error) {
        console.error('Error uploading media:', error);
        throw error;
    }
}

export const fetchSingleHoarding = async (id: string): Promise<FetchSingleHoardingResponse> => {
    try {
        const response = await axios.get(`${API_URL}/hoarding/details/single?hoarding_code=${id}`);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching single hoarding:', error);
        throw error;
    }
}

export const fetchRequestDetails = async (id: string): Promise<FetchRequestDetailsResponse> => {
    try {
        const response = await axios.post(`${API_URL}/details/request/full?request_id=${id}`);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching single hoarding:', error);
        throw error;
    }
}

export const redoRejected = async (request_id:(string | undefined) , data:Number[]):Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/redo/rejected?request_id=${request_id}`, data);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching single hoarding:', error);
        throw error;
    }
}