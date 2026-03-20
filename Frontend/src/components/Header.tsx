import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, SlidersHorizontal, FileText, Video, Link2, BookOpen, Newspaper, X, Check } from "lucide-react";
import { Button } from "@/components/ui";
import type { SearchItem } from "@/lib/searchData";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "@/components/AuthModel";
import UserDropdown from "@/components/UserDropdown";

const defaultFilterOptions = [
  "All",
  "UPSC",
  "IAS",
  "PRELIMS",
  "MAINS",
  "STRATEGY",
  "CURRENT AFFAIRS",
  "HISTORY",
  "GEOGRAPHY",
  "POLITY",
  "ECONOMY",
  "SCIENCE",
  "ENVIRONMENT",
  "ETHICS",
  "ESSAY",
  "INTERVIEW",
  "NCERT",
] as const;

type FilterType = string;

const getTypeIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return FileText;
    case "video":
      return Video;
    case "link":
      return Link2;
    case "note":
      return BookOpen;
    case "quickie":
      return Newspaper;
    default:
      return Newspaper;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "pdf":
      return "PDF";
    case "video":
      return "Video";
    case "link":
      return "Link";
    case "note":
      return "Note";
    case "quickie":
      return "Quickie";
    case "article":
      return "Article";
    default:
      return type;
  }
};

interface HeaderProps {
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  filterOptions?: string[];
  showHamburgerMenu?: boolean;
  searchResults?: SearchItem[];
  onSearchResultClick?: (item: SearchItem) => void;
  showSearchDropdown?: boolean;
}

const Header = ({
  activeFilter = "All",
  onFilterChange,
  searchQuery: externalQuery = "",
  onSearchChange,
  filterOptions: customFilterOptions,
  searchResults,
  onSearchResultClick,
  showSearchDropdown = false
}: HeaderProps) => {
  const currentFilterOptions = customFilterOptions || [...defaultFilterOptions];
  const defaultFilter = currentFilterOptions[0] || "All";
  const [internalQuery, setInternalQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();

  const query = externalQuery !== undefined ? externalQuery : internalQuery;
  const setQuery = onSearchChange || setInternalQuery;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (value: string) => {
    setQuery(value);
    if (value.trim() && showSearchDropdown) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleResultClick = (item: SearchItem) => {
    if (onSearchResultClick) {
      onSearchResultClick(item);
    } else {
      navigate(item.route);
    }
    setQuery("");
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleFilterSelect = (filter: FilterType) => {
    onFilterChange?.(filter);
    setIsFilterOpen(false);
  };

  const renderAuthButton = () => {
    if (isAuthenticated === null) {
      // Not logged in - show Login button
      return (
        <Button
          onClick={() => setIsAuthModalOpen(true)}
          variant="outline"
          size="sm"
          className="h-8 px-3 rounded-full bg-card border-border text-foreground font-medium hover:bg-muted text-xs sm:text-sm sm:h-10 sm:px-4 whitespace-nowrap shrink-0"
        >
          Log In
        </Button>
      );
    }

    // For guest or authenticated users, show the dropdown
    return <UserDropdown />;
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-header px-4 py-3 safe-top">
        <div className="flex items-center gap-3">
          <button className="p-2 text-white hover:opacity-80 transition-opacity">
            <Menu className="h-6 w-6" />
          </button>

          <div ref={containerRef} className="flex-1 min-w-0 relative">
            <div className="flex items-center bg-card rounded-full px-2 sm:px-4 py-2 sm:py-2.5 gap-1.5 sm:gap-2">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => query.trim() && setIsOpen(true)}
                placeholder="Search..."
                className="flex-1 min-w-0 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-xs sm:text-sm font-body"
              />
              {query && (
                <button onClick={clearSearch} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              )}
              {/* Filter Dropdown */}
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`p-1 rounded-full transition-colors ${activeFilter !== "All"
                    ? "text-accent"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </button>

                {isFilterOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-card rounded-lg shadow-elevated border border-border z-50 py-2 max-h-64 overflow-y-auto animate-scale-in">
                    {currentFilterOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleFilterSelect(option)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-muted flex items-center justify-between transition-colors"
                      >
                        {option}
                        {activeFilter === option && (
                          <Check className="w-4 h-4 text-accent" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showSearchDropdown && isOpen && searchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-elevated border border-border max-h-80 overflow-y-auto z-50 animate-slide-up">
                {searchResults.map((item) => {
                  const Icon = getTypeIcon(item.type);
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleResultClick(item)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left border-b border-border/30 last:border-0"
                    >
                      {item.image ? (
                        <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-accent" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{item.title}</p>
                        {item.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                        )}
                      </div>
                      <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                        {getTypeLabel(item.type)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {showSearchDropdown && isOpen && query.trim() && (!searchResults || searchResults.length === 0) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-elevated border border-border p-4 z-50 animate-fade-in">
                <p className="text-sm text-muted-foreground text-center">No results found for "{query}"</p>
              </div>
            )}
          </div>

          {renderAuthButton()}
        </div>

        {/* Active Filter Badge */}
        {activeFilter !== defaultFilter && (
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              {activeFilter}
              <button onClick={() => onFilterChange?.(defaultFilter)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};

export default Header;
export { defaultFilterOptions as filterOptions };
export type { FilterType };
