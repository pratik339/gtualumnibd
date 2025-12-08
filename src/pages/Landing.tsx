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
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${gtuCampus})` }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 backdrop-blur-sm rounded-full mb-6 border border-primary/20">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Gujarat Technological University</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 drop-shadow-sm">
              GTU Alumni{' '}
              <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text">Database</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect, collaborate, and grow with the GTU community. Track achievements, 
              explore opportunities, and stay connected with fellow students and alumni.
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="backdrop-blur-sm bg-background/50 hover:scale-105 transition-all">
                  <Link to="/directory">Browse Directory</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Link to="/auth">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="backdrop-blur-sm bg-background/50 hover:scale-105 transition-all">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      {!user && (
        <section className="py-16 bg-gradient-to-b from-card to-background">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Join as</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
              Select your role to get started with the GTU Alumni Database
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-1 duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Alumni</CardTitle>
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

              <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-1 duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Current Student</CardTitle>
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

              <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-xl hover:-translate-y-1 duration-300 border-dashed">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Admin</CardTitle>
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
        <div className="container relative">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Platform Features</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-lg mx-auto">
            Everything you need to stay connected with the GTU community
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all hover:-translate-y-1 duration-300 group">
                <CardHeader>
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
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
      <footer className="border-t py-8 bg-card/50 backdrop-blur-sm">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">GTU</span>
              </div>
              <span className="font-medium">GTU Alumni Database</span>
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
