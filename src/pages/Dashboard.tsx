import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Zap, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { mockCompanies } from '@/data/mockCompanies';

const signalTypeColor: Record<string, string> = {
  hiring: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  product: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  funding: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  partnership: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  press: 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  tech: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
};

const statAccent = [
  'border-l-blue-500 bg-blue-500/5',
  'border-l-emerald-500 bg-emerald-500/5',
  'border-l-amber-500 bg-amber-500/5',
  'border-l-purple-500 bg-purple-500/5',
];

const iconBg = [
  'bg-blue-500/15 text-blue-400',
  'bg-emerald-500/15 text-emerald-400',
  'bg-amber-500/15 text-amber-400',
  'bg-purple-500/15 text-purple-400',
];

const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const totalFunding = mockCompanies.reduce((sum, c) => {
      const n = parseFloat(c.funding.replace(/[^0-9.]/g, ''));
      const isM = c.funding.includes('M');
      return sum + (isM ? n : n / 1000);
    }, 0);

    const allSignals = mockCompanies.flatMap((c) =>
      c.signals.map((s) => ({ ...s, company: c }))
    );
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSignals = allSignals.filter((s) => new Date(s.date) >= thirtyDaysAgo);

    return {
      totalCompanies: mockCompanies.length,
      totalFunding: `$${totalFunding.toFixed(0)}M`,
      totalSignals: allSignals.length,
      recentSignals: recentSignals.length,
    };
  }, []);

  const recentActivity = useMemo(() => {
    return mockCompanies
      .flatMap((c) => c.signals.map((s) => ({ ...s, company: c })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, []);

  const stageData = useMemo(() => {
    const counts: Record<string, number> = {};
    mockCompanies.forEach((c) => {
      counts[c.stage] = (counts[c.stage] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));
  }, []);

  const industryData = useMemo(() => {
    const counts: Record<string, number> = {};
    mockCompanies.forEach((c) => {
      counts[c.industry] = (counts[c.industry] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));
  }, []);

  const signalTypeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    mockCompanies.forEach((c) =>
      c.signals.forEach((s) => {
        counts[s.type] = (counts[s.type] || 0) + 1;
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }));
  }, []);

  const statCards = [
    {
      label: 'Companies',
      value: stats.totalCompanies,
      sub: 'tracked in pipeline',
      icon: Building2,
    },
    {
      label: 'Total Raised',
      value: stats.totalFunding,
      sub: 'across all companies',
      icon: DollarSign,
    },
    {
      label: 'Total Signals',
      value: stats.totalSignals,
      sub: 'across all companies',
      icon: Zap,
    },
    {
      label: 'Recent Signals',
      value: stats.recentSignals,
      sub: 'in the last 30 days',
      icon: TrendingUp,
    },
  ];

  const tooltipStyle = {
    background: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    fontSize: '12px',
    color: 'hsl(var(--foreground))',
  };

  return (
    <div className="p-6 space-y-8">

      {/* Page Header */}
      <div className="border-b border-border pb-5">
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Deal-Flow{' '}
          <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live overview of your venture pipeline — signals, funding, and company activity.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <Card key={s.label} className={`border-l-2 ${statAccent[i]}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                  {s.label}
                </span>
                <div className={`h-7 w-7 rounded-md flex items-center justify-center ${iconBg[i]}`}>
                  <s.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-4xl font-display font-bold tracking-tight">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity + Signal Types */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0 pt-5 px-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-display font-semibold">
                  Recent Signal Activity
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Latest signals across all companies</p>
              </div>
              <Link
                to="/companies"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0 mt-4">
            <div className="divide-y divide-border">
              {recentActivity.map((item, i) => (
                <Link
                  key={i}
                  to={`/companies/${item.company.id}`}
                  className="flex items-start gap-3 px-5 py-3 hover:bg-muted/20 transition-colors group"
                >
                  <div className="mt-2 shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/60 group-hover:bg-primary transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {item.company.name}
                      </span>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${signalTypeColor[item.type] || ''}`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.title}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono shrink-0 mt-0.5">
                    {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Signal Type Breakdown */}
        <Card>
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-base font-display font-semibold">Signal Breakdown</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Distribution by signal type</p>
          </CardHeader>
          <CardContent className="mt-5 space-y-3">
            {signalTypeBreakdown.map(({ type, count }) => (
              <div key={type} className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border w-[4.5rem] justify-center shrink-0 ${signalTypeColor[type] || ''}`}
                >
                  {type}
                </span>
                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(count / signalTypeBreakdown[0].count) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-4 text-right shrink-0">
                  {count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Stage Distribution */}
        <Card>
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-base font-display font-semibold">Stage Distribution</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click a bar to filter companies by stage
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={stageData}
                barSize={32}
                onClick={(data) => {
                  if (data?.activePayload?.[0]?.payload?.name) {
                    navigate(`/companies?stage=${encodeURIComponent(data.activePayload[0].payload.name)}`);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={20}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  formatter={(value: number) => [value, 'Companies']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {stageData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Industries */}
        <Card>
          <CardHeader className="pb-0 pt-5 px-5">
            <CardTitle className="text-base font-display font-semibold">Top Industries</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Click a bar to filter companies by industry
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={industryData}
                layout="vertical"
                barSize={18}
                onClick={(data) => {
                  if (data?.activePayload?.[0]?.payload?.name) {
                    navigate(`/companies?industry=${encodeURIComponent(data.activePayload[0].payload.name)}`);
                  }
                }}
                style={{ cursor: 'pointer' }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  width={112}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  formatter={(value: number) => [value, 'Companies']}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {industryData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Company Quick List */}
      <Card>
        <CardHeader className="pb-0 pt-5 px-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-display font-semibold">All Companies</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Quick access to every tracked company</p>
            </div>
            <Link
              to="/companies"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              Full view <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="divide-y divide-border">
            {mockCompanies.map((company) => (
              <Link
                key={company.id}
                to={`/companies/${company.id}`}
                className="flex items-center gap-4 px-5 py-2.5 hover:bg-muted/20 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                    {company.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono ml-2">{company.domain}</span>
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block">{company.industry}</span>
                <Badge variant="secondary" className="text-xs font-normal shrink-0">{company.stage}</Badge>
                <span className="text-xs font-mono text-muted-foreground shrink-0">{company.funding}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {company.signals.length} signal{company.signals.length !== 1 ? 's' : ''}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
