import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { Loader2, Send } from 'lucide-react';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { createPost } = useCommunityPosts();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Missing fields', description: 'Please fill in title and content.', variant: 'destructive' });
      return;
    }
    if (title.trim().length > 200) {
      toast({ title: 'Title too long', description: 'Title must be under 200 characters.', variant: 'destructive' });
      return;
    }
    if (content.trim().length > 5000) {
      toast({ title: 'Content too long', description: 'Content must be under 5000 characters.', variant: 'destructive' });
      return;
    }

    try {
      await createPost.mutateAsync({ title: title.trim(), content: content.trim() });
      toast({ title: 'Post submitted!', description: 'Your post will be visible after admin approval.' });
      setTitle('');
      setContent('');
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a Post</DialogTitle>
          <DialogDescription>Share updates, achievements, or notices with the community. Posts require admin approval.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="post-title">Title</Label>
            <Input id="post-title" placeholder="What's this about?" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="post-content">Content</Label>
            <Textarea id="post-content" placeholder="Write your post..." value={content} onChange={(e) => setContent(e.target.value)} rows={6} maxLength={5000} />
            <p className="text-xs text-muted-foreground text-right">{content.length}/5000</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createPost.isPending} className="gap-2">
            {createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
