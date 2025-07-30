import axios from 'axios';
import { VideoProcessResponse, QueryResponse, HealthResponse } from '@/types/chat';

const API_BASE_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  async checkHealth(): Promise<HealthResponse> {
    const response = await api.get('/health');
    return response.data;
  },

  async processVideo(videoUrl: string): Promise<VideoProcessResponse> {
    const response = await api.post('/process-video', {
      video_url: videoUrl,
    });
    return response.data;
  },

  async queryVideo(question: string): Promise<QueryResponse> {
    const response = await api.post('/query', {
      question: question,
    });
    return response.data;
  },
};