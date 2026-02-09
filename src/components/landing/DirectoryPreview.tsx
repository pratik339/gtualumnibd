import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Search, 
  GraduationCap, 
  MapPin, 
  Briefcase, 
  ArrowRight,
  Sparkles,
  Globe,
  BookOpen,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfiles } from '@/hooks/useProfiles';
import { useMemo } from 'react';

const features = [
  {
    icon: Search,
    title: 'Smart Search',
    description: 'Find alumni by name, skills, company, or location'
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Connect with members across 15+ countries'
  },
  {
    icon: Building2,
    title: 'Top Companies',
    description: 'Alumni working at Google, Microsoft, Amazon & more'
  },
  {
    icon: BookOpen,
    title: 'All Branches',
    description: 'Engineering, IT, Science, and Management'
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

export function DirectoryPreview() {
  const { user } = useAuth();
  const { profiles: allProfiles } = useProfiles({ status: 'approved' });

  // Pick up to 6 real profiles to display
  const displayProfiles = useMemo(() => {
    if (!allProfiles || allProfiles.length === 0) return [];
    // Mix alumni and students, take up to 6
    const alumni = allProfiles.filter(p => p.user_type === 'alumni');
    const students = allProfiles.filter(p => p.user_type === 'student' || p.user_type === 'scholar');
    const mixed: typeof allProfiles = [];
    const maxCount = Math.min(6, allProfiles.length);
    let ai = 0, si = 0;
    while (mixed.length < maxCount) {
      if (ai < alumni.length && (si >= students.length || mixed.length % 2 === 0)) {
        mixed.push(alumni[ai++]);
      } else if (si < students.length) {
        mixed.push(students[si++]);
      } else break;
    }
    return mixed;
  }, [allProfiles]);

  const totalCount = allProfiles?.length || 0;

  return (
    <section className="py-20 bg-gradient-to-b from-background via-card/30 to-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="directory-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#directory-grid)" className="text-primary" />
        </svg>
      </div>
      
      {/* Floating decorative elements */}
      <motion.div 
        className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-20 left-20 w-48 h-48 bg-accent/20 rounded-full blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 10, repeat: Infinity }}
      />
      
      <div className="container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
            whileHover={{ scale: 1.05 }}
          >
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Alumni & Student Directory</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4">
            <span className="hand-drawn-underline">Discover Our Community</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Connect with brilliant minds from Gujarat Technological University. 
            Our directory features alumni and students from various branches, now thriving across the globe.
          </p>
        </motion.div>
        
        {/* Feature highlights */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              variants={itemVariants}
              className="flex flex-col items-center text-center p-4"
            >
              <motion.div 
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <feature.icon className="w-6 h-6 text-primary" />
              </motion.div>
              <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Profile cards grid - real data */}
        <motion.div 
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {displayProfiles.map((profile, index) => {
            const isAlumni = profile.user_type === 'alumni';
            const location = [profile.location_city, profile.location_country].filter(Boolean).join(', ');
            const roleLabel = isAlumni
              ? [profile.job_title, profile.company].filter(Boolean).join(' at ') || 'Alumni'
              : profile.current_semester
                ? `Semester ${profile.current_semester}`
                : 'Student';

            return (
              <motion.div 
                key={profile.id} 
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full border-2 hover:border-primary/30 transition-all duration-300 overflow-hidden group">
                  {/* Top gradient bar */}
                  <div className={`h-2 ${isAlumni ? 'bg-gradient-to-r from-primary to-primary/60' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`} />
                  
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Avatar className="h-14 w-14 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                          <AvatarImage src={profile.photo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                            {getInitials(profile.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                          {profile.full_name}
                        </h3>
                        <Badge 
                          variant="outline" 
                          className={`mt-1 text-xs ${
                            isAlumni 
                              ? 'bg-primary/10 text-primary border-primary/30' 
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          }`}
                        >
                          {isAlumni ? (
                            <>
                              <GraduationCap className="w-3 h-3 mr-1" />
                              {profile.passout_year ? `Alumni '${String(profile.passout_year).slice(-2)}` : 'Alumni'}
                            </>
                          ) : (
                            <>
                              <BookOpen className="w-3 h-3 mr-1" />
                              {profile.current_semester ? `Sem ${profile.current_semester}` : 'Student'}
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="w-4 h-4 shrink-0" />
                        <span className="truncate">{roleLabel}</span>
                      </div>
                      {location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 shrink-0" />
                          <span className="truncate">{location}</span>
                        </div>
                      )}
                      {profile.branches?.name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <GraduationCap className="w-4 h-4 shrink-0" />
                          <span className="truncate">{profile.branches.name}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
        
        {/* Call to action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg">
            <div className="flex -space-x-3">
              {displayProfiles.slice(0, 4).map((profile, i) => (
                <motion.div 
                  key={profile.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <Avatar className="h-10 w-10 border-2 border-background">
                    <AvatarImage src={profile.photo_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(profile.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              ))}
              {totalCount > 4 && (
                <motion.div 
                  className="h-10 w-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                >
                  <span className="text-xs font-semibold text-primary">+{totalCount - 4}</span>
                </motion.div>
              )}
            </div>
            
            <div className="text-center sm:text-left">
              <p className="font-medium">Join our growing community</p>
              <p className="text-sm text-muted-foreground">{totalCount}+ members and counting</p>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button asChild size="lg" className="group">
                <Link to={user ? "/directory" : "/auth"}>
                  <Sparkles className="mr-2 h-4 w-4 group-hover:animate-pulse" />
                  {user ? 'Explore Directory' : 'Join Now'}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
