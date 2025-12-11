import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, BookOpen, Shield, BarChart3, Globe, Sparkles, Star, Heart, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/ui/page-transition';
import gtuCampus from '@/assets/gtu-campus.jpg';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Hand-drawn SVG decorations
const ScribbleCircle = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M50 5C75 5 95 25 95 50C95 75 75 95 50 95C25 95 5 75 5 50C5 25 25 5 50 5" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
      strokeDasharray="8 4"
      className="animate-draw"
    />
  </svg>
);

const WavyLine = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M0 10C20 0 40 20 60 10C80 0 100 20 120 10C140 0 160 20 180 10C190 5 200 10 200 10" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
      className="animate-draw"
    />
  </svg>
);

const StarBurst = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M25 5L28 20H45L32 30L38 45L25 35L12 45L18 30L5 20H22L25 5Z" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.1"
    />
  </svg>
);

const DoodleArrow = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M5 15C15 12 25 18 35 14C45 10 50 16 55 15M55 15L48 8M55 15L48 22" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface Stats {
  alumniCount: number;
  studentCount: number;
  countriesCount: number;
  totalCount: number;
}

export default function Landing() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ alumniCount: 0, studentCount: 0, countriesCount: 0, totalCount: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch approved profiles for stats
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('user_type, location_country')
          .eq('status', 'approved');

        if (error) throw error;

        if (profiles) {
          const alumniCount = profiles.filter(p => p.user_type === 'alumni').length;
          const studentCount = profiles.filter(p => p.user_type === 'scholar' || p.user_type === 'student').length;
          const countries = new Set(profiles.map(p => p.location_country).filter(Boolean));
          
          setStats({
            alumniCount,
            studentCount,
            countriesCount: countries.size,
            totalCount: profiles.length,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: Users,
      title: 'Connect with Alumni',
      description: 'Network with GTU graduates worldwide and expand your professional connections.',
      decoration: '✦',
    },
    {
      icon: BookOpen,
      title: 'Student Directory',
      description: 'Access profiles of current students and learn about their achievements.',
      decoration: '◈',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Visualize data about alumni distribution, branches, and scholarship trends.',
      decoration: '◇',
    },
    {
      icon: Globe,
      title: 'Global Network',
      description: 'Discover alumni across different countries and High Commissions.',
      decoration: '★',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    },
  };

  return (
    <Layout>
      <PageTransition>
      {/* Hero Section with Campus Background */}
      <section className="relative py-24 md:py-40 overflow-hidden">
        {/* Background Image - visible in both themes */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${gtuCampus})` }}
        />
        {/* Theme-adaptive overlay for visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/70 to-background dark:from-background/90 dark:via-background/80 dark:to-background" />
        
        {/* Artistic decorative elements - animated blobs */}
        <motion.div 
          className="absolute top-20 left-10 w-72 h-72 bg-primary/30 dark:bg-primary/20 blob-shape blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute bottom-10 right-10 w-96 h-96 bg-accent-foreground/20 dark:bg-accent/30 blob-shape blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute top-40 right-1/4 w-48 h-48 bg-primary/20 rounded-full blur-2xl"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Hand-drawn decorative elements */}
        <ScribbleCircle className="absolute top-16 left-1/4 w-20 h-20 text-primary/30 dark:text-primary/20" />
        <WavyLine className="absolute bottom-32 right-1/4 w-40 text-primary/25 dark:text-primary/15 -rotate-12" />
        <StarBurst className="absolute top-1/3 right-16 w-12 h-12 text-primary/40 animate-float" />
        <StarBurst className="absolute bottom-1/4 left-20 w-8 h-8 text-primary/30 animate-float" style={{ animationDelay: '-2s' }} />
        
        {/* Floating stars */}
        <motion.div
          className="absolute top-24 right-1/3"
          animate={{ y: [-5, 5, -5], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star className="w-6 h-6 text-primary/40 fill-primary/20" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-1/3"
          animate={{ y: [5, -5, 5], rotate: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star className="w-4 h-4 text-primary/30 fill-primary/10" />
        </motion.div>
        
        <div className="container relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="inline-flex items-center justify-center p-3 bg-primary/10 dark:bg-primary/20 backdrop-blur-sm rounded-full mb-6 border-2 border-dashed border-primary/30 dark:border-primary/40"
              variants={itemVariants}
              whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
              transition={{ rotate: { duration: 0.5 } }}
            >
              <Sparkles className="h-5 w-5 text-primary mr-2 animate-pulse" />
              <span className="text-sm font-medium text-primary font-serif italic">Gujarat Technological University</span>
              <Sparkles className="h-5 w-5 text-primary ml-2 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </motion.div>
            
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 drop-shadow-sm font-serif relative"
              variants={itemVariants}
            >
              <span className="relative inline-block">
                GTU Alumni
                <motion.span
                  className="absolute -top-2 -right-4 text-primary"
                  animate={{ rotate: [0, 15, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✦
                </motion.span>
              </span>
              {' '}
              <span className="text-primary relative">
                <span className="sketch-highlight">Database</span>
                <WavyLine className="absolute -bottom-2 left-0 w-full text-primary/50" />
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-muted-foreground dark:text-foreground/80 mb-10 max-w-2xl mx-auto leading-relaxed"
              variants={itemVariants}
            >
              Connect, collaborate, and grow with the GTU community. Track achievements, 
              explore opportunities, and stay connected with fellow students and alumni.
            </motion.p>
            
            <motion.div variants={itemVariants}>
              {user ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: [-0.5, 0.5, 0] }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all artistic-card text-lg px-8">
                      <Link to="/dashboard">
                        <Zap className="mr-2 h-5 w-5" />
                        Go to Dashboard
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: [0.5, -0.5, 0] }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button asChild variant="outline" size="lg" className="backdrop-blur-sm bg-background/50 dark:bg-background/30 transition-all border-2 border-dashed text-lg px-8">
                      <Link to="/directory">
                        <Users className="mr-2 h-5 w-5" />
                        Browse Directory
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.div 
                    whileHover={{ scale: 1.08, rotate: [-1, 1, 0] }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all artistic-card text-lg px-8 relative overflow-hidden group">
                      <Link to="/auth">
                        <span className="relative z-10 flex items-center">
                          <Heart className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                          Get Started
                        </span>
                      </Link>
                    </Button>
                  </motion.div>
                  
                  <DoodleArrow className="w-12 text-primary/40 hidden sm:block rotate-90 sm:rotate-0" />
                  
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: [0.5, -0.5, 0] }} 
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button asChild variant="outline" size="lg" className="backdrop-blur-sm bg-background/50 dark:bg-background/30 transition-all border-2 text-lg px-8">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <motion.div 
              className="w-1.5 h-3 bg-primary/50 rounded-full mt-2"
              animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Role Selection Section */}
      {!user && (
        <section className="py-20 bg-gradient-to-b from-card to-background relative overflow-hidden">
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
          
          {/* Floating decorations */}
          <StarBurst className="absolute top-10 right-20 w-16 h-16 text-primary/20 animate-float" />
          <ScribbleCircle className="absolute bottom-20 left-16 w-24 h-24 text-primary/15 animate-float" style={{ animationDelay: '-3s' }} />
          
          <div className="container relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-serif">
                <span className="hand-drawn-underline">Join as</span>
              </h2>
              <p className="text-muted-foreground text-center mb-14 max-w-lg mx-auto text-lg">
                Select your role to get started with the GTU Alumni Database
              </p>
            </motion.div>
            
            <motion.div 
              className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={itemVariants}>
                <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-2xl hover:-translate-y-3 duration-300 artistic-card h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">✦</div>
                  <CardHeader className="text-center pt-8">
                    <motion.div 
                      className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 shadow-inner blob-shape"
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <GraduationCap className="h-10 w-10 text-primary" />
                    </motion.div>
                    <CardTitle className="font-serif text-xl">Alumni</CardTitle>
                    <CardDescription className="text-base">
                      GTU graduates who have completed their studies
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <Button asChild className="w-full group-hover:shadow-md transition-all">
                      <Link to="/auth">Register as Alumni</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-2xl hover:-translate-y-3 duration-300 artistic-card h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">◈</div>
                  <CardHeader className="text-center pt-8">
                    <motion.div 
                      className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 shadow-inner blob-shape"
                      whileHover={{ scale: 1.15, rotate: -10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <BookOpen className="h-10 w-10 text-primary" />
                    </motion.div>
                    <CardTitle className="font-serif text-xl">Current Student</CardTitle>
                    <CardDescription className="text-base">
                      Students currently pursuing studies at GTU
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <Button asChild className="w-full group-hover:shadow-md transition-all">
                      <Link to="/auth">Register as Student</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="hover:border-primary transition-all cursor-pointer group hover:shadow-2xl hover:-translate-y-3 duration-300 border-dashed artistic-card h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-2xl opacity-20 group-hover:opacity-40 transition-opacity">★</div>
                  <CardHeader className="text-center pt-8">
                    <motion.div 
                      className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 shadow-inner blob-shape"
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Shield className="h-10 w-10 text-primary" />
                    </motion.div>
                    <CardTitle className="font-serif text-xl">Admin</CardTitle>
                    <CardDescription className="text-base">
                      Administrative access for managing the platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <Button asChild variant="outline" className="w-full group-hover:shadow-md transition-all">
                      <Link to="/admin-login">Admin Login</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        
        {/* Decorative elements */}
        <motion.div 
          className="absolute -top-20 -right-20 w-64 h-64 border-2 border-dashed border-primary/10 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute -bottom-32 -left-32 w-96 h-96 border-2 border-dashed border-primary/5 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
        />
        <WavyLine className="absolute top-20 left-10 w-32 text-primary/20 rotate-45" />
        <StarBurst className="absolute bottom-20 right-10 w-14 h-14 text-primary/25 animate-float" />
        
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 font-serif">
              <span className="hand-drawn-underline">Platform Features</span>
            </h2>
            <p className="text-muted-foreground text-center mb-14 max-w-lg mx-auto text-lg">
              Everything you need to stay connected with the GTU community
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center hover:shadow-2xl transition-all hover:-translate-y-3 duration-300 group artistic-card h-full relative overflow-hidden">
                  <div className="absolute top-4 right-4 text-xl opacity-20 group-hover:opacity-40 transition-opacity">
                    {feature.decoration}
                  </div>
                  <CardHeader>
                    <motion.div 
                      className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 blob-shape shadow-inner"
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <feature.icon className="h-8 w-8 text-primary" />
                    </motion.div>
                    <CardTitle className="text-lg font-serif">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1.5" fill="currentColor" className="text-primary"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots-pattern)"/>
          </svg>
        </div>
        
        <div className="container relative">
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { label: 'Alumni Network', value: stats.alumniCount || 0, icon: '🎓' },
              { label: 'Countries', value: stats.countriesCount || 0, icon: '🌍' },
              { label: 'Students', value: stats.studentCount || 0, icon: '📚' },
              { label: 'Total Members', value: stats.totalCount || 0, icon: '🤝' },
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                variants={itemVariants}
              >
                <motion.div
                  className="text-4xl mb-2"
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                >
                  {stat.icon}
                </motion.div>
                <div className="text-3xl md:text-4xl font-bold text-primary font-serif">{stat.value}</div>
                <div className="text-muted-foreground text-sm mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 bg-card/50 backdrop-blur-sm relative overflow-hidden">
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
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center artistic-card">
                <span className="text-primary-foreground font-bold text-sm">GTU</span>
              </div>
              <span className="font-medium font-serif text-lg">GTU Alumni Database</span>
            </motion.div>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Made with <Heart className="h-4 w-4 text-primary fill-primary animate-pulse" /> 
              <span>© {new Date().getFullYear()} Gujarat Technological University</span>
            </p>
          </div>
        </div>
      </footer>
      </PageTransition>
    </Layout>
  );
}