import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCommunityPosts } from '@/hooks/useCommunityPosts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Send, ImagePlus, Video, X } from 'lucide-react';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function CreatePostDialog({ open, onOpenChange }: CreatePostDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createPost } = useCommunityPosts();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      toast({ title: 'Invalid file', description: 'Please upload an image (JPEG, PNG, GIF, WebP) or video (MP4, WebM, MOV).', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: 'File too large', description: 'File must be under 20MB.', variant: 'destructive' });
      return;
    }

    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  };

  const clearMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadMedia = async (file: File): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('community-media').upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('community-media').getPublicUrl(path);
    return urlData.publicUrl;
  };

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
      setUploading(true);
      let imageUrl: string | null = null;
      if (mediaFile) {
        imageUrl = await uploadMedia(mediaFile);
      }
      await createPost.mutateAsync({ title: title.trim(), content: content.trim(), image_url: imageUrl });
      toast({ title: 'Post submitted!', description: 'Your post will be visible after admin approval.' });
      setTitle('');
      setContent('');
      clearMedia();
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const isVideo = mediaFile ? ALLOWED_VIDEO_TYPES.includes(mediaFile.type) : false;
  const isPending = createPost.isPending || uploading;

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
            <Textarea id="post-content" placeholder="Write your post..." value={content} onChange={(e) => setContent(e.target.value)} rows={4} maxLength={5000} />
            <p className="text-xs text-muted-foreground text-right">{content.length}/5000</p>
          </div>

          {/* Media upload */}
          <div className="space-y-2">
            <Label>Photo / Video (optional)</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={handleFileSelect}
            />
            {mediaPreview ? (
              <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
                {isVideo ? (
                  <video src={mediaPreview} controls className="w-full max-h-56 object-contain" />
                ) : (
                  <img src={mediaPreview} alt="Preview" className="w-full max-h-56 object-contain" />
                )}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 rounded-full"
                  onClick={clearMedia}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" type="button" className="gap-2 flex-1" onClick={() => fileInputRef.current?.click()}>
                  <ImagePlus className="h-4 w-4" /> Add Photo
                </Button>
                <Button variant="outline" type="button" className="gap-2 flex-1" onClick={() => fileInputRef.current?.click()}>
                  <Video className="h-4 w-4" /> Add Video
                </Button>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit for Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
