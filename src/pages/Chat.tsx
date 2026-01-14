import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { PageTransition } from '@/components/ui/page-transition';
import { Card } from '@/components/ui/card';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChat } from '@/hooks/useChat';
import { Loader2, MessageCircle } from 'lucide-react';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const { conversations, loading, startConversation, refetch } = useChat();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Handle starting a new conversation from URL params
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId) {
      startConversation(userId).then((convId) => {
        if (convId) {
          setSelectedId(convId);
        }
      });
    }
  }, [searchParams, startConversation]);

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null;

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>
        <PageTransition>
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <MessageCircle className="h-8 w-8 text-primary" />
                Messages
              </h1>
              <p className="text-muted-foreground mt-2">
                Chat with other alumni and students
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="h-[calc(100vh-250px)] min-h-[500px] overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 h-full">
                  {/* Conversation List */}
                  <div className="border-r hidden md:block">
                    <div className="p-4 border-b">
                      <h2 className="font-semibold">Conversations</h2>
                    </div>
                    <div className="h-[calc(100%-57px)]">
                      <ChatList
                        conversations={conversations}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                      />
                    </div>
                  </div>

                  {/* Chat Window - Mobile: show list or chat */}
                  <div className="col-span-2 h-full">
                    <div className="md:hidden h-full">
                      {selectedId ? (
                        <div className="h-full flex flex-col">
                          <button
                            onClick={() => setSelectedId(null)}
                            className="p-3 border-b text-sm text-primary hover:underline text-left"
                          >
                            ← Back to conversations
                          </button>
                          <div className="flex-1">
                            <ChatWindow conversation={selectedConversation} />
                          </div>
                        </div>
                      ) : (
                        <div className="h-full">
                          <div className="p-4 border-b">
                            <h2 className="font-semibold">Conversations</h2>
                          </div>
                          <div className="h-[calc(100%-57px)]">
                            <ChatList
                              conversations={conversations}
                              selectedId={selectedId}
                              onSelect={setSelectedId}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="hidden md:block h-full">
                      <ChatWindow conversation={selectedConversation} />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </PageTransition>
      </Layout>
    </ProtectedRoute>
  );
};

export default Chat;
