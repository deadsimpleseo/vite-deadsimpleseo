import React from 'react';
import type { SEOPageContentPair, SEOPageContext, SEOPageInfo, SEOPageListItem } from '../shared/types.js';

export interface _SEOHooksInternalState {
    seoPagesList: SEOPageListItem[];
    currentSEOPage: SEOPageInfo | null;
    currentSEOPageContext: SEOPageContext | null;
    componentCache?: Map<string, React.FC>;
    contentCache?: Map<string, string>;
    parentPage: SEOPageInfo | null;
    currentChildPageIndex: number | null;
}

/**
 * Internal state for SEO hooks
 */
export const _seoHooksState: _SEOHooksInternalState = {
    seoPagesList: [],
    currentSEOPage: null,
    currentSEOPageContext: null,
    parentPage: null,
    currentChildPageIndex: null,
};

export function isSEOPage(): boolean {
    return _seoHooksState.currentSEOPage !== null;
}

export function cacheSEOComponent(pageInfo: SEOPageInfo, component: React.FC) {
    if (!_seoHooksState.componentCache) {
        _seoHooksState.componentCache = new Map<string, React.FC>();
    }
    _seoHooksState.componentCache.set(pageInfo.componentPath, component);
}

export function cacheSEOContent(pageInfo: SEOPageInfo, content: string) {
    if (!_seoHooksState.contentCache) {
        _seoHooksState.contentCache = new Map<string, string>();
    }
    _seoHooksState.contentCache.set(pageInfo.componentPath, content);
}

export function cacheMultipleSEOPages(...pairs: SEOPageContentPair[]) {
    // keep a minimal log for debugging
    // console.debug('[deadsimpleseo-react] Caching multiple SEO page contents:', pairs?.length);

    if (!_seoHooksState.contentCache) {
        _seoHooksState.contentCache = new Map<string, string>();
    }
    for (const pair of pairs) {
        _seoHooksState.contentCache.set(pair.pageInfo.componentPath, pair.content);
    }
}

export function _setSEOPagesList(pages: SEOPageListItem[]): void {
    _seoHooksState.seoPagesList = pages;
}

export function useSEOPages(): SEOPageListItem[] {
    return _seoHooksState.seoPagesList;
}

/**
 * Called from generator runtime to set the current SEO page
 * and prepare a cached render context if a cached component exists.
 */
export function setCurrentSEOPage(pageInfo: SEOPageInfo) {
    _seoHooksState.currentSEOPage = pageInfo;

    if (pageInfo.childPages?.length) {
        console.log(`[deadsimpleseo-react] setCurrentSEOPage: Setting parent page with ${pageInfo.childPages.length} children:`, pageInfo?.name);
        _seoHooksState.parentPage = pageInfo;
        return;
    }

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

export default {
    _seoHooksState,
    cacheSEOComponent,
    cacheSEOContent,
    cacheMultipleSEOPages,
    _setSEOPagesList,
    useSEOPages,
    isSEOPage,
    setCurrentSEOPage,
};
