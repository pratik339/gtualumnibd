import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, Menu, LogOut, User, LayoutDashboard, Home } from 'lucide-react';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useProfile } from '@/hooks/useProfile';
import { motion } from 'framer-motion';
import gtuLogo from '@/assets/gtu-logo-optimized.webp';
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
  const NavLinks = ({
    mobile = false
  }: {
    mobile?: boolean;
  }) => <>
      <Link to="/" className={`flex items-center gap-1 transition-all font-medium ${mobile ? 'text-foreground hover:text-primary py-2' : 'text-white/90 hover:text-white hover:bg-white/15 px-3 py-1.5 rounded'}`}>
        <Home className="h-4 w-4" />
        Home
      </Link>
      <Link to="/directory" className={`transition-all font-medium ${mobile ? 'text-foreground hover:text-primary py-2' : 'text-white/90 hover:text-white hover:bg-white/15 px-3 py-1.5 rounded'}`}>
        Directory
      </Link>
      <Link to="/analytics" className={`transition-all font-medium ${mobile ? 'text-foreground hover:text-primary py-2' : 'text-white/90 hover:text-white hover:bg-white/15 px-3 py-1.5 rounded'}`}>
        Analytics
      </Link>
      {isAdmin && <Link to="/admin" className={`transition-all font-medium ${mobile ? 'text-foreground hover:text-primary py-2' : 'text-white/90 hover:text-white hover:bg-white/15 px-3 py-1.5 rounded'}`}>
          Admin
        </Link>}
    </>;
  return <header className="sticky top-0 z-50 w-full shadow-md">
      {/* Top bar - GTU Navy Blue */}
      <div className="bg-[hsl(220,50%,15%)] text-white">
        <div className="container flex h-10 items-center justify-end text-sm">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{
            scale: 1.1
          }} whileTap={{
            scale: 0.9
          }}>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="h-8 w-8 text-white hover:bg-white/10">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </motion.div>
            {!user && <Button asChild size="sm" variant="ghost" className="text-white hover:bg-white/10 h-7 font-medium">
                <Link to="/auth">Sign In</Link>
              </Button>}
          </div>
        </div>
      </div>

      {/* Main header with logo and university name */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="container flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <motion.div className="h-14 w-14 rounded-lg overflow-hidden bg-white shadow-md ring-2 ring-primary/30 group-hover:ring-primary/50 transition-all" whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <img alt="GTU Logo" className="h-full w-full object-contain p-0.5" src={gtuLogo} width="56" height="56" loading="eager" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl text-[hsl(220,50%,15%)] dark:text-foreground uppercase tracking-wide">
                Gujarat Technological University
              </span>
              <span className="text-xs sm:text-sm text-primary font-semibold">Alumni Database for Bangladeshi students</span>
            </div>
          </Link>

          {user && <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{
                scale: 1.05
              }} whileTap={{
                scale: 0.95
              }}>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.photo_url || undefined} alt={profile?.full_name || 'User'} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {profile?.full_name && <p className="font-medium">{profile.full_name}</p>}
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
                  {isAdmin && <DropdownMenuItem asChild>
                      <Link to="/admin" className="flex items-center cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>}
        </div>
      </div>

      {/* Navigation bar - GTU Red */}
      {user && <motion.nav className="bg-[hsl(350,70%,45%)] text-white shadow-lg" initial={{
      y: -20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} transition={{
      duration: 0.3
    }}>
          <div className="container">
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center gap-1 h-12">
              <NavLinks />
            </div>

            {/* Mobile navigation */}
            <div className="md:hidden flex items-center justify-between h-12">
              <span className="text-sm font-medium">Menu</span>
              <Sheet>
                <SheetTrigger asChild>
                  <motion.div whileHover={{
                scale: 1.1
              }} whileTap={{
                scale: 0.9
              }}>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </motion.div>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <nav className="flex flex-col gap-2 mt-8">
                    <NavLinks mobile />
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </motion.nav>}
    </header>;
};