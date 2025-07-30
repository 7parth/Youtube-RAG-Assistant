import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Loader2, Video, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '@/services/api';
import { isValidYouTubeUrl, formatVideoId } from '@/utils/youtube';

interface VideoProcessorProps {
  onVideoProcessed: (videoId: string) => void;
}

interface FormData {
  videoUrl: string;
}

export const VideoProcessor: React.FC<VideoProcessorProps> = ({ onVideoProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedVideoId, setProcessedVideoId] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  React.useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      await apiService.checkHealth();
      setApiStatus('online');
    } catch (error) {
      setApiStatus('offline');
      toast.error('Backend API is not accessible. Please ensure it\'s running on localhost:8000');
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!isValidYouTubeUrl(data.videoUrl)) {
      toast.error('Please enter a valid YouTube URL');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiService.processVideo(data.videoUrl);
      if (response.success) {
        setProcessedVideoId(response.video_id);
        onVideoProcessed(response.video_id);
        toast.success('Video processed successfully!');
        reset();
      } else {
        toast.error(response.message || 'Failed to process video');
      }
    } catch (error) {
      console.error('Error processing video:', error);
      toast.error('Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="h-full flex flex-col"
    >
      <Card className="flex-1 bg-card border-border">
        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <Video className="h-8 w-8 mx-auto text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Process Video</h2>
            <p className="text-sm text-muted-foreground">
              Enter a YouTube URL to start asking questions
            </p>
          </div>

          {/* API Status */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            {apiStatus === 'checking' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Checking API...</span>
              </>
            )}
            {apiStatus === 'online' && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-green-500">API Connected</span>
              </>
            )}
            {apiStatus === 'offline' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-500">API Offline</span>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl" className="text-foreground">
                YouTube URL
              </Label>
              <Input
                id="videoUrl"
                placeholder="https://www.youtube.com/watch?v=..."
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                {...register('videoUrl', {
                  required: 'YouTube URL is required',
                  validate: (value) =>
                    isValidYouTubeUrl(value) || 'Please enter a valid YouTube URL',
                })}
              />
              {errors.videoUrl && (
                <p className="text-sm text-destructive">{errors.videoUrl.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isProcessing || apiStatus === 'offline'}
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium transition-all duration-300"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Video...
                </>
              ) : (
                'Process Video'
              )}
            </Button>
          </form>

          {processedVideoId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="p-4 bg-gradient-secondary rounded-lg border border-border"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-foreground">Video Ready</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {formatVideoId(processedVideoId)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};