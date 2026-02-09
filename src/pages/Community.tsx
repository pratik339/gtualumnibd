import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { PostCard } from '@/components/community/PostCard';
import { CreatePostDialog } from '@/components/community/CreatePostDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { PenSquare, Loader2, Newspaper, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function Community() {
  const [createOpen, setCreateOpen] = useState(false);
  const { posts: approvedPosts, isLoading: loadingApproved, deletePost } = useCommunityPosts('approved');
  const { posts: myPosts, isLoading: loadingMine } = useCommunityPosts('mine');
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await deletePost.mutateAsync(id);
      toast({ title: 'Post deleted' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Newspaper className="h-8 w-8 text-primary" />
                Community
              </h1>
              <p className="text-muted-foreground mt-1">Share updates, achievements & notices</p>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <PenSquare className="h-4 w-4" /> New Post
            </Button>
          </div>

          <Tabs defaultValue="feed">
            <TabsList className="mb-6">
              <TabsTrigger value="feed" className="gap-1"><Newspaper className="h-4 w-4" /> Feed</TabsTrigger>
              <TabsTrigger value="my-posts" className="gap-1"><Clock className="h-4 w-4" /> My Posts</TabsTrigger>
            </TabsList>

            <TabsContent value="feed">
              {loadingApproved ? (
                <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}</div>
              ) : approvedPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">Be the first to share something with the community!</p>
                    <Button onClick={() => setCreateOpen(true)} className="gap-2"><PenSquare className="h-4 w-4" /> Create Post</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {approvedPosts.map(post => (
                    <PostCard key={post.id} post={post} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my-posts">
              {loadingMine ? (
                <div className="space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-40 w-full rounded-lg" />)}</div>
              ) : myPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">Your submitted posts will appear here with their review status.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {myPosts.map(post => (
                    <PostCard key={post.id} post={post} onDelete={handleDelete} showStatus />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <CreatePostDialog open={createOpen} onOpenChange={setCreateOpen} />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
