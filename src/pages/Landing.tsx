import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BookOpen, Shield, BarChart3, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';

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
      title: 'Scholar Directory',
      description: 'Access profiles of current scholars and learn about their achievements.',
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
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5" />
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
              <GraduationCap className="h-6 w-6 text-primary mr-2" />
              <span className="text-sm font-medium text-primary">Gujarat Technological University</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Alumni & Scholar{' '}
              <span className="text-primary">Database</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Connect, collaborate, and grow with the GTU community. Track achievements, 
              explore opportunities, and stay connected with fellow scholars and alumni.
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/directory">Browse Directory</Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/auth">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      {!user && (
        <section className="py-16 bg-card">
          <div className="container">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Join as</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Alumni</CardTitle>
                  <CardDescription>
                    GTU graduates who have completed their studies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/auth">Register as Alumni</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Current Scholar</CardTitle>
                  <CardDescription>
                    Students currently pursuing studies at GTU
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to="/auth">Register as Scholar</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:border-primary transition-colors cursor-pointer group">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>Admin</CardTitle>
                  <CardDescription>
                    Administrative access for managing the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/auth">Admin Login</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 mx-auto rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
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
      <footer className="border-t py-8 bg-card">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">GTU</span>
              </div>
              <span className="font-medium">Alumni & Scholar Database</span>
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
