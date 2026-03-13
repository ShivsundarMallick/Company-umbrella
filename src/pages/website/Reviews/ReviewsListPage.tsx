import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Building2, Calendar, Users, ChevronRight, Filter, Loader2 } from 'lucide-react';
import { Card, CardContent, Badge } from '../../../components/ui';
import { companiesService } from '../../../services';
import { format } from 'date-fns';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  registered: { label: 'Registered', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 border-red-200' },
};

const tierConfig: Record<string, { color: string; bg: string }> = {
  'Tier 1': { color: 'hsl(var(--stat-blue))', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  'Tier 2': { color: 'hsl(var(--stat-purple))', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  'Tier 3': { color: 'hsl(var(--stat-orange))', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
};

function CompanyRow({ company }: { company: any }) {
  const navigate = useNavigate();
  const status = statusConfig[company.status || 'pending'] || { label: company.status, className: 'bg-gray-100 text-gray-700' };
  const tier = tierConfig[company.role] || { color: 'gray', bg: 'bg-gray-100 text-gray-700' };

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
              {company.createdAt ? format(new Date(company.createdAt), 'MMM d, yyyy') : 'No date'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {company.details?.numberOfEmployees || 0} employees
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
  const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'tier1' | 'tier2' | 'tier3'>('tier1');
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await companiesService.getAll();
        const apiCompanies = Array.isArray(response.data) ? response.data : [];
        
        // Map backend Company model to UI structure
        const mapped = apiCompanies.map((c: any) => ({
          _id: c._id,
          name: c.companyData?.companyName || 'Unknown',
          email: c.companyData?.officialCompanyEmail || 'No email',
          role: c.tier,
          status: c.status,
          createdAt: c.createdAt,
          details: c.companyData
        }));

        setCompanies(mapped);
      } catch (error) {
        console.error('Failed to fetch companies for review:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const nameMatch = (c.name || '').toLowerCase().includes(search.toLowerCase());
      const emailMatch = (c.email || '').toLowerCase().includes(search.toLowerCase());
      const matchSearch = nameMatch || emailMatch;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [companies, search, statusFilter]);

  const tier1 = useMemo(() => filteredCompanies.filter((c) => c.role === 'Tier 1'), [filteredCompanies]);
  const tier2 = useMemo(() => filteredCompanies.filter((c) => c.role === 'Tier 2'), [filteredCompanies]);
  const tier3 = useMemo(() => filteredCompanies.filter((c) => c.role === 'Tier 3'), [filteredCompanies]);

  const counts = { tier1: tier1.length, tier2: tier2.length, tier3: tier3.length };

  const renderList = (tierItems: any[]) => (
    <div className="space-y-3 mt-4">
      {tierItems.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
          No companies found for this filter
        </div>
      ) : (
        tierItems.map((c) => <CompanyRow key={c._id} company={c} />)
      )}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Company Reviews</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve company applications across all tiers</p>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search companies by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm transition-all"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              {(['all', 'pending', 'registered', 'approved', 'rejected'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors ${statusFilter === s
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-background text-muted-foreground border-input hover:bg-accent'
                    }`}
                >
                  {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex w-full justify-start border border-border rounded-xl overflow-hidden bg-card/50 shadow-sm max-w-xl">
        {(['tier1', 'tier2', 'tier3'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all ${activeTab === tab
              ? 'bg-primary text-primary-foreground shadow-inner'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground border-r last:border-r-0 border-border'
              }`}
          >
            Tier {tab.replace('tier', '')} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* List content */}
      <div className="mt-4 min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-muted-foreground font-medium animate-pulse">Fetching live registrations...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'tier1' && renderList(tier1)}
            {activeTab === 'tier2' && renderList(tier2)}
            {activeTab === 'tier3' && renderList(tier3)}
          </div>
        )}
      </div>
    </div>
  );
}
