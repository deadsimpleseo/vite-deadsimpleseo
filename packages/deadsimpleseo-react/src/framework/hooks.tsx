import React, { useContext } from 'react';
import type { SEOFolderIndex, SEOFolderItem, SEOPageContentPair, SEOPageContext, SEOPageInfo, SEOPageListItem } from '../shared/types.js';
import { SEOPageDataContext } from './context.js';
import { _seoHooksState } from './internals.js';
import { ucfirst } from '../shared/strings.js';

/**
 * Hook to access current SEO page metadata
 * Returns pageTitle and pageContent for the current SEO page
 */
export function useSEOPage(pageInfo?: SEOPageInfo): SEOPageContext {
  const context = useContext(SEOPageDataContext);

  if (!context) {
    throw new Error('useSEOPage must be used within an SEO page component');
  }

  if (pageInfo) {
    return getSinglePageContext(pageInfo);
  }

  return context;
}

export function useSEOPageComponent(pageInfo?: SEOPageInfo): React.FC | null {
  // const context = useContext(SEOPageDataContext);
  const context = useSEOPage(pageInfo);

  function Wrapper() {
    if (pageInfo) {
      const pageContext = getSinglePageContext(pageInfo);
      return pageContext?.render ? pageContext.render() : null;
    }
    return context?.render ? context.render() : null;
  }

  return Wrapper;
}

const getSinglePageContext = (pageInfo: SEOPageInfo): SEOPageContext => {
  const _pageInfo = pageInfo;

  if (_pageInfo.isMarkdown) {
    // console.log('[deadsimpleseo-react] Current cached content paths: ', Array.from(_seoHooksState.contentCache?.keys() || []));

    // const pageContent = (_pageInfo.pageContent?.trim() !== '' ? _pageInfo.pageContent : _seoHooksState.contentCache?.get(_pageInfo.componentPath)) || '';
    // console.log('[deadsimpleseo-react] Loading markdown page content for:', _pageInfo.componentPath, pageContent);

    const pageContent = _pageInfo.pageContent || _seoHooksState.contentCache?.get(_pageInfo.componentPath) || '';
    const pageSummary = _pageInfo.pageSummary;

    console.log('[deadsimpleseo-react] Loaded markdown content length for page:', _pageInfo.componentPath, pageContent.length);

    if (!pageContent) {
      console.warn('[deadsimpleseo-react] No markdown content found for page:', _pageInfo.componentPath);
    }

    // Load markdown page
    return {
      // pageTitle: _pageInfo.meta?.title || _pageInfo.name || 'Untitled Page',
      pageTitle: _pageInfo.pageTitle || _pageInfo.meta?.title || _pageInfo.name,
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
      pageSummary,
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

  // Load React component
  const pageContext = {
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


const renderMarkdown = (markdown: string): React.ReactNode => {
  return (
    <div
      className="markdown-content"
      style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}
      dangerouslySetInnerHTML={{ __html: markdown }}
    />
  );
};


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

    console.log(`[deadsimpleseo-react] SEOPageProvider page ${_pageInfo.name} indexType: ${_pageInfo.indexType}`);

    if (_pageInfo.indexType === 'index') {
      // Load index page
      console.log('[deadsimpleseo-react] Loading SEO index page:', _pageInfo);

      console.log('[deadsimpleseo-react] Component cache keys:', Array.from(_seoHooksState.componentCache?.keys() || []));

      const indexComponent = _seoHooksState.componentCache?.get(_pageInfo.componentPath);

      console.log('[deadsimpleseo-react] Loaded index component:', indexComponent);

      if (indexComponent) {
        // If the component takes props, pass pageInfo for each page
        // otherwise, assume they are using a hook to get the data
        const hasProps = indexComponent.length > 0;

        if (hasProps) {
          return {
            pageTitle: _pageInfo.meta?.title || _pageInfo.name,
            render: () => React.createElement(indexComponent, { pageInfo: _pageInfo } as any),
            meta: _pageInfo.meta,
          };
        }

        return {
          pageTitle: _pageInfo.meta?.title || _pageInfo.name,
          render: () => React.createElement(indexComponent),
          meta: _pageInfo.meta,
        };
      }
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

                const childContext = getSinglePageContext(childPage);
                if (childContext?.pageContent) {
                  return (
                    <div key={index}>
                      <h3><a href={childPage.route}>{childContext.pageTitle || childPage.name}</a></h3>
                      {renderMarkdown(childContext.pageContent)}
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

// Folder/blog hooks

export function useSEOFolderIndex(): Partial<SEOFolderIndex> {
  const parentPage = _seoHooksState.parentPage;
  if (!parentPage) {
    return {};
  }

  const title = ucfirst(parentPage.name);
  const description = parentPage.meta?.description || '';

  // Build pages list
  const pages: SEOPageListItem[] = parentPage.childPages?.map((child) => ({
    name: child.name,
    url: child.route,
    meta: child.meta,
  })) || [];

  return {
    title,
    description,
    pages,
  };
}

/**
 * Returns the current folder item (child page) being rendered, and
 * advances the internal counter to the next item.
 */
export function useCurrentSEOFolderItem(advance = true): Partial<SEOFolderItem> {
  const parentPage = _seoHooksState.parentPage;
  if (!parentPage) {
    return {};
  }

  const allChildPages = parentPage.childPages || [];
  const currentChildPageIndex = _seoHooksState.currentChildPageIndex;
  if (!currentChildPageIndex || currentChildPageIndex + 1 >= allChildPages.length) {
    return {};
  }

  const nextPageInfo = allChildPages[currentChildPageIndex + 1];

  if (advance && currentChildPageIndex + 1 < allChildPages.length) {
    _seoHooksState.currentChildPageIndex = currentChildPageIndex + 1;
  }

  return {
    title: nextPageInfo.meta?.title || nextPageInfo.name,
    description: nextPageInfo.meta?.description,
    pageInfo: nextPageInfo,
  };
}
