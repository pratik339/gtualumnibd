import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

// Simple notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.log('Audio not supported:', error);
  }
};

export const useNotifications = () => {
  const { user } = useAuth();
  const initializedRef = useRef(false);

  const showNotification = useCallback((title: string, description: string) => {
    playNotificationSound();
    toast({
      title,
      description,
    });
  }, []);

  useEffect(() => {
    if (!user || initializedRef.current) return;
    initializedRef.current = true;

    // Listen for new connection requests
    const connectionsChannel = supabase
      .channel('notifications-connections')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'connections',
          filter: `addressee_id=eq.${user.id}`,
        },
        async (payload) => {
          // Fetch the requester's profile to get their name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', payload.new.requester_id)
            .single();

          const name = profile?.full_name || 'Someone';
          showNotification(
            'New Connection Request',
            `${name} wants to connect with you`
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'connections',
          filter: `requester_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.new.status === 'accepted') {
            // Fetch the addressee's profile to get their name
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', payload.new.addressee_id)
              .single();

            const name = profile?.full_name || 'Someone';
            showNotification(
              'Connection Accepted',
              `${name} accepted your connection request`
            );
          }
        }
      )
      .subscribe();

    // Listen for new messages
    const messagesChannel = supabase
      .channel('notifications-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          // Only notify if the message is not from the current user
          if (payload.new.sender_id === user.id) return;

          // Check if user is a participant in this conversation
          const { data: participant } = await supabase
            .from('conversation_participants')
            .select('id')
            .eq('conversation_id', payload.new.conversation_id)
            .eq('user_id', user.id)
            .single();

          if (!participant) return;

          // Fetch the sender's profile to get their name
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', payload.new.sender_id)
            .single();

          const name = profile?.full_name || 'Someone';
          const messagePreview = payload.new.content.length > 50 
            ? payload.new.content.substring(0, 50) + '...' 
            : payload.new.content;

          showNotification(
            `New Message from ${name}`,
            messagePreview
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(connectionsChannel);
      supabase.removeChannel(messagesChannel);
      initializedRef.current = false;
    };
  }, [user, showNotification]);
};
