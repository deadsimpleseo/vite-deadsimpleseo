import React, { createContext, useContext } from 'react';
import type { SEOPageContext, SEOPageListItem } from './types.js';

/**
 * Context for SEO page data
 */
export const SEOPageDataContext = createContext<SEOPageContext | null>(null);

/**
 * Hook to access current SEO page metadata
 * Returns pageTitle and pageContent for the current SEO page
 */
export function useSEOPage(): SEOPageContext {
  const context = useContext(SEOPageDataContext);
  
  if (!context) {
    throw new Error('useSEOPage must be used within an SEO page component');
  }
  
  return context;
}

/**
 * Global registry of SEO pages (populated at build time)
 */
let seoPagesList: SEOPageListItem[] = [];

/**
 * Set the list of SEO pages (called during build)
 */
export function _setSEOPagesList(pages: SEOPageListItem[]): void {
  seoPagesList = pages;
}

/**
 * Hook to get list of all SEO pages with URLs
 * Useful for generating navigation or sitemaps
 */
export function useSEOPages(): SEOPageListItem[] {
  return seoPagesList;
}

/**
 * Provider component for SEO page context
 */
export function SEOPageProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SEOPageContext;
}) {
  return (
    <SEOPageDataContext.Provider value={value}>
      {children}
    </SEOPageDataContext.Provider>
  );
}
