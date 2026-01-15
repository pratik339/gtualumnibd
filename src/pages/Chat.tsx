import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { PageTransition } from '@/components/ui/page-transition';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useChat } from '@/hooks/useChat';
import { useConnections } from '@/hooks/useConnections';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MessageCircle, UserX, Users } from 'lucide-react';

const Chat = () => {
  const [searchParams] = useSearchParams();
  const { conversations, loading, startConversation } = useChat();
  const { isConnected, loading: connectionsLoading } = useConnections();
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notConnectedUser, setNotConnectedUser] = useState(false);

  // Handle starting a new conversation from URL params
  useEffect(() => {
    const userId = searchParams.get('user');
    if (userId && !connectionsLoading) {
      // Check if connected before allowing chat
      if (isConnected(userId)) {
        startConversation(userId).then((convId) => {
          if (convId) {
            setSelectedId(convId);
          }
        });
        setNotConnectedUser(false);
      } else {
        setNotConnectedUser(true);
        toast({
          title: 'Not connected',
          description: 'You need to connect with this user before messaging.',
          variant: 'destructive',
        });
      }
    }
  }, [searchParams, startConversation, isConnected, connectionsLoading, toast]);

  const selectedConversation = conversations.find((c) => c.id === selectedId) || null;

  if (loading || connectionsLoading) {
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

  if (notConnectedUser) {
    return (
      <ProtectedRoute>
        <Layout>
          <PageTransition>
            <div className="container mx-auto px-4 py-8">
              <Card className="max-w-md mx-auto p-8 text-center">
                <UserX className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Not Connected</h2>
                <p className="text-muted-foreground mb-6">
                  You need to be connected with this user before you can send messages.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to="/directory">
                    <Button variant="outline">Browse Directory</Button>
                  </Link>
                  <Link to="/connections">
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      My Network
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          </PageTransition>
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
