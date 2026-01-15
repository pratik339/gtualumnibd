import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';

export interface Connection {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  profile?: {
    id: string;
    user_id: string;
    full_name: string;
    photo_url: string | null;
    job_title: string | null;
    company: string | null;
  };
}

export const useConnections = () => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Connection[]>([]);
  const [sentRequests, setSentRequests] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch all connections involving the user
      const { data, error } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const allConnections = data || [];

      // Get all user IDs we need profiles for
      const userIds = new Set<string>();
      allConnections.forEach((conn) => {
        if (conn.requester_id !== user.id) userIds.add(conn.requester_id);
        if (conn.addressee_id !== user.id) userIds.add(conn.addressee_id);
      });

      // Fetch profiles
      let profiles: any[] = [];
      if (userIds.size > 0) {
        const { data: profileData } = await supabase
          .from('profiles_secure')
          .select('id, user_id, full_name, photo_url, job_title, company')
          .in('user_id', Array.from(userIds));
        profiles = profileData || [];
      }

      // Map profiles to connections
      const connectionsWithProfiles = allConnections.map((conn) => {
        const otherUserId = conn.requester_id === user.id ? conn.addressee_id : conn.requester_id;
        const profile = profiles.find((p) => p.user_id === otherUserId);
        return { ...conn, profile };
      });

      // Separate into categories
      const accepted = connectionsWithProfiles.filter((c) => c.status === 'accepted');
      const pending = connectionsWithProfiles.filter(
        (c) => c.status === 'pending' && c.addressee_id === user.id
      );
      const sent = connectionsWithProfiles.filter(
        (c) => c.status === 'pending' && c.requester_id === user.id
      );

      setConnections(accepted);
      setPendingRequests(pending);
      setSentRequests(sent);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('connections-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections',
        },
        () => {
          fetchConnections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchConnections]);

  const sendRequest = async (addresseeId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase.from('connections').insert({
        requester_id: user.id,
        addressee_id: addresseeId,
      });

      if (error) throw error;
      await fetchConnections();
      return true;
    } catch (error) {
      console.error('Error sending connection request:', error);
      return false;
    }
  };

  const acceptRequest = async (connectionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;
      await fetchConnections();
      return true;
    } catch (error) {
      console.error('Error accepting connection:', error);
      return false;
    }
  };

  const rejectRequest = async (connectionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;
      await fetchConnections();
      return true;
    } catch (error) {
      console.error('Error rejecting connection:', error);
      return false;
    }
  };

  const removeConnection = async (connectionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;
      await fetchConnections();
      return true;
    } catch (error) {
      console.error('Error removing connection:', error);
      return false;
    }
  };

  const getConnectionStatus = (otherUserId: string): { status: ConnectionStatus | 'none'; connectionId?: string; isSender?: boolean } => {
    const connection = [...connections, ...pendingRequests, ...sentRequests].find(
      (c) => c.requester_id === otherUserId || c.addressee_id === otherUserId
    );

    if (!connection) return { status: 'none' };

    return {
      status: connection.status,
      connectionId: connection.id,
      isSender: connection.requester_id === user?.id,
    };
  };

  const isConnected = (otherUserId: string): boolean => {
    return connections.some(
      (c) => c.requester_id === otherUserId || c.addressee_id === otherUserId
    );
  };

  return {
    connections,
    pendingRequests,
    sentRequests,
    loading,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeConnection,
    getConnectionStatus,
    isConnected,
    refetch: fetchConnections,
  };
};
