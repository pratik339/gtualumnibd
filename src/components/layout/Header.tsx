import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, Menu, LogOut, User, LayoutDashboard, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useProfile } from '@/hooks/useProfile';
import { motion } from 'framer-motion';

export const Header = () => {
  const {
    user,
    signOut,
    isAdmin
  } = useAuth();
  const {
    profile
  } = useProfile();
  const {
    theme,
    setTheme
  } = useTheme();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  
  const NavLinks = () => (
    <>
      <Link to="/directory" className="text-foreground/80 hover:text-foreground transition-all hover:scale-105 relative group">
        Directory
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
      </Link>
      <Link to="/analytics" className="text-foreground/80 hover:text-foreground transition-all hover:scale-105 relative group">
        Analytics
        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
      </Link>
      {isAdmin && (
        <Link to="/admin" className="text-foreground/80 hover:text-foreground transition-all hover:scale-105 relative group">
          Admin
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full rounded-full" />
        </Link>
      )}
    </>
  );
  
  return (
    <motion.header 
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div 
              className="h-10 w-10 rounded-xl overflow-hidden bg-card shadow-md ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all dark:bg-card/80 artistic-card"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <img 
                alt="GTU Logo" 
                className="h-full w-full object-contain p-0.5 dark:brightness-110 dark:contrast-110" 
                src="/lovable-uploads/bdc99bc9-4820-4911-9a3b-56eb0be2af25.png" 
              />
            </motion.div>
            <span className="font-semibold text-lg hidden sm:inline group-hover:text-primary transition-colors font-serif relative">
              Alumni Database
              <Sparkles className="absolute -top-1 -right-4 w-3 h-3 text-primary/60 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center gap-6">
              <NavLinks />
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="relative overflow-hidden"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </motion.div>

          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.photo_url || undefined} alt={profile?.full_name || 'User'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-serif">
                          {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover artistic-card" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {profile?.full_name && <p className="font-medium font-serif">{profile.full_name}</p>}
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <nav className="flex flex-col gap-4 mt-8">
                    <NavLinks />
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild className="artistic-card">
                <Link to="/auth">Sign In</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};