import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { PageTransition } from '@/components/ui/page-transition';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useConnections } from '@/hooks/useConnections';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, UserPlus, Clock, Check, X, MessageCircle, 
  Loader2, UserCheck, Send 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const Connections = () => {
  const { 
    connections, 
    pendingRequests, 
    sentRequests, 
    loading, 
    acceptRequest, 
    rejectRequest,
    removeConnection 
  } = useConnections();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    const success = await acceptRequest(id);
    if (success) {
      toast({ title: 'Connection accepted!' });
    } else {
      toast({ title: 'Failed to accept', variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    const success = await rejectRequest(id);
    if (success) {
      toast({ title: 'Request declined' });
    } else {
      toast({ title: 'Failed to decline', variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleRemove = async (id: string) => {
    setProcessingId(id);
    const success = await removeConnection(id);
    if (success) {
      toast({ title: 'Connection removed' });
    } else {
      toast({ title: 'Failed to remove', variant: 'destructive' });
    }
    setProcessingId(null);
  };

  const handleCancelRequest = async (id: string) => {
    setProcessingId(id);
    const success = await removeConnection(id);
    if (success) {
      toast({ title: 'Request cancelled' });
    } else {
      toast({ title: 'Failed to cancel', variant: 'destructive' });
    }
    setProcessingId(null);
  };

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
                <Users className="h-8 w-8 text-primary" />
                My Network
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your connections and requests
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Tabs defaultValue="connections" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="connections" className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Connections
                    {connections.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {connections.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="requests" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Requests
                    {pendingRequests.length > 0 && (
                      <Badge variant="default" className="ml-1">
                        {pendingRequests.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Sent
                    {sentRequests.length > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {sentRequests.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Connections Tab */}
                <TabsContent value="connections">
                  {connections.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No connections yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                          Start building your network by connecting with alumni and students
                        </p>
                        <Link to="/directory">
                          <Button>Browse Directory</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {connections.map((conn) => (
                        <Card key={conn.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Link to={`/profile/${conn.profile?.id}`}>
                                <Avatar className="h-14 w-14 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                                  <AvatarImage src={conn.profile?.photo_url || undefined} />
                                  <AvatarFallback>
                                    {conn.profile?.full_name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className="flex-1 min-w-0">
                                <Link to={`/profile/${conn.profile?.id}`}>
                                  <h3 className="font-semibold truncate hover:text-primary transition-colors">
                                    {conn.profile?.full_name || 'Unknown User'}
                                  </h3>
                                </Link>
                                {conn.profile?.job_title && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {conn.profile.job_title}
                                    {conn.profile.company && ` at ${conn.profile.company}`}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Connected {formatDistanceToNow(new Date(conn.updated_at), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Link to={`/chat?user=${conn.profile?.user_id}`} className="flex-1">
                                <Button variant="default" size="sm" className="w-full">
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  Message
                                </Button>
                              </Link>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemove(conn.id)}
                                disabled={processingId === conn.id}
                              >
                                {processingId === conn.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Pending Requests Tab */}
                <TabsContent value="requests">
                  {pendingRequests.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Clock className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No pending requests</h3>
                        <p className="text-muted-foreground text-center">
                          When someone wants to connect with you, it will appear here
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((conn) => (
                        <Card key={conn.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Link to={`/profile/${conn.profile?.id}`}>
                                <Avatar className="h-14 w-14 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                                  <AvatarImage src={conn.profile?.photo_url || undefined} />
                                  <AvatarFallback>
                                    {conn.profile?.full_name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className="flex-1 min-w-0">
                                <Link to={`/profile/${conn.profile?.id}`}>
                                  <h3 className="font-semibold hover:text-primary transition-colors">
                                    {conn.profile?.full_name || 'Unknown User'}
                                  </h3>
                                </Link>
                                {conn.profile?.job_title && (
                                  <p className="text-sm text-muted-foreground">
                                    {conn.profile.job_title}
                                    {conn.profile.company && ` at ${conn.profile.company}`}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  Sent {formatDistanceToNow(new Date(conn.created_at), { addSuffix: true })}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAccept(conn.id)}
                                  disabled={processingId === conn.id}
                                >
                                  {processingId === conn.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-1" />
                                      Accept
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(conn.id)}
                                  disabled={processingId === conn.id}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Sent Requests Tab */}
                <TabsContent value="sent">
                  {sentRequests.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Send className="h-16 w-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No pending sent requests</h3>
                        <p className="text-muted-foreground text-center mb-4">
                          Connection requests you send will appear here until accepted
                        </p>
                        <Link to="/directory">
                          <Button>Browse Directory</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {sentRequests.map((conn) => (
                        <Card key={conn.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <Link to={`/profile/${conn.profile?.id}`}>
                                <Avatar className="h-14 w-14 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                                  <AvatarImage src={conn.profile?.photo_url || undefined} />
                                  <AvatarFallback>
                                    {conn.profile?.full_name?.charAt(0) || '?'}
                                  </AvatarFallback>
                                </Avatar>
                              </Link>
                              <div className="flex-1 min-w-0">
                                <Link to={`/profile/${conn.profile?.id}`}>
                                  <h3 className="font-semibold hover:text-primary transition-colors">
                                    {conn.profile?.full_name || 'Unknown User'}
                                  </h3>
                                </Link>
                                {conn.profile?.job_title && (
                                  <p className="text-sm text-muted-foreground">
                                    {conn.profile.job_title}
                                    {conn.profile.company && ` at ${conn.profile.company}`}
                                  </p>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    Pending
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Sent {formatDistanceToNow(new Date(conn.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelRequest(conn.id)}
                                disabled={processingId === conn.id}
                              >
                                {processingId === conn.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Withdraw'
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </PageTransition>
      </Layout>
    </ProtectedRoute>
  );
};

export default Connections;
