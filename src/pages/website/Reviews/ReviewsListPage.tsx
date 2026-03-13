import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Calendar, Users, ChevronRight, Filter } from 'lucide-react';
import { Card, CardContent, Badge } from '../../../components/ui';
import { allMockCompanies, type Company, type ReviewStatus } from '../../../data/mockCompanies';

const statusConfig: Record<ReviewStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
};

const tierConfig = {
  'Tier 1': { color: 'hsl(var(--stat-blue))', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Tier 2': { color: 'hsl(var(--stat-purple))', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Tier 3': { color: 'hsl(var(--stat-orange))', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
};

function CompanyRow({ company }: { company: Company }) {
  const navigate = useNavigate();
  const status = statusConfig[company.status];
  const tier = tierConfig[company.role];

  return (
    <div
      onClick={() => navigate(`/website/reviews/${company._id}`)}
      className="flex items-center justify-between p-4 rounded-xl bg-card hover:shadow-md transition-all duration-200 cursor-pointer group border border-border"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{company.name}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(company.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {company.details.numberOfEmployees} employees
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Badge variant="default" className={tier.bg}>{company.role}</Badge>
        <Badge variant="default" className={status.className}>{status.label}</Badge>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'tier1' | 'tier2' | 'tier3'>('tier1');

  const filterCompanies = (companies: Company[]) =>
    companies.filter((c) => {
      const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });

  const tier1 = useMemo(() => filterCompanies(allMockCompanies.filter((c) => c.role === 'Tier 1')), [search, statusFilter]);
  const tier2 = useMemo(() => filterCompanies(allMockCompanies.filter((c) => c.role === 'Tier 2')), [search, statusFilter]);
  const tier3 = useMemo(() => filterCompanies(allMockCompanies.filter((c) => c.role === 'Tier 3')), [search, statusFilter]);

  const counts = { tier1: tier1.length, tier2: tier2.length, tier3: tier3.length };

  const renderList = (companies: Company[]) => (
    <div className="space-y-3 mt-4">
      {companies.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No companies found</div>
      ) : (
        companies.map((c) => <CompanyRow key={c._id} company={c} />)
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Company Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve company applications across all tiers</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${statusFilter === s
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-input hover:bg-accent'
                    }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex w-full justify-start border border-gray-200 rounded-lg overflow-hidden bg-white max-w-xl">
        {(['tier1', 'tier2', 'tier3'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${activeTab === tab
              ? 'bg-primary text-primary-foreground'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-r last:border-r-0 border-gray-200'
              }`}
          >
            Tier {tab.replace('tier', '')} ({counts[tab]})
          </button>
        ))}
      </div>
      <div className="mt-4">
        {activeTab === 'tier1' && renderList(tier1)}
        {activeTab === 'tier2' && renderList(tier2)}
        {activeTab === 'tier3' && renderList(tier3)}
      </div>
    </div>
  );
}
