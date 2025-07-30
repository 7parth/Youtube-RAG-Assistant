import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, MessageCircle, Loader2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { Message } from '@/types/chat';

interface ChatInterfaceProps {
  hasProcessedVideo: boolean;
}

interface FormData {
  question: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ hasProcessedVideo }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const question = watch('question');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const onSubmit = async (data: FormData) => {
    if (!hasProcessedVideo) {
      toast.error('Please process a video first');
      return;
    }

    if (!data.question.trim()) {
      return;
    }

    const userQuestion = data.question.trim();
    addMessage(userQuestion, true);
    reset();
    setIsLoading(true);

    try {
      const response = await apiService.queryVideo(userQuestion);
      if (response.success) {
        addMessage(response.answer, false);
      } else {
        addMessage(response.message || 'Sorry, I couldn\'t process your question.', false);
        toast.error(response.message || 'Failed to get answer');
      }
    } catch (error) {
      console.error('Error querying video:', error);
      addMessage('Sorry, there was an error processing your question. Please try again.', false);
      toast.error('Failed to get answer. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="h-full flex flex-col"
    >
      <Card className="flex-1 bg-card border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Chat</h2>
          </div>
          {!hasProcessedVideo && (
            <p className="text-sm text-muted-foreground mt-1">
              Process a video to start chatting
            </p>
          )}
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {hasProcessedVideo
                      ? 'Ask me anything about the video!'
                      : 'Process a video to start asking questions'}
                  </p>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.isUser
                          ? 'bg-gradient-user text-primary-foreground ml-4'
                          : 'bg-gradient-ai text-foreground mr-4'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {!message.isUser && (
                          <Bot className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                        )}
                        {message.isUser && (
                          <User className="h-4 w-4 mt-0.5 text-primary-foreground flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-gradient-ai text-foreground rounded-lg p-3 mr-4">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
            <Input
              placeholder={hasProcessedVideo ? "Ask a question about the video..." : "Process a video first"}
              disabled={!hasProcessedVideo || isLoading}
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
              {...register('question', {
                required: 'Please enter a question',
                minLength: {
                  value: 3,
                  message: 'Question must be at least 3 characters',
                },
              })}
            />
            <Button
              type="submit"
              disabled={!hasProcessedVideo || isLoading || !question?.trim()}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          {errors.question && (
            <p className="text-sm text-destructive mt-1">{errors.question.message}</p>
          )}
        </div>
      </Card>
    </motion.div>
  );
};