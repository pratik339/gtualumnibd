import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { Users, GraduationCap, BookOpen, Globe, TrendingUp, Sparkles, Award, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

// Animated number counter
const AnimatedCounter = ({ value }: { value: number }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {value}
    </motion.span>
  );
};

export default function Analytics() {
  const { profiles: allProfiles } = useProfiles({ status: 'approved' });
  const [adminUserIds, setAdminUserIds] = useState<string[]>([]);

  // Fetch admin user IDs to exclude from analytics
  useEffect(() => {
    const fetchAdminIds = async () => {
      const { data } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      if (data) {
        setAdminUserIds(data.map(r => r.user_id));
      }
    };
    fetchAdminIds();
  }, []);

  // Filter out admin users from profiles
  const profiles = allProfiles.filter(p => !adminUserIds.includes(p.user_id));

  const alumniCount = profiles.filter(p => p.user_type === 'alumni').length;
  const studentCount = profiles.filter(p => (p.user_type as string) === 'student' || p.user_type === 'scholar').length;

  const typeData = [
    { name: 'Alumni', value: alumniCount },
    { name: 'Students', value: studentCount },
  ].filter(d => d.value > 0);

  // Branch distribution
  const branchData = profiles.reduce((acc, profile) => {
    const branch = profile.branches?.name || 'Unknown';
    acc[branch] = (acc[branch] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const branchChartData = Object.entries(branchData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Year distribution
  const yearData = profiles
    .filter(p => p.passout_year || p.expected_passout_year)
    .reduce((acc, profile) => {
      const year = (profile.passout_year || profile.expected_passout_year)?.toString() || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const yearChartData = Object.entries(yearData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));

  // Scholarship year trends
  const scholarshipData = profiles
    .filter(p => p.scholarship_year)
    .reduce((acc, profile) => {
      const year = profile.scholarship_year?.toString() || 'Unknown';
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const scholarshipChartData = Object.entries(scholarshipData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => parseInt(a.name) - parseInt(b.name));

  // High Commission distribution
  const commissionData = profiles
    .filter(p => p.high_commissions?.name)
    .reduce((acc, profile) => {
      const commission = profile.high_commissions?.name || 'Unknown';
      acc[commission] = (acc[commission] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const commissionChartData = Object.entries(commissionData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // College distribution
  const collegeData = profiles
    .filter(p => p.colleges?.name)
    .reduce((acc, profile) => {
      const college = profile.colleges?.name || 'Unknown';
      acc[college] = (acc[college] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const collegeChartData = Object.entries(collegeData)
    .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 20) + '...' : name, fullName: name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Location distribution
  const locationData = profiles
    .filter(p => p.location_country)
    .reduce((acc, profile) => {
      const location = profile.location_country || 'Unknown';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const locationChartData = Object.entries(locationData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const COLORS = [
    'hsl(var(--chart-1))', 
    'hsl(var(--chart-2))', 
    'hsl(var(--chart-3))', 
    'hsl(var(--chart-4))', 
    'hsl(var(--chart-5))'
  ];

  const GRADIENT_COLORS = [
    { start: 'hsl(var(--chart-1))', end: 'hsl(var(--chart-1) / 0.3)' },
    { start: 'hsl(var(--chart-2))', end: 'hsl(var(--chart-2) / 0.3)' },
    { start: 'hsl(var(--chart-3))', end: 'hsl(var(--chart-3) / 0.3)' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }
    }
  };

  const statsCards = [
    { label: 'Total Members', value: profiles.length, icon: Users, color: 'from-primary/20 to-primary/5', description: 'Approved profiles' },
    { label: 'Alumni', value: alumniCount, icon: GraduationCap, color: 'from-chart-1/20 to-chart-1/5', description: 'Graduated members' },
    { label: 'Current Students', value: studentCount, icon: BookOpen, color: 'from-chart-2/20 to-chart-2/5', description: 'Active students' },
    { label: 'Countries', value: Object.keys(locationData).length, icon: Globe, color: 'from-chart-3/20 to-chart-3/5', description: 'Global presence' },
    { label: 'Colleges', value: Object.keys(collegeData).length, icon: Building2, color: 'from-chart-4/20 to-chart-4/5', description: 'Partner institutions' },
    { label: 'Scholarships', value: profiles.filter(p => p.scholarship_year).length, icon: Award, color: 'from-chart-5/20 to-chart-5/5', description: 'Scholars awarded' },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8">
          {/* Header with animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              Community insights and statistics • Updates in real-time
            </p>
          </motion.div>

          {/* Stats Cards Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
          >
            {statsCards.map((stat, index) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <Card className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50 group-hover:opacity-70 transition-opacity`} />
                  <CardContent className="pt-4 pb-3 relative">
                    <div className="flex items-center justify-between mb-2">
                      <stat.icon className="h-5 w-5 text-primary" />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                        className="text-2xl font-bold"
                      >
                        <AnimatedCounter value={stat.value} />
                      </motion.div>
                    </div>
                    <p className="text-xs font-medium">{stat.label}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Member Distribution - Donut Chart */}
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Member Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {typeData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            {COLORS.map((color, index) => (
                              <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={1} />
                                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie
                            data={typeData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={8}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                          >
                            {typeData.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`url(#pieGradient-${index})`}
                                stroke="hsl(var(--background))"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              background: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* High Commission Distribution - Donut */}
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-chart-2/10 to-transparent rounded-bl-full" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    By High Commission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {commissionChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={commissionChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, value }) => `${name.slice(0, 10)}${name.length > 10 ? '...' : ''}: ${value}`}
                          >
                            {commissionChartData.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                stroke="hsl(var(--background))"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              background: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No commission data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Year-wise Distribution - Area Chart */}
            <motion.div variants={cardVariants} className="md:col-span-2">
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-chart-1/5 to-transparent rounded-bl-full" />
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Year-wise Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    {yearChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={yearChartData}>
                          <defs>
                            <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={3}
                            fill="url(#yearGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Branch Distribution */}
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    By Branch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {branchChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={branchChartData} layout="vertical">
                          <defs>
                            <linearGradient id="branchGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="url(#branchGradient)" 
                            radius={[0, 6, 6, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Scholarship Trends - Line Chart */}
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    Scholarship Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {scholarshipChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={scholarshipChartData}>
                          <defs>
                            <linearGradient id="scholarshipLine" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="hsl(var(--chart-3))" />
                              <stop offset="100%" stopColor="hsl(var(--chart-4))" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="url(#scholarshipLine)" 
                            strokeWidth={3}
                            dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2, r: 5 }}
                            activeDot={{ r: 8, fill: 'hsl(var(--chart-4))' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No scholarship data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* College Distribution */}
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    By College
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {collegeChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={collegeChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                          <XAxis type="number" tick={{ fontSize: 11 }} />
                          <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 9 }} />
                          <Tooltip 
                            formatter={(value, name, props) => [value, props.payload.fullName || name]}
                            contentStyle={{ 
                              background: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                            {collegeChartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No college data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Location Distribution */}
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    By Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    {locationChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={locationChartData}>
                          <defs>
                            <linearGradient id="locationGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={0.9}/>
                              <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0.4}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="url(#locationGradient)" 
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No location data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
