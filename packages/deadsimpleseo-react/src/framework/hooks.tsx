import React, { createContext, useContext } from 'react';
import type { SEOPageContext, SEOPageInfo, SEOPageListItem } from '../shared/types.js';

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

export function useSEOPageComponent(): React.FC | null {
  const context = useContext(SEOPageDataContext);

  function Wrapper() {
    // TODO: support markdown rendering here
    return context?.render ? context.render() : null;
  }

  return Wrapper;
}

// /**
//  * Global registry of SEO pages (populated at build time)
//  */
// let seoPagesList: SEOPageListItem[] = [];

interface _SEOHooksInternalState {
  seoPagesList: SEOPageListItem[];
  currentSEOPage: SEOPageInfo | null;
  currentSEOPageContext: SEOPageContext | null;
}

/**
 * Internal state for SEO hooks
 */
const _seoHooksState: _SEOHooksInternalState = {
  seoPagesList: [],
  currentSEOPage: null,
  currentSEOPageContext: null,
};

/**
 * Set the list of SEO pages (called during build)
 */
export function _setSEOPagesList(pages: SEOPageListItem[]): void {
  _seoHooksState.seoPagesList = pages;
}

// /**
//  * Global variable to hold the current SEO page info
//  */
// let currentSEOPage: SEOPageInfo | null = null;

// /**
//  * 
//  * @param page 
//  */

export async function _setCurrentSEOPage(page: SEOPageInfo) {
  _seoHooksState.currentSEOPage = page;
  _seoHooksState.currentSEOPageContext = await loadSEOPage(page);
}

/**
 * Hook to get list of all SEO pages with URLs
 * Useful for generating navigation or sitemaps
 */
export function useSEOPages(): SEOPageListItem[] {
  return _seoHooksState.seoPagesList;
}

export async function loadMarkdownPage(pageInfo: SEOPageInfo): Promise<SEOPageContext | null> {
  if (!pageInfo || !pageInfo.isMarkdown) {
    return null;
  }

  // const fs = require('fs');
  // const { parseMarkdown } = require('../shared/markdown.js');

  // const markdownContent = fs.readFileSync(pageInfo.componentPath, 'utf-8');
  // const parsed = parseMarkdown(markdownContent);

  // Fix usage of fs in browser environment

  const parsed = {
    frontmatter: {
      title: 'Sample Markdown Page',
    },
    html: 'This is sample rendered HTML content from markdown.',
  };

  return {
    pageTitle: parsed.frontmatter.title || pageInfo.name,
    render: () => (
      <div
        className="markdown-content"
        style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
        dangerouslySetInnerHTML={{ __html: parsed.html }}
      />
    ),
    meta: parsed.frontmatter,
  };
}

export async function loadSEOPage(pageInfo: SEOPageInfo): Promise<SEOPageContext | null> {
  if (!pageInfo) {
    return null;
  }

  if (pageInfo.isMarkdown) {
    return loadMarkdownPage(pageInfo);
  }

  const PageComponent = (await import(/* @vite-ignore */ pageInfo.componentPath)).default;

  return {
    pageTitle: pageInfo.meta?.title || pageInfo.name,
    render: () => {
      return PageComponent ? <PageComponent /> : null;
    },
    meta: pageInfo.meta,
  };
}

/**
 * Provider component for SEO page context
 */
export function SEOPageProvider({
  children,
  pageContext,
  pageInfo,
}: {
  children?: React.ReactNode;
  pageContext?: SEOPageContext;
  pageInfo?: SEOPageInfo;
}) {
  // const pageInfo = value || (currentSEOPage ? {
  //   pageTitle: currentSEOPage.meta?.title || currentSEOPage.name || 'Untitled Page',
  //   pageContent: currentSEOPage.meta?.description || '',
  //   meta: currentSEOPage.meta,
  // } : null);

  // const contextValue = value || (_seoHooksState.currentSEOPage ? await loadSEOPage(_seoHooksState.currentSEOPage) : null);

  const getPageContext = () => {
    if (pageContext) {
      return pageContext;
    }

    if (!pageInfo) {
      return null;
    }

    if (pageInfo.isMarkdown) {
      // Load markdown page
      return {
        pageTitle: pageInfo.meta?.title || pageInfo.name || 'Untitled Page',
        render: () => {
          return <span>Markdown rendering not implemented in this context.</span>;
        },
        meta: pageInfo.meta,
      };
    }

    if (!pageInfo.componentPath) {
      throw new Error('SEOPageProvider: pageInfo must have a componentPath for non-markdown pages');
    }

    // Load React component
    pageContext = {
      pageTitle: pageInfo.meta?.title || pageInfo.name || 'Untitled Page',
      render: () => {
        const PageComponent = require(/* @vite-ignore */ pageInfo.componentPath).default;
        return PageComponent ? <PageComponent /> : null;
      },
      meta: {
        ...pageInfo.meta,
        componentPath: pageInfo.componentPath,
      },
    };

    return pageContext;
  };

  const contextValue =
    ((pageContext || pageInfo) ? getPageContext() : null) ||
    _seoHooksState.currentSEOPageContext;

  if (!contextValue) {
    throw new Error('SEOPageProvider requires a valid pageContext or pageInfo, or setCurrentSEOPage must be called before rendering.');
  }

  return (
    <SEOPageDataContext.Provider value={contextValue!}>
      {children}
    </SEOPageDataContext.Provider>
  );
}
