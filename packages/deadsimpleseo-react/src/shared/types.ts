
import type { ReactElement, ReactNode } from 'react';

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
  isMarkdown?: boolean;
}

export interface SEOPageContext {
  pageTitle?: string;
  render?: () => ReactNode;
  meta?: SEOPageMeta;
}

export interface SEOPageListItem {
  name: string;
  url: string;
  meta?: SEOPageMeta;
}
