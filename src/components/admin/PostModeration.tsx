import { useState } from 'react';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Trash2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export function PostModeration() {
  const { posts: pendingPosts, isLoading, updatePostStatus, deletePost } = useCommunityPosts('pending');
  const { toast } = useToast();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (postId: string) => {
    setLoadingId(postId);
    try {
      await updatePostStatus.mutateAsync({ postId, status: 'approved' });
      toast({ title: 'Post approved!' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setLoadingId(null);
  };

  const openReject = (postId: string) => {
    setRejectId(postId);
    setRejectReason('');
    setRejectOpen(true);
  };

  const handleReject = async () => {
    if (!rejectId) return;
    setLoadingId(rejectId);
    try {
      await updatePostStatus.mutateAsync({ postId: rejectId, status: 'rejected', rejection_reason: rejectReason.trim() || undefined });
      toast({ title: 'Post rejected' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setLoadingId(null);
    setRejectOpen(false);
    setRejectId(null);
  };

  const handleDelete = async (postId: string) => {
    setLoadingId(postId);
    try {
      await deletePost.mutateAsync(postId);
      toast({ title: 'Post deleted' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setLoadingId(null);
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading posts...</div>;

  if (pendingPosts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">No pending posts to review</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pendingPosts.map(post => {
          const profile = post.profiles;
          const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

          return (
            <Card key={post.id} className="hover:shadow-md transition-all">
              <CardContent className="py-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.photo_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {profile?.full_name ? getInitials(profile.full_name) : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{profile?.full_name || 'Unknown'}</p>
                      <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
                <h4 className="font-semibold mb-1">{post.title}</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{post.content}</p>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" onClick={() => handleApprove(post.id)} disabled={loadingId === post.id} className="gap-1">
                    <CheckCircle className="h-4 w-4" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => openReject(post.id)} disabled={loadingId === post.id} className="gap-1">
                    <XCircle className="h-4 w-4" /> Reject
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(post.id)} disabled={loadingId === post.id} className="gap-1 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Post</DialogTitle>
            <DialogDescription>Optionally provide a reason for rejection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Why is this post being rejected?" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={loadingId !== null}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
