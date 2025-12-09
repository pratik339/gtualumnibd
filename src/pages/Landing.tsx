import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BookOpen, Shield, BarChart3, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import gtuCampus from '@/assets/gtu-campus.jpg';

export default function Landing() {
  const { user } = useAuth();

  const features = [
    {
      icon: Users,
      title: 'Connect with Alumni',
      description: 'Network with GTU graduates worldwide and expand your professional connections.',
    },
    {
      icon: BookOpen,
      title: 'Student Directory',
      description: 'Access profiles of current students and learn about their achievements.',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Visualize data about alumni distribution, branches, and scholarship trends.',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Discover alumni across different countries and High Commissions.',
    },
  ];

  return (
    <Layout>
      {/* Hero Section with Campus Background */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background Image - visible in both themes */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${gtuCampus})` }}
        />
        {/* Theme-adaptive overlay for visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background dark:from-background/80 dark:via-background/70 dark:to-background" />
        
        {/* Artistic decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 dark:bg-primary/20 blob-shape animate-blob blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-foreground/20 dark:bg-accent/30 blob-shape animate-blob blur-3xl" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-40 right-1/4 w-48 h-48 bg-primary/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '-2s' }} />
        
        {/* Artistic hand-drawn decorative lines */}
        <svg className="absolute top-10 left-1/4 w-32 h-32 text-primary/30 dark:text-primary/20" viewBox="0 0 100 100">
          <path d="M10,50 Q30,20 50,50 T90,50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-draw" style={{ strokeDasharray: 1000 }} />
        </svg>
        <svg className="absolute bottom-20 right-1/3 w-24 h-24 text-primary/20 dark:text-primary/15 rotate-45" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" />
        </svg>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 backdrop-blur-sm rounded-full mb-6 border border-primary/20 dark:border-primary/30 artistic-border">
              <Sparkles className="h-5 w-5 text-primary mr-2 animate-float" />
              <span className="text-sm font-medium text-primary font-serif italic">Gujarat Technological University</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 drop-shadow-sm font-serif">
              GTU Alumni{' '}
              <span className="text-primary sketch-highlight">Database</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground dark:text-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect, collaborate, and grow with the GTU community. Track achievements, 
              explore opportunities, and stay connected with fellow students and alumni.
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all hover:scale-105 artistic-card">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="backdrop-blur-sm bg-background/50 dark:bg-background/30 hover:scale-105 transition-all border-2">
                  <Link to="/directory">Browse Directory</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all hover:scale-105 artistic-card">
                  <Link to="/auth">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="backdrop-blur-sm bg-background/50 dark:bg-background/30 hover:scale-105 transition-all border-2">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      {!user && (
        <section className="py-16 bg-gradient-to-b from-card to-background relative overflow-hidden">
          {/* Artistic background pattern */}
          <div className="absolute inset-0 opacity-5 dark:opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" className="text-primary"/>
            </svg>
          </div>
          
          <div className="container relative">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 font-serif">
              <span className="hand-drawn-underline">Join as</span>
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
              Select your role to get started with the GTU Alumni Database
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-2 duration-300 artistic-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner blob-shape">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-serif">Alumni</CardTitle>
                  <CardDescription>
                    GTU graduates who have completed their studies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full group-hover:shadow-md transition-all">
                    <Link to="/auth">Register as Alumni</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-2 duration-300 artistic-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner blob-shape">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-serif">Current Student</CardTitle>
                  <CardDescription>
                    Students currently pursuing studies at GTU
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full group-hover:shadow-md transition-all">
                    <Link to="/auth">Register as Student</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-2 duration-300 border-dashed artistic-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner blob-shape">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="font-serif">Admin</CardTitle>
                  <CardDescription>
                    Administrative access for managing the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full group-hover:shadow-md transition-all">
                    <Link to="/admin-login">Admin Login</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 border-2 border-primary/10 rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 border-2 border-primary/5 rounded-full" />
        
        <div className="container relative">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 font-serif">
            <span className="hand-drawn-underline">Platform Features</span>
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Everything you need to stay connected with the GTU community
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all hover:-translate-y-2 duration-300 group artistic-card animate-fade-in" style={{ animationDelay: `${0.1 * (index + 1)}s` }}>
                <CardHeader>
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 blob-shape animate-blob" style={{ animationDelay: `${index * 2}s` }}>
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-serif">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card/50 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill="currentColor" className="text-primary"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)"/>
          </svg>
        </div>
        <div className="container relative">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center artistic-card">
                <span className="text-primary-foreground font-bold text-xs">GTU</span>
              </div>
              <span className="font-medium font-serif">GTU Alumni Database</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Gujarat Technological University. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </Layout>
  );
}
