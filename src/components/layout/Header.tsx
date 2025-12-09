import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Moon, Sun, Menu, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useTheme } from 'next-themes';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useProfile } from '@/hooks/useProfile';
import gtuLogo from '@/assets/gtu-logo.png';
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
  const NavLinks = () => <>
      <Link to="/directory" className="text-foreground/80 hover:text-foreground transition-colors hover:scale-105">
        Directory
      </Link>
      <Link to="/analytics" className="text-foreground/80 hover:text-foreground transition-colors hover:scale-105">
        Analytics
      </Link>
      {isAdmin && <Link to="/admin" className="text-foreground/80 hover:text-foreground transition-colors hover:scale-105">
          Admin
        </Link>}
    </>;
  return <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-card shadow-md ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all group-hover:scale-105 dark:bg-card/80">
              <img alt="GTU Logo" className="h-full w-full object-contain p-0.5 dark:brightness-110 dark:contrast-110" src="https://www.pngegg.com/en/search?q=gtu" />
            </div>
            <span className="font-semibold text-lg hidden sm:inline group-hover:text-primary transition-colors font-serif">Alumni Database</span>
          </Link>

          {user && <nav className="hidden md:flex items-center gap-6">
              <NavLinks />
            </nav>}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="hover:scale-110 transition-transform">
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile?.photo_url || undefined} alt={profile?.full_name || 'User'} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {profile?.full_name ? getInitials(profile.full_name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
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
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <nav className="flex flex-col gap-4 mt-8">
                    <NavLinks />
                  </nav>
                </SheetContent>
              </Sheet>
            </> : <Button asChild className="hover:scale-105 transition-transform">
              <Link to="/auth">Sign In</Link>
            </Button>}
        </div>
      </div>
    </header>;
};