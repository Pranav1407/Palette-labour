import { fetchHoardingsResponse, FetchRequestDetailsResponse, FetchSingleHoardingResponse, LoginCredentials, LoginResponse, MediaUploadResponse } from "@/types/Types";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': 'Bearer qwerty123@123',
      'Content-Type': 'application/json'
    }
  });

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
        const response = await axiosInstance.post(`${API_URL}/user/login`, credentials);
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
        const response = await axiosInstance.post(`${API_URL}/list/hoardings/labour?user_id=${user_id}`);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching hoardings:', error);
        throw error;
    }
};

export const addHoardingTask = async (taskData: any): Promise<any> => {
    try {
        const response = await axiosInstance.post(`${API_URL}/add/hoardings_task`, taskData);
        return response.data;
    }
    catch (error) {
        console.error('Error adding hoarding task:', error);
        throw error;
    }
};

export const uploadMedia = async (mediaData: FormData): Promise<MediaUploadResponse> => {
    for (const pair of mediaData.entries()) {
        console.log(pair[0], pair[1]);
      }
    try {
        const response = await axiosInstance.post(`${API_URL}/media/upload`, mediaData,{
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
    catch (error) {
        console.error('Error uploading media:', error);
        throw error;
    }
}

export const fetchSingleHoarding = async (id: string): Promise<FetchSingleHoardingResponse> => {
    try {
        const response = await axiosInstance.get(`${API_URL}/hoarding/details/single?hoarding_code=${id}`);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching single hoarding:', error);
        throw error;
    }
}

export const fetchRequestDetails = async (id: string): Promise<FetchRequestDetailsResponse> => {
    try {
        const response = await axiosInstance.post(`${API_URL}/details/request/full?request_id=${id}`);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching single hoarding:', error);
        throw error;
    }
}

export const redoRejected = async (request_id:(string | undefined) , data:Number[]):Promise<any> => {
    try {
        const response = await axiosInstance.post(`${API_URL}/redo/rejected?request_id=${request_id}`, data);
        return response.data;
    }
    catch (error) {
        console.error('Error fetching single hoarding:', error);
        throw error;
    }
}