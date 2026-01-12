import React, { createContext } from 'react';
import type { SEOPageContext } from '../shared/types.js';

/**
 * Context for SEO page data
 */
export const SEOPageDataContext = createContext<SEOPageContext | null>(null);

export default SEOPageDataContext;
