export interface LoginResponse {
    message: string;
    payload: {
      user_id: number;
      role: string;
    }
}
  
export interface LoginCredentials {
    username: string;
    password: string;
}

interface HoardingDetails {
  Hoarding_ID: number;
  District: string;
  "Location/Route": string;
  "Direction/Route": string;
  "Size W": number;
  "Size H": number;
  Area: number;
  Type: string;
  "Rate/Sqft 1 M": number;
  "Rate/Sqft 3 M": number;
  "Rate/Sqft 6 M": number;
  "Rate/Sqft 12 M": number;
  Floor: string;
  "Hoarding Code": string;
}

export interface HoardingData {
  request_id: number;
  created_at: string;
  updated_at: string;
  hoarding_id: number;
  current_status: string;
  media_ids: number[];
  rejection_count: number;
  requested_by: number;
  action_by: number;
  comment: string | null;
  rejected_media_ids: number[] | null;
  hoarding_details: HoardingDetails;
}

export interface SingleHoarding {
  Hoarding_ID: number;
  Hoarding_Code: string;
  District: string;
  "Location/Route": string;
  "Direction/Route": string;
  "Size W": number;
  "Size H": number;
  Area: number;
  Type: string;
  "Rate/Sqft 1 M": number;
  "Rate/Sqft 3 M": number;
  "Rate/Sqft 6 M": number;
  "Rate/Sqft 12 M": number;
  Floor: string;
}

export interface FetchSingleHoardingResponse {
  message: string;
  payload: {
      hoarding_details: SingleHoarding;
  }
}


export interface fetchHoardingsResponse {
  message: string;
  payload: {
      data: HoardingData[];
  };
}


export interface MediaUploadResponse {
  message: string;
  payload: {
      uploaded_files: string[];
      media_id: number[];
  }
}

export interface MediaData {
  media_type: "geo_image" | "image";
  presigned_url: string;
}

export interface RequestData {
  request_id: number;
  current_status: string;
  rejection_count: number;
  requested_by: number;
  action_by: number;
  created_at: string;
  updated_at: string;
}

export interface HoardingDetailsData {
  Hoarding_ID: number;
  District: string;
  "Location/Route": string;
  "Direction/Route": string;
  "Size W": number;
  "Size H": number;
  Area: number;
  Type: string;
  "Rate/Sqft 1 M": number;
  "Rate/Sqft 3 M": number;
  "Rate/Sqft 6 M": number;
  "Rate/Sqft 12 M": number;
  Floor: string;
}

export interface FetchRequestDetailsResponse {
  message: string;
  payload: {
    request_data: RequestData;
    hoarding_data: HoardingDetailsData;
    media_data: MediaData[];
  };
}