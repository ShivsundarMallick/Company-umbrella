import { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Badge, Input } from '../../../components/ui';
import { companiesService } from '../../../services';

const TIER_CONFIG = [
    { id: 'Tier 1', label: 'Tier 1', description: 'Enterprise Companies', color: 'default' },
    { id: 'Tier 2', label: 'Tier 2', description: 'SME Companies', color: 'secondary' },
    { id: 'Tier 3', label: 'Tier 3', description: 'Small/Startup Companies', color: 'outline' },
] as const;

export default function UploadsLandingPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [companies, setCompanies] = useState<any[]>([]);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            const response = await companiesService.getAll();
            const apiCompanies = Array.isArray(response.data) ? response.data : [];
            
            // Map Company model to flat structure for the UI
            const mapped = apiCompanies.map((c: any) => ({
                _id: c._id,
                name: c.companyData?.companyName || 'Unknown',
                email: c.companyData?.officialCompanyEmail || 'No email',
                role: c.tier
            }));

            setCompanies(mapped);
        } catch (error) {
            console.error('Failed to fetch companies:', error);
            setCompanies([]);
        } 
    };

    const filteredCompanies = companies.filter(company => {
        const searchTerm = search.toLowerCase().trim();
        if (!searchTerm) return true;
        
        // Split and filter out common stop words that might be in a natural language query
        const stopWords = ['company', 'limited', 'ltd', 'inc', 'corp', 'solutions', 'solution'];
        const searchWords = searchTerm.split(/\s+/).filter(word => !stopWords.includes(word) && word.length > 1);
        
        if (searchWords.length === 0) {
            // If only stop words or short words, try exact match or just first word
            const allWords = searchTerm.split(/\s+/);
            const companyName = company.name.toLowerCase();
            return allWords.some(word => companyName.includes(word));
        }

        const companyName = company.name.toLowerCase();
        const companyEmail = company.email.toLowerCase();

        // Check if ALL remaining search words are present in name or email
        return searchWords.every(word => 
            companyName.includes(word) || companyEmail.includes(word)
        );
    });

    const getCompaniesByTier = (tier: string) => {
        return filteredCompanies.filter(c => c.role === tier);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Document Uploads</h1>
                    <p className="text-sm text-muted-foreground mt-1">Select a company to manage compliance documents and reports</p>
                </div>
                <div className="w-full md:w-96 relative">
                    <Input
                        placeholder="Search companies by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-background"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {TIER_CONFIG.map((tier) => {
                    const tierCompanies = getCompaniesByTier(tier.id);
                    return (
                        <div key={tier.id} className="space-y-4">
                            <div className="flex items-center justify-between border-b border-border pb-2">
                                <div className="flex items-center gap-3">
                                    <Badge variant={tier.color as any} className="px-3 py-1 text-sm font-semibold">
                                        {tier.label}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">{tier.description}</span>
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">
                                    {tierCompanies.length} Companies
                                </span>
                            </div>

                            {tierCompanies.length === 0 ? (
                                <Card className="bg-muted/50 border-dashed">
                                    <CardContent className="py-8 text-center text-muted-foreground">
                                        No companies found in this tier
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tierCompanies.map((company) => (
                                        <Card
                                            key={company._id || company.id}
                                            className="group hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                                            onClick={() => navigate(`/website/uploads/${company._id || company.id}`)}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                                                            {company.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-foreground truncate">{company.name}</h3>
                                                            <p className="text-xs text-muted-foreground truncate">{company.email}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
