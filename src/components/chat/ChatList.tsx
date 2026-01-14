import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/hooks/useChat';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle } from 'lucide-react';

interface ChatListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ChatList = ({ conversations, selectedId, onSelect }: ChatListProps) => {
  const { user } = useAuth();

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find((p) => p.user_id !== user?.id);
  };

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
        <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-center">No conversations yet</p>
        <p className="text-sm text-center mt-2">
          Start a conversation from a user's profile
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => {
          const other = getOtherParticipant(conversation);
          const isSelected = selectedId === conversation.id;

          return (
            <button
              key={conversation.id}
              onClick={() => onSelect(conversation.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                isSelected
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-muted'
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={other?.profile?.photo_url || undefined} />
                <AvatarFallback>
                  {other?.profile?.full_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {other?.profile?.full_name || 'Unknown User'}
                </p>
                {conversation.last_message && (
                  <p className="text-sm text-muted-foreground truncate">
                    {conversation.last_message.sender_id === user?.id && 'You: '}
                    {conversation.last_message.content}
                  </p>
                )}
              </div>
              {conversation.last_message && (
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conversation.last_message.created_at), {
                    addSuffix: false,
                  })}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
};
