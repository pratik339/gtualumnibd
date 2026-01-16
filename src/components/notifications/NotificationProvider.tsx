import { useNotifications } from '@/hooks/useNotifications';

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  useNotifications();
  return <>{children}</>;
};
