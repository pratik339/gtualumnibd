import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  participants: {
    user_id: string;
    profile: {
      id: string;
      full_name: string;
      photo_url: string | null;
    } | null;
  }[];
  last_message?: Message;
}

export const useChat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data: convos, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          updated_at,
          conversation_participants (
            user_id
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch participant profiles and last messages
      const conversationsWithDetails = await Promise.all(
        (convos || []).map(async (conv) => {
          const participantIds = conv.conversation_participants.map((p: any) => p.user_id);
          
          // Fetch profiles for participants
          const { data: profiles } = await supabase
            .from('profiles_secure')
            .select('id, user_id, full_name, photo_url')
            .in('user_id', participantIds);

          // Fetch last message
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            id: conv.id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            participants: conv.conversation_participants.map((p: any) => ({
              user_id: p.user_id,
              profile: profiles?.find((pr) => pr.user_id === p.user_id) || null,
            })),
            last_message: messages?.[0] || undefined,
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const startConversation = async (otherUserId: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Check if conversation already exists
      const { data: existingConvos } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (existingConvos) {
        for (const conv of existingConvos) {
          const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id);

          if (participants?.length === 2) {
            const userIds = participants.map(p => p.user_id);
            if (userIds.includes(user.id) && userIds.includes(otherUserId)) {
              return conv.conversation_id;
            }
          }
        }
      }

      // Create new conversation
      const { data: newConvo, error: convoError } = await supabase
        .from('conversations')
        .insert({})
        .select()
        .single();

      if (convoError) throw convoError;

      // Add participants
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConvo.id, user_id: user.id },
          { conversation_id: newConvo.id, user_id: otherUserId },
        ]);

      if (participantsError) throw participantsError;

      await fetchConversations();
      return newConvo.id;
    } catch (error) {
      console.error('Error starting conversation:', error);
      return null;
    }
  };

  return {
    conversations,
    loading,
    startConversation,
    refetch: fetchConversations,
  };
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const sendMessage = async (content: string) => {
    if (!user || !conversationId || !content.trim()) return false;

    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: content.trim(),
      });

      if (error) throw error;

      // Update conversation's updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
  };
};
