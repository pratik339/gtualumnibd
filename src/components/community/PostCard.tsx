import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { CommunityPost } from '@/hooks/useCommunityPosts';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

interface PostCardProps {
  post: CommunityPost;
  onDelete?: (id: string) => void;
  showStatus?: boolean;
}

function isVideoUrl(url: string): boolean {
  const lower = url.toLowerCase();
  return lower.includes('.mp4') || lower.includes('.webm') || lower.includes('.mov');
}

export function PostCard({ post, onDelete, showStatus }: PostCardProps) {
  const { user, isAdmin } = useAuth();
  const isOwner = user?.id === post.user_id;
  const profile = post.profiles;

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const statusBadge = () => {
    if (!showStatus) return null;
    switch (post.status) {
      case 'pending': return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'approved': return <Badge className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected': return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default: return null;
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.photo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {profile?.full_name ? getInitials(profile.full_name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{profile?.full_name || 'Unknown User'}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {profile?.job_title && profile?.company
                    ? `${profile.job_title} at ${profile.company}`
                    : <span className="capitalize">{profile?.user_type || ''}</span>}
                  <span>•</span>
                  <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statusBadge()}
              {(isOwner || isAdmin) && onDelete && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(post.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
          <p className="text-muted-foreground whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>

          {post.image_url && (
            <div className="mt-3 rounded-lg overflow-hidden border border-border">
              {isVideoUrl(post.image_url) ? (
                <video src={post.image_url} controls className="w-full max-h-96 object-contain bg-muted" />
              ) : (
                <img src={post.image_url} alt="Post media" className="w-full max-h-96 object-contain bg-muted" loading="lazy" />
              )}
            </div>
          )}

          {post.status === 'rejected' && post.rejection_reason && (
            <div className="mt-3 p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-xs font-medium text-destructive">Rejection reason: {post.rejection_reason}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
