import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { Youtube, Sparkles } from 'lucide-react';
import { VideoProcessor } from '@/components/VideoProcessor';
import { ChatInterface } from '@/components/ChatInterface';

const Index = () => {
  const [hasProcessedVideo, setHasProcessedVideo] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  const handleVideoProcessed = (videoId: string) => {
    setCurrentVideoId(videoId);
    setHasProcessedVideo(true);
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border bg-card/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Youtube className="h-8 w-8 text-red-500" />
              <Sparkles className="h-4 w-4 text-primary absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">YouTube RAG Assistant</h1>
              <p className="text-sm text-muted-foreground">Ask questions about any YouTube video</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 h-[calc(100vh-100px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left Panel - Video Processor */}
          <VideoProcessor onVideoProcessed={handleVideoProcessed} />

          {/* Right Panel - Chat Interface */}
          <ChatInterface hasProcessedVideo={hasProcessedVideo} />
        </div>
      </main>
    </div>
  );
};

export default Index;
