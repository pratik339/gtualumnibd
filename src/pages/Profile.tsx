import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Loader2 } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile?.id) {
      navigate(`/profile/${profile.id}`, { replace: true });
    }
  }, [loading, profile, navigate]);

  if (loading) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <p className="text-muted-foreground">No profile found. Please complete your registration.</p>
            <button 
              onClick={() => navigate('/register')}
              className="text-primary hover:underline"
            >
              Complete Registration
            </button>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return null;
};

export default Profile;
