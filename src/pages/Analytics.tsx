import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend 
} from 'recharts';
import { Users, GraduationCap, BookOpen, Globe, TrendingUp, Sparkles } from 'lucide-react';

export default function Analytics() {
  const { profiles } = useProfiles({ status: 'approved' });

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
    .map(([name, value]) => ({ name: name.length > 25 ? name.slice(0, 25) + '...' : name, value }))
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

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Analytics</h1>
          </div>
          <p className="text-muted-foreground mb-8">Community insights and statistics - updates in real-time</p>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{profiles.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Approved profiles</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Alumni</CardTitle>
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{alumniCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Graduated members</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Current Students</CardTitle>
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{studentCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Active students</p>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Countries</CardTitle>
                  <Globe className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Object.keys(locationData).length}</div>
                <p className="text-xs text-muted-foreground mt-1">Global presence</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Member Distribution Pie */}
            <Card className="hover:shadow-lg transition-all">
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
                        <Pie
                          data={typeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {typeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
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

            {/* Branch Distribution */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>By Branch</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {branchChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={branchChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
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

            {/* Year-wise Distribution */}
            <Card className="md:col-span-2 hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>Year-wise Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {yearChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={yearChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
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

            {/* Scholarship Trends */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>Scholarship Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {scholarshipChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scholarshipChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--chart-3))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--chart-3))', strokeWidth: 2 }}
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

            {/* High Commission Distribution */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>By High Commission</CardTitle>
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
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {commissionChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
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

            {/* College Distribution */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>By College</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {collegeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={collegeChartData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
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

            {/* Location Distribution */}
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <CardTitle>By Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {locationChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={locationChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
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
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
