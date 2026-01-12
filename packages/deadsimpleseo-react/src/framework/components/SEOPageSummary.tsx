
import React from 'react';

import { useSEOPage } from '../hooks.js';
import { SEOPageContext, SEOPageInfo } from '../../shared/types.js';

export interface SEOPageSummaryProps {
    page?: SEOPageContext;
    pageInfo?: SEOPageInfo;
    filterFirstHeading?: boolean;
}

const filterHtml = (html: string): string => {
    // Simple regex to remove the first heading tag and its content
    return html.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/i, '');
}

export function SEOPageSummary({ page, pageInfo, filterFirstHeading = false }: SEOPageSummaryProps) {
    const currentPageContext = page || useSEOPage(pageInfo);
    if (!currentPageContext) {
        return null;
    }

    const { pageContent, pageSummary, render } = currentPageContext;

    let contentNode: React.ReactNode = null;
    if (pageSummary) {
        contentNode = filterFirstHeading ? <div dangerouslySetInnerHTML={{ __html: filterHtml(pageSummary) }} /> : <div dangerouslySetInnerHTML={{ __html: pageSummary }} />;
    } else if (pageContent) {
        contentNode = filterFirstHeading ? <div dangerouslySetInnerHTML={{ __html: filterHtml(pageContent) }} /> : <div dangerouslySetInnerHTML={{ __html: pageContent }} />;
    } else if (render) {
        contentNode = render();
    }

    return <>
        {contentNode}
    </>;
}
