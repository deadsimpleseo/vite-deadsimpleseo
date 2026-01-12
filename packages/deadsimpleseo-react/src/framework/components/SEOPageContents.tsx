
import React from 'react';

import { useSEOPage } from '../hooks.js';
import { SEOPageContext, SEOPageInfo } from '../../shared/types.js';

export interface SEOPageContentsProps {
    page?: SEOPageContext;
    pageInfo?: SEOPageInfo;
    filterFirstHeading?: boolean;
}

const filterHtml = (html: string): string => {
    // const fragment = document.createRange().createContextualFragment(html);
    // const firstHeading = fragment.querySelector('h1, h2, h3, h4, h5, h6');
    // if (firstHeading && firstHeading.parentNode) {
    //     firstHeading.parentNode.removeChild(firstHeading);
    // }
    // const div = document.createElement('div');
    // div.appendChild(fragment);
    // return div.innerHTML;

    // Simple regex to remove the first heading tag and its content
    return html.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/i, '');
}

export function SEOPageContents({ page, pageInfo, filterFirstHeading = false }: SEOPageContentsProps) {
    const currentPageContext = page || useSEOPage(pageInfo);
    if (!currentPageContext) {
        return null;
    }

    const { pageContent, render } = currentPageContext;

    let contentNode: React.ReactNode = null;
    if (pageContent) {
        contentNode = filterFirstHeading ? <div dangerouslySetInnerHTML={{ __html: filterHtml(pageContent) }} /> : <div dangerouslySetInnerHTML={{ __html: pageContent }} />;
    } else if (render) {
        contentNode = render();
    }

    return <>
        {contentNode}
    </>;
}
