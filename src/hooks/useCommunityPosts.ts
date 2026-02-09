import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  image_url: string | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    photo_url: string | null;
    user_type: string;
    company: string | null;
    job_title: string | null;
  } | null;
}

interface CreatePostInput {
  title: string;
  content: string;
  image_url?: string | null;
}

export function useCommunityPosts(filter?: 'approved' | 'pending' | 'all' | 'mine') {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const postsQuery = useQuery({
    queryKey: ['community-posts', filter, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('community_posts')
        .select(`*`)
        .order('created_at', { ascending: false });

      if (filter === 'approved') {
        query = query.eq('status', 'approved');
      } else if (filter === 'pending') {
        query = query.eq('status', 'pending');
      } else if (filter === 'mine' && user?.id) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch profiles for all unique user_ids
      const posts = data || [];
      const userIds = [...new Set(posts.map(p => p.user_id))];
      
      let profilesMap: Record<string, CommunityPost['profiles']> = {};
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name, photo_url, user_type, company, job_title')
          .in('user_id', userIds);
        
        if (profilesData) {
          profilesData.forEach(p => {
            profilesMap[p.user_id] = p;
          });
        }
      }

      return posts.map(post => ({
        ...post,
        profiles: profilesMap[post.user_id] || null,
      })) as CommunityPost[];
    },
    enabled: !!user,
  });

  const createPost = useMutation({
    mutationFn: async (input: CreatePostInput) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        title: input.title,
        content: input.content,
        image_url: input.image_url || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });

  const updatePostStatus = useMutation({
    mutationFn: async ({ postId, status, rejection_reason }: { postId: string; status: string; rejection_reason?: string }) => {
      const update: Record<string, unknown> = { status };
      if (rejection_reason !== undefined) update.rejection_reason = rejection_reason;
      const { error } = await supabase.from('community_posts').update(update).eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });

  const deletePost = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from('community_posts').delete().eq('id', postId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-posts'] });
    },
  });

  return {
    posts: postsQuery.data || [],
    isLoading: postsQuery.isLoading,
    error: postsQuery.error,
    createPost,
    updatePostStatus,
    deletePost,
    refetch: postsQuery.refetch,
  };
}
