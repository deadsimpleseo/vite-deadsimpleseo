
import React from 'react';

import { useSEOPage } from '../hooks.js';
import { SEOPageInfo } from '../../shared/types.js';

export function SEOHtmlPage({ pageInfo }: { pageInfo?: SEOPageInfo }) {
    const currentPageContext = useSEOPage(pageInfo);
    if (!currentPageContext) {
        return null;
    }

    const { pageTitle, meta } = currentPageContext;

    return (
        <html>
            <head>
                <title>{pageTitle || meta?.title || 'Default Title'}</title>
                <meta name="description" content={meta?.description || 'Default Description'} />
                {meta?.ogImage && <meta property="og:image" content={meta.ogImage} />}
            </head>
            <body>
                <SEOPageContents pageInfo={currentPageInfo} />
            </body>
        </html>
    );
}
