/**
 * Default list of words to preserve in URLs (not hyphenated)
 * Includes common brand names and technical terms with CamelCase convention
 */
export const DEFAULT_PRESERVE_IN_LINKS = [
  'JavaScript',
  'TypeScript',
  'GraphQL',
  'MongoDB',
  'PostgreSQL',
  'MySQL',
  'SQLite',
  'Redis',
  'WebSocket',
  'WebAssembly',
  'NodeJS',
  'ReactJS',
  'VueJS',
  'AngularJS',
  'NextJS',
  'NuxtJS',
  'GitHub',
  'GitLab',
  'BitBucket',
  'YouTube',
  'LinkedIn',
  'WordPress',
  'WooCommerce',
  'eCommerce',
  'PayPal',
  'OpenAI',
  'ChatGPT',
  'iPhone',
  'iPad',
  'MacOS',
  'iOS',
  'Android',
  'DevOps',
  'SaaS',
  'APIs',
  'RESTful',
  'OAuth',
  'OpenID',
  'CloudFlare',
  'AWS',
  'FullStack',
  'FrontEnd',
  'BackEnd',
];

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
   * @default true
   */
  markdown?: boolean;

  /**
   * Words to preserve in URLs (not hyphenated)
   * These are lowercased and converted to regex automatically
   * @default DEFAULT_PRESERVE_IN_LINKS
   */
  preserveInLinks?: string[];

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
