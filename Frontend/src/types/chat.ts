export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface VideoProcessResponse {
  success: boolean;
  video_id: string;
  message: string;
}

export interface QueryResponse {
  success: boolean;
  answer: string;
  message?: string;
}

export interface HealthResponse {
  status: string;
  message: string;
}