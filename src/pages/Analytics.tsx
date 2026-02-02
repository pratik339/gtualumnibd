import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProfiles, ProfileWithRelations } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { Users, GraduationCap, BookOpen, Globe, TrendingUp, Sparkles, Award, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsDetailModal } from '@/components/analytics/AnalyticsDetailModal';

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

type DrilldownType = 
  | { type: 'alumni' }
  | { type: 'students' }
  | { type: 'scholars' }
  | { type: 'branch'; value: string }
  | { type: 'year'; value: string }
  | { type: 'commission'; value: string }
  | { type: 'college'; value: string }
  | { type: 'location'; value: string }
  | { type: 'total' }
  | null;

export default function Analytics() {
  const { profiles: allProfiles } = useProfiles({ status: 'approved' });
  const [adminUserIds, setAdminUserIds] = useState<string[]>([]);
  const [adminIdsLoaded, setAdminIdsLoaded] = useState(false);
  const [drilldown, setDrilldown] = useState<DrilldownType>(null);

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
      setAdminIdsLoaded(true);
    };
    fetchAdminIds();
  }, []);

  // Filter out admin users from profiles (only after admin IDs are loaded)
  const profiles = adminIdsLoaded 
    ? allProfiles.filter(p => !adminUserIds.includes(p.user_id))
    : [];

  // Alumni count excludes admins (admins are already filtered out of profiles)
  const alumniCount = profiles.filter(p => p.user_type === 'alumni').length;
  const studentCount = profiles.filter(p => (p.user_type as string) === 'student' || p.user_type === 'scholar').length;

  const typeData = [
    { name: 'Alumni', value: alumniCount, type: 'alumni' as const },
    { name: 'Students', value: studentCount, type: 'students' as const },
  ].filter(d => d.value > 0);

  // Get filtered profiles based on drilldown selection
  const getFilteredProfiles = (): ProfileWithRelations[] => {
    if (!drilldown) return [];
    
    switch (drilldown.type) {
      case 'total':
        return profiles;
      case 'alumni':
        return profiles.filter(p => p.user_type === 'alumni');
      case 'students':
        return profiles.filter(p => p.user_type === 'student' || p.user_type === 'scholar');
      case 'scholars':
        return profiles.filter(p => p.scholarship_year);
      case 'branch':
        return profiles.filter(p => p.branches?.name === drilldown.value);
      case 'year':
        return profiles.filter(p => 
          (p.passout_year?.toString() === drilldown.value) || 
          (p.expected_passout_year?.toString() === drilldown.value)
        );
      case 'commission':
        return profiles.filter(p => p.high_commissions?.name === drilldown.value);
      case 'college':
        return profiles.filter(p => p.colleges?.name === drilldown.value);
      case 'location':
        return profiles.filter(p => p.colleges?.city === drilldown.value);
      default:
        return [];
    }
  };

  const getDrilldownTitle = (): string => {
    if (!drilldown) return '';
    
    switch (drilldown.type) {
      case 'total':
        return 'All Members';
      case 'alumni':
        return 'Alumni';
      case 'students':
        return 'Current Students';
      case 'scholars':
        return 'Scholarship Recipients';
      case 'branch':
        return `Branch: ${drilldown.value}`;
      case 'year':
        return `Year: ${drilldown.value}`;
      case 'commission':
        return `High Commission: ${drilldown.value}`;
      case 'college':
        return `College: ${drilldown.value}`;
      case 'location':
        return `City: ${drilldown.value}`;
      default:
        return '';
    }
  };

  // Branch distribution with code for shorter labels
  const branchData = profiles.reduce((acc, profile) => {
    if (profile.branches?.name) {
      const branchName = profile.branches.name;
      const branchCode = profile.branches.code || branchName.slice(0, 6);
      if (!acc[branchName]) {
        acc[branchName] = { count: 0, code: branchCode };
      }
      acc[branchName].count += 1;
    }
    return acc;
  }, {} as Record<string, { count: number; code: string }>);

  const branchChartData = Object.entries(branchData)
    .map(([name, data]) => ({ 
      name, 
      shortName: data.code || name.slice(0, 8),
      value: data.count 
    }))
    .filter(d => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

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

  // Location distribution (by college city)
  const locationData = profiles
    .filter(p => p.colleges?.city)
    .reduce((acc, profile) => {
      const city = profile.colleges?.city || 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const locationChartData = Object.entries(locationData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

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
    { label: 'Total Members', value: profiles.length, icon: Users, color: 'from-primary/20 to-primary/5', description: 'Approved profiles', onClick: () => setDrilldown({ type: 'total' }) },
    { label: 'Alumni', value: alumniCount, icon: GraduationCap, color: 'from-chart-1/20 to-chart-1/5', description: 'Graduated members', onClick: () => setDrilldown({ type: 'alumni' }) },
    { label: 'Current Students', value: studentCount, icon: BookOpen, color: 'from-chart-2/20 to-chart-2/5', description: 'Active students', onClick: () => setDrilldown({ type: 'students' }) },
    { label: 'Cities', value: Object.keys(locationData).length, icon: Globe, color: 'from-chart-3/20 to-chart-3/5', description: 'College locations', onClick: undefined },
    { label: 'Colleges', value: Object.keys(collegeData).length, icon: Building2, color: 'from-chart-4/20 to-chart-4/5', description: 'Partner institutions', onClick: undefined },
    { label: 'Scholarships', value: profiles.filter(p => p.scholarship_year).length, icon: Award, color: 'from-chart-5/20 to-chart-5/5', description: 'Scholars awarded', onClick: () => setDrilldown({ type: 'scholars' }) },
  ];

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container px-4 sm:px-6 py-4 sm:py-8">
          {/* Header with animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-4 sm:mb-8"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              </motion.div>
              <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Community insights • Real-time updates
            </p>
          </motion.div>

          {/* Stats Cards Grid - 3 columns on mobile for compact view */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-4 sm:mb-8"
          >
            {statsCards.map((stat, index) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <Card 
                  className={`relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group ${stat.onClick ? 'cursor-pointer' : ''}`}
                  onClick={stat.onClick}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-50 group-hover:opacity-70 transition-opacity`} />
                  <CardContent className="p-2 sm:pt-4 sm:pb-3 sm:px-4 relative">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 sm:mb-2">
                      <stat.icon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-primary mb-1 sm:mb-0" />
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
                        className="text-lg sm:text-2xl font-bold"
                      >
                        <AnimatedCounter value={stat.value} />
                      </motion.div>
                    </div>
                    <p className="text-[10px] sm:text-xs font-medium leading-tight">{stat.label}</p>
                    <p className="text-[9px] sm:text-xs text-muted-foreground hidden sm:block">{stat.description}</p>
                    {stat.onClick && (
                      <p className="text-[9px] sm:text-xs text-primary mt-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                        Click to view →
                      </p>
                    )}
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
            className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6"
          >
            {/* Member Distribution - Donut Chart */}
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
                <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Member Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="h-48 sm:h-64">
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
                            innerRadius={35}
                            outerRadius={60}
                            paddingAngle={8}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                            onClick={(data) => {
                              if (data.type === 'alumni') setDrilldown({ type: 'alumni' });
                              else if (data.type === 'students') setDrilldown({ type: 'students' });
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {typeData.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`url(#pieGradient-${index})`}
                                stroke="hsl(var(--background))"
                                strokeWidth={2}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
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
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
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
                <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-bl from-chart-2/10 to-transparent rounded-bl-full" />
                <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    By High Commission
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="h-48 sm:h-64">
                    {commissionChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={commissionChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={55}
                            paddingAngle={5}
                            dataKey="value"
                            onClick={(data) => setDrilldown({ type: 'commission', value: data.name })}
                            style={{ cursor: 'pointer' }}
                          >
                            {commissionChartData.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={COLORS[index % COLORS.length]}
                                stroke="hsl(var(--background))"
                                strokeWidth={2}
                                className="cursor-pointer hover:opacity-80 transition-opacity"
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
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No commission data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Year-wise Distribution - Area Chart */}
            <motion.div variants={cardVariants} className="col-span-1 md:col-span-2">
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-24 sm:w-48 h-24 sm:h-48 bg-gradient-to-bl from-chart-1/5 to-transparent rounded-bl-full" />
                <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Year-wise Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="h-48 sm:h-72">
                    {yearChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={yearChartData}
                          onClick={(data) => data?.activePayload?.[0] && setDrilldown({ type: 'year', value: data.activePayload[0].payload.name })}
                          style={{ cursor: 'pointer' }}
                          margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="yearGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} width={30} />
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
                            strokeWidth={2}
                            fill="url(#yearGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Branch Distribution - Improved Horizontal Bar Chart */}
            <motion.div variants={cardVariants} className="col-span-1 md:col-span-2">
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-20 sm:w-32 h-20 sm:h-32 bg-gradient-to-bl from-chart-4/10 to-transparent rounded-bl-full" />
                <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Distribution by Branch
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="h-56 sm:h-80">
                    {branchChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={branchChartData} 
                          layout="vertical"
                          margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
                        >
                          <defs>
                            {branchChartData.map((_, index) => (
                              <linearGradient key={`branchGrad-${index}`} id={`branchGradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9}/>
                                <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.5}/>
                              </linearGradient>
                            ))}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={false} />
                          <XAxis 
                            type="number" 
                            tick={{ fontSize: 9 }} 
                            allowDecimals={false}
                          />
                          <YAxis 
                            dataKey="shortName" 
                            type="category" 
                            width={50} 
                            tick={{ fontSize: 9 }}
                            tickLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              fontSize: '12px'
                            }}
                            formatter={(value: number, name: string, props: { payload: { name: string } }) => [
                              `${value} members`, 
                              props.payload.name
                            ]}
                            labelFormatter={() => ''}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[0, 6, 6, 0]}
                            onClick={(data) => setDrilldown({ type: 'branch', value: data.name })}
                            style={{ cursor: 'pointer' }}
                          >
                            {branchChartData.map((_, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`url(#branchGradient-${index})`}
                                className="hover:opacity-80 transition-opacity"
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No branch data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Scholarship Trends - Line Chart */}
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Scholarship Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="h-44 sm:h-64">
                    {scholarshipChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={scholarshipChartData}
                          margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="scholarshipLine" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="hsl(var(--chart-3))" />
                              <stop offset="100%" stopColor="hsl(var(--chart-4))" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} width={25} />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="url(#scholarshipLine)" 
                            strokeWidth={2}
                            dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 1, r: 3 }}
                            activeDot={{ r: 5, fill: 'hsl(var(--chart-4))' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No scholarship data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* College Distribution - List View */}
            <motion.div variants={cardVariants}>
              <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Students by College
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="space-y-1.5 sm:space-y-2 max-h-48 sm:max-h-64 overflow-y-auto pr-1 sm:pr-2">
                    {collegeChartData.length > 0 ? (
                      collegeChartData.map((college, index) => (
                        <div
                          key={college.fullName}
                          onClick={() => setDrilldown({ type: 'college', value: college.fullName })}
                          className="flex items-center justify-between p-2 sm:p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div 
                              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span className="text-xs sm:text-sm font-medium truncate" title={college.fullName}>
                              {college.fullName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                            <span className="text-sm sm:text-lg font-bold text-primary">{college.value}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-24 sm:h-32 flex items-center justify-center text-muted-foreground text-sm">
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
                <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                    <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    By Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <div className="h-44 sm:h-64">
                    {locationChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={locationChartData}
                          margin={{ top: 5, right: 5, left: -15, bottom: 5 }}
                        >
                          <defs>
                            <linearGradient id="locationGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="hsl(var(--chart-5))" stopOpacity={0.9}/>
                              <stop offset="100%" stopColor="hsl(var(--chart-5))" stopOpacity={0.4}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-45} textAnchor="end" height={50} />
                          <YAxis tick={{ fontSize: 9 }} width={25} />
                          <Tooltip 
                            contentStyle={{ 
                              background: 'hsl(var(--popover))', 
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px',
                              fontSize: '12px'
                            }}
                          />
                          <Bar 
                            dataKey="value" 
                            fill="url(#locationGradient)" 
                            radius={[4, 4, 0, 0]}
                            onClick={(data) => setDrilldown({ type: 'location', value: data.name })}
                            style={{ cursor: 'pointer' }}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        No location data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        {/* Drilldown Modal */}
        <AnalyticsDetailModal
          open={drilldown !== null}
          onOpenChange={(open) => !open && setDrilldown(null)}
          title={getDrilldownTitle()}
          profiles={getFilteredProfiles()}
        />
      </Layout>
    </ProtectedRoute>
  );
}
