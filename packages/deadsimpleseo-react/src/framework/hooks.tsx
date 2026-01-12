import React, { createContext, useContext } from 'react';
import type { SEOPageContentPair, SEOPageContext, SEOPageInfo, SEOPageListItem } from '../shared/types.js';

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
  componentCache?: Map<string, React.FC>;
  contentCache?: Map<string, string>;
}

/**
 * Utility to determine whether the current page is an SEO page (static)
 */
export function isSEOPage(): boolean {
  // We cannot use hooks here, so we access the internal state directly
  return _seoHooksState?.currentSEOPage !== null;
}

/**
 * Utility to cache component by path
 */
export function cacheSEOComponent(pageInfo: SEOPageInfo, component: React.FC) {
  if (!_seoHooksState.componentCache) {
    _seoHooksState.componentCache = new Map<string, React.FC>();
  }
  _seoHooksState.componentCache.set(pageInfo.componentPath, component);
}

/**
 * Utility to cache content by path
 */
export function cacheSEOContent(pageInfo: SEOPageInfo, content: string) {
  if (!_seoHooksState.contentCache) {
    _seoHooksState.contentCache = new Map<string, string>();
  }
  _seoHooksState.contentCache.set(pageInfo.componentPath, content);
}

/**
 * Utility to cache multiple pages of SEO content
 */
export function cacheMultipleSEOPages(...pairs: SEOPageContentPair[]) {
  console.log('[deadsimpleseo-react] Caching multiple SEO page contents:', pairs?.length);
  // console.log('[deadsimpleseo-react] Caching multiple SEO page contents:', pairs);

  if (!_seoHooksState.contentCache) {
    _seoHooksState.contentCache = new Map<string, string>();
  }
  for (const pair of pairs) {
    _seoHooksState.contentCache.set(pair.pageInfo.componentPath, pair.content);
  }
}

/**
 * Utility to set SEO page info in global state
 * Used during server-side rendering to provide page context
 */
export function setCurrentSEOPage(pageInfo: SEOPageInfo) {
  _seoHooksState.currentSEOPage = pageInfo;
  // if (component) {
  //   _seoHooksState.currentSEOPageContext = {
  //     pageTitle: pageInfo.meta?.title || pageInfo.name,
  //     render: () => React.createElement(component),
  //     meta: pageInfo.meta,
  //   };
  // }

  // Look for cached component
  if (_seoHooksState.componentCache?.has(pageInfo.componentPath)) {
    const cachedComponent = _seoHooksState.componentCache.get(pageInfo.componentPath)!;
    _seoHooksState.currentSEOPageContext = {
      pageTitle: pageInfo.meta?.title || pageInfo.name,
      render: () => React.createElement(cachedComponent),
      meta: {
        ...pageInfo.meta,
        componentPath: pageInfo.componentPath,
      },
    };
  }
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

export async function loadSEOPageWithChildren(pageInfo: SEOPageInfo): Promise<SEOPageContext | null> {
  if (!pageInfo || !pageInfo.childPages?.length) {
    return null;
  }

  const promises = pageInfo.childPages.map(async (childPage) => {
    return loadSEOPage(childPage);
  });

  const childContexts = await Promise.all(promises);

  // Combine child contexts into a single render function
  return {
    pageTitle: pageInfo.meta?.title || pageInfo.name,
    render: () => (
      <div>
        <h2><a href={pageInfo.route}>{pageInfo.meta?.title || pageInfo.name}</a></h2>
        {childContexts.map((context, index) => (
          context ? <div key={index}>{context.render ? context.render() : null}</div> : null
        ))}
      </div>
    ),
    meta: pageInfo.meta,
  };
}

export async function loadSEOPage(pageInfo: SEOPageInfo): Promise<SEOPageContext | null> {
  if (!pageInfo) {
    return null;
  }

  console.log('[deadsimpleseo-react] pageInfo:', pageInfo);

  if (pageInfo.isMarkdown) {
    return loadMarkdownPage(pageInfo);
  }

  if (pageInfo.childPages?.length) {
    return loadSEOPageWithChildren(pageInfo);
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

  const getSinglePageContext = (pageInfo: SEOPageInfo) => {
    const _pageInfo = pageInfo;
    // if (pageContext) {
    //   return pageContext;
    // }

    // if (!pageInfo) {
    //   if 
    //   return null;
    // }

    // const _pageInfo = pageInfo || _seoHooksState.currentSEOPage;
    // if (!_pageInfo) {
    //   console.warn('SEOPageProvider: No pageInfo available');
    //   return null;
    // }

    if (_pageInfo.isMarkdown) {
      console.log('[deadsimpleseo-react] Current cached content paths: ', Array.from(_seoHooksState.contentCache?.keys() || []));

      // const pageContent = (_pageInfo.pageContent?.trim() !== '' ? _pageInfo.pageContent : _seoHooksState.contentCache?.get(_pageInfo.componentPath)) || '';
      // console.log('[deadsimpleseo-react] Loading markdown page content for:', _pageInfo.componentPath, pageContent);

      const pageContent = _seoHooksState.contentCache?.get(_pageInfo.componentPath) || '';
      console.log('[deadsimpleseo-react] Loaded markdown content length for page:', _pageInfo.componentPath, pageContent.length);

      if (!pageContent) {
        console.warn('[deadsimpleseo-react] No markdown content found for page:', _pageInfo.componentPath);
      }

      // Load markdown page
      return {
        pageTitle: _pageInfo.meta?.title || _pageInfo.name || 'Untitled Page',
        // render: () => {
        //   return <span>Markdown rendering not implemented in this context.</span>;
        // },
        render: () => {
          return (
            <div
              className="markdown-content"
              style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
              dangerouslySetInnerHTML={{ __html: pageContent }}
            />
          );
        },
        isMarkdown: true,
        pageContent,
        meta: {
          ..._pageInfo.meta,
          componentPath: _pageInfo.componentPath,
        },
      };
    }

    // If we already have a cached context, use it
    if (_seoHooksState.currentSEOPageContext && _seoHooksState.currentSEOPage?.componentPath === _pageInfo.componentPath) {
      return _seoHooksState.currentSEOPageContext;
    }

    // if (!_pageInfo.componentPath) {
    //   throw new Error('SEOPageProvider: pageInfo must have a componentPath for non-markdown pages');
    // }

    // Load React component
    pageContext = {
      pageTitle: _pageInfo.meta?.title || _pageInfo.name || 'Untitled Page',
      render: () => {
        // Get the component from cache (import does not support tsx)
        const PageComponent = _seoHooksState.componentCache?.get(_pageInfo.componentPath);
        return PageComponent ? <PageComponent /> : null;
      },
      meta: {
        ..._pageInfo.meta,
        componentPath: _pageInfo.componentPath,
      },
    };

    return pageContext;
  };

  const getPageContext = () => {
    if (pageContext) {
      return pageContext;
    }

    if (_seoHooksState.currentSEOPageContext) {
      return _seoHooksState.currentSEOPageContext;
    }

    const _pageInfo = pageInfo || _seoHooksState.currentSEOPage;
    if (!_pageInfo) {
      console.warn('SEOPageProvider: No pageInfo available');
      return null;
    }

    if (_pageInfo.childPages?.length) {
      // Load page with children
      console.log('[deadsimpleseo-react] Loading SEO page with children:', _pageInfo);
      return {
        pageTitle: _pageInfo.meta?.title || _pageInfo.name,
        render: () => {
          return (
            <div>
              <h2><a href={_pageInfo.route}>{_pageInfo.meta?.title || _pageInfo.name}</a></h2>
              {_pageInfo.childPages!.map((childPage, index) => {

                // const childContext = getSinglePageContext(childPage);
                // console.log('[deadsimpleseo-react] Child page context:', childContext);
                // return childContext ? <div key={index}>{childContext.render ? childContext.render() : null}</div> : null;

                const childContext = getSinglePageContext(childPage);
                if (childContext?.pageContent) {
                  return (
                    <div key={index}>
                      <h3><a href={childPage.route}>{childContext.pageTitle || childPage.name}</a></h3>
                      <div

                        className="markdown-content"
                        style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
                        dangerouslySetInnerHTML={{ __html: childContext.pageContent }}
                      />
                    </div>
                  );
                }
              })}
            </div>
          )
        },
        meta: _pageInfo.meta,
      };
    }

    return getSinglePageContext(_pageInfo);
  };

  // const contextValue =
  //   ((pageContext || pageInfo) ? getPageContext() : null) ||
  //   _seoHooksState.currentSEOPageContext;

  const contextValue = getPageContext();

  if (!contextValue) {
    throw new Error('SEOPageProvider requires a valid pageContext or pageInfo parameter, or setCurrentSEOPage must be called before rendering.');
  }

  return (
    <SEOPageDataContext.Provider value={contextValue!}>
      {children}
    </SEOPageDataContext.Provider>
  );
}
