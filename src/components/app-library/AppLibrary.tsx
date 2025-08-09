'use client'

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { CategoryFilter } from "./CategoryFilter";
import { AppCard } from "./AppCard";
import { useApps, useCategories } from "@/lib/queries/apps";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export const AppLibrary = () => {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'trending' | 'alphabetical'>('recent');
  
  // Debounce search query to avoid too many API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  // Fetch apps with current filters
  const { data: appsData, isLoading: appsLoading, error: appsError } = useApps({
    query: debouncedSearchQuery || undefined,
    category: selectedCategory || undefined,
    sort: sortBy,
    limit: 20,
  });
  
  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  
  const apps = appsData?.apps || [];
  const categories = categoriesData?.categories || [];
  
  const handleAppSelect = (app: any) => {
    router.push(`/apps/${app.slug}`)
  }

  return (
    <>

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-hero rounded-2xl p-12 text-white mb-8">
            <h1 className="text-4xl font-bold mb-4">
              AI App Library
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Discover, run, and clone powerful AI applications. From image generation to text processing, 
              find the perfect AI tool for your creative projects.
            </p>
            <div className="mt-8 flex items-center justify-center space-x-4 text-sm opacity-75">
              <div className="flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                Instant execution
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🔓</span>
                Open source
              </div>
              <div className="flex items-center">
                <span className="text-2xl mr-2">🎯</span>
                Production ready
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search apps by name, description, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="trending">
                  <span className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Trending
                  </span>
                </SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Category Filter */}
          {categoriesLoading ? (
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-32" />
              ))}
            </div>
          ) : (
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
          )}
        </div>

        {/* Search Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {debouncedSearchQuery ? `Search results for "${debouncedSearchQuery}"` : selectedCategory || 'All Apps'}
            </h2>
            <p className="text-muted-foreground">
              {appsData?.total || 0} app{(appsData?.total || 0) !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Apps Grid */}
        {appsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : appsError ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">Failed to load apps</h3>
            <p className="text-muted-foreground mb-6">
              {appsError instanceof Error ? appsError.message : 'An error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : apps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((app) => (
              <div key={app.id} className="animate-fade-in">
                <AppCard
                  app={app}
                  onSelect={handleAppSelect}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No apps found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or browse different categories
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
                setSortBy('recent');
              }}
              className="text-primary hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </>
  );
};