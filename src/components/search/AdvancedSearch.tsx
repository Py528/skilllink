'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SearchFilters {
  query: string;
  category: string[];
  difficulty: string[];
  duration: string[];
  price: string[];
  rating: number;
  instructor: string[];
  tags: string[];
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  price: number;
  thumbnail: string;
  tags: string[];
  category: string;
  difficulty: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  results: SearchResult[];
  loading?: boolean;
  className?: string;
}

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Data Science', 'AI/ML',
  'Design', 'Business', 'Marketing', 'Photography', 'Music', 'Writing'
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const DURATION_OPTIONS = ['< 1 hour', '1-3 hours', '3-6 hours', '6+ hours'];
const PRICE_RANGES = ['Free', '$0-50', '$50-100', '$100+'];

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  results,
  loading = false,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: [],
    difficulty: [],
    duration: [],
    price: [],
    rating: 0,
    instructor: [],
    tags: []
  });

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced search
  const debouncedSearch = useCallback((newFilters: SearchFilters) => {
    const timeout = setTimeout(() => {
      onSearch(newFilters);
    }, 300);
    return () => clearTimeout(timeout);
  }, [onSearch]);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: unknown) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    debouncedSearch(newFilters);
  }, [filters, debouncedSearch]);

  const handleQueryChange = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query }));
    
    // Generate suggestions based on query
    if (query.length > 2) {
      const mockSuggestions = [
        'React', 'JavaScript', 'Python', 'Node.js', 'TypeScript',
        'Machine Learning', 'Web Design', 'Data Analysis'
      ].filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    debouncedSearch({ ...filters, query });
  }, [filters, debouncedSearch]);

  const toggleFilter = useCallback((key: keyof SearchFilters, value: string) => {
    const currentValues = filters[key] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleFilterChange(key, newValues);
  }, [filters, handleFilterChange]);

  const clearFilters = useCallback(() => {
    const clearedFilters: SearchFilters = {
      query: '',
      category: [],
      difficulty: [],
      duration: [],
      price: [],
      rating: 0,
      instructor: [],
      tags: []
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  }, [onSearch]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).reduce((count, value) => {
      if (Array.isArray(value)) {
        return count + value.length;
      }
      return count + (value ? 1 : 0);
    }, 0);
  }, [filters]);

  return (
    <div className={cn('w-full', className)}>
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            placeholder="Search courses, instructors, or topics..."
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            className="pl-10 pr-12 h-12 text-lg"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <Filter className="h-4 w-4 mr-1" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </div>

        {/* Search Suggestions */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    handleQueryChange(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                      <Button
                        key={category}
                        variant={filters.category.includes(category) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('category', category)}
                        className="text-xs"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Difficulty</label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFICULTY_LEVELS.map((level) => (
                      <Button
                        key={level}
                        variant={filters.difficulty.includes(level) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('difficulty', level)}
                        className="text-xs"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Duration</label>
                  <div className="flex flex-wrap gap-2">
                    {DURATION_OPTIONS.map((duration) => (
                      <Button
                        key={duration}
                        variant={filters.duration.includes(duration) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('duration', duration)}
                        className="text-xs"
                      >
                        {duration}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price</label>
                  <div className="flex flex-wrap gap-2">
                    {PRICE_RANGES.map((range) => (
                      <Button
                        key={range}
                        variant={filters.price.includes(range) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleFilter('price', range)}
                        className="text-xs"
                      >
                        {range}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Minimum Rating: {filters.rating > 0 ? `${filters.rating}+` : 'Any'}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={filters.rating}
                      onChange={(e) => handleFilterChange('rating', parseFloat(e.target.value))}
                      className="flex-1"
                    />
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm">{filters.rating}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {filters.category.map((cat) => (
              <Badge key={cat} variant="secondary" className="flex items-center gap-1">
                {cat}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleFilter('category', cat)}
                />
              </Badge>
            ))}
            {filters.difficulty.map((diff) => (
              <Badge key={diff} variant="secondary" className="flex items-center gap-1">
                {diff}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleFilter('difficulty', diff)}
                />
              </Badge>
            ))}
            {filters.rating > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {filters.rating}+ Stars
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => handleFilterChange('rating', 0)}
                />
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {loading ? 'Searching...' : `${results.length} courses found`}
      </div>
    </div>
  );
};

export default AdvancedSearch;
