
-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Users can view approved posts
CREATE POLICY "Anyone authenticated can view approved posts"
  ON public.community_posts FOR SELECT
  USING (
    (status = 'approved' AND auth.uid() IS NOT NULL)
    OR user_id = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Users can create posts
CREATE POLICY "Users can create posts"
  ON public.community_posts FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can update their own pending posts
CREATE POLICY "Users can update own pending posts"
  ON public.community_posts FOR UPDATE
  USING (
    (user_id = auth.uid() AND status = 'pending')
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Users can delete their own posts, admins can delete any
CREATE POLICY "Users can delete own posts or admin any"
  ON public.community_posts FOR DELETE
  USING (
    user_id = auth.uid()
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Trigger for updated_at
CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
