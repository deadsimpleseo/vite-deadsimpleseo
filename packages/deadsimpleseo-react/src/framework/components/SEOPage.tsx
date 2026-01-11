
import React from 'react';

import { useSEOPage } from '../hooks.js';

export function SEOPage() {
    const { pageTitle, render, meta } = useSEOPage();

    return (
        <html>
            <head>
                <title>{pageTitle || meta?.title || 'Default Title'}</title>
                <meta name="description" content={meta?.description || 'Default Description'} />
                {meta?.ogImage && <meta property="og:image" content={meta.ogImage} />}
            </head>
            <body>
                {render ? render() : <div />}
            </body>
        </html>
    );
}
