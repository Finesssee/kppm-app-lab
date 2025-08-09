'use client'

import { useState, useMemo } from "react";
import { useRouter } from 'next/navigation'
import { CategoryFilter } from "./CategoryFilter";
import { AppCard } from "./AppCard";
import { mockApps, mockCategories } from "@/data/mockApps";
import { AppManifest } from "@/types/app";

export const AppLibrary = () => {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = useMemo(() => {
    let filtered = mockApps;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.tags.some(tag => tag.toLowerCase().includes(query)) ||
        app.author.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [selectedCategory, searchQuery]);

  const handleAppSelect = (app: AppManifest) => {
    router.push(`/apps/${app.id}`)
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

        {/* Filters */}
        <div className="mb-8">
          <CategoryFilter
            categories={mockCategories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
        </div>

        {/* Search Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              {searchQuery ? `Search results for "${searchQuery}"` : 'All Apps'}
            </h2>
            <p className="text-muted-foreground">
              {filteredApps.length} app{filteredApps.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>

        {/* Apps Grid */}
        {filteredApps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
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