import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useConnections } from '@/hooks/useConnections';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Clock, MessageCircle, Check, Loader2, UserMinus } from 'lucide-react';

interface ConnectionButtonProps {
  userId: string;
  variant?: 'default' | 'compact';
}

export const ConnectionButton = ({ userId, variant = 'default' }: ConnectionButtonProps) => {
  const navigate = useNavigate();
  const { getConnectionStatus, sendRequest, removeConnection } = useConnections();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { status, connectionId, isSender } = getConnectionStatus(userId);

  const handleConnect = async () => {
    setLoading(true);
    const success = await sendRequest(userId);
    if (success) {
      toast({ title: 'Connection request sent!' });
    } else {
      toast({ title: 'Failed to send request', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!connectionId) return;
    setLoading(true);
    const success = await removeConnection(connectionId);
    if (success) {
      toast({ title: 'Request withdrawn' });
    } else {
      toast({ title: 'Failed to withdraw', variant: 'destructive' });
    }
    setLoading(false);
  };

  const handleMessage = () => {
    navigate(`/chat?user=${userId}`);
  };

  if (loading) {
    return (
      <Button disabled variant="outline" size={variant === 'compact' ? 'sm' : 'default'}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Please wait...
      </Button>
    );
  }

  if (status === 'accepted') {
    return (
      <div className="flex gap-2">
        <Button onClick={handleMessage} size={variant === 'compact' ? 'sm' : 'default'}>
          <MessageCircle className="h-4 w-4 mr-2" />
          Message
        </Button>
        {variant === 'default' && (
          <Button variant="outline" size="sm" onClick={handleWithdraw}>
            <UserMinus className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  if (status === 'pending') {
    if (isSender) {
      return (
        <Button 
          variant="outline" 
          onClick={handleWithdraw}
          size={variant === 'compact' ? 'sm' : 'default'}
        >
          <Clock className="h-4 w-4 mr-2" />
          Pending
        </Button>
      );
    } else {
      return (
        <Button 
          variant="secondary"
          size={variant === 'compact' ? 'sm' : 'default'}
          onClick={() => navigate('/connections')}
        >
          <Check className="h-4 w-4 mr-2" />
          Respond
        </Button>
      );
    }
  }

  return (
    <Button 
      onClick={handleConnect}
      size={variant === 'compact' ? 'sm' : 'default'}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      Connect
    </Button>
  );
};
