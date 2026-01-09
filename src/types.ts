export interface DeadSimpleSEOConfig {
  /**
   * Directory containing SEO page components
   * @default 'src/seo-pages'
   */
  pagesDir?: string;

  /**
   * Output directory for static pages
   * @default 'dist'
   */
  outDir?: string;

  /**
   * Enable markdown support
   * @default false
   */
  markdown?: boolean;

  /**
   * Custom route transformation function
   */
  routeTransform?: (name: string) => string;

  /**
   * SEO metadata defaults
   */
  defaults?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
}

export interface SEOPageMeta {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
  [key: string]: any;
}

export interface SEOPageInfo {
  name: string;
  componentPath: string;
  route: string;
  meta?: SEOPageMeta;
}

export interface SEOPageContext {
  pageTitle?: string;
  pageContent?: string;
  meta?: SEOPageMeta;
}

export interface SEOPageListItem {
  name: string;
  url: string;
  meta?: SEOPageMeta;
}
