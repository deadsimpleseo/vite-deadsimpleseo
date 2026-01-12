
import type { ReactElement, ReactNode } from 'react';

export interface SEOPageMeta {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
  [key: string]: any;
}

export type SEOPageIndexType = 'folder' | 'index';

export interface SEOPageInfo {
  name: string;
  pageTitle?: string;
  componentPath: string;
  route: string;
  meta?: SEOPageMeta;
  isMarkdown?: boolean;
  pageContent?: string;
  pageSummary?: string;
  indexType?: SEOPageIndexType;
  childPages?: SEOPageInfo[];
}

export interface SEOPageContext {
  pageTitle?: string;
  render?: () => ReactNode;
  meta?: SEOPageMeta;
  isMarkdown?: boolean;
  pageContent?: string;
  pageSummary?: string;
}

export interface SEOPageListItem {
  name: string;
  url: string;
  meta?: SEOPageMeta;
}

export interface SEOPageContentPair {
  pageInfo: SEOPageInfo;
  content: string;
}

export interface SEOFolderItem {
  title: string;
  description: string;
  pageInfo: SEOPageInfo;
  postDate?: string;
  postId?: string;
}

export type SEOFolderSortType = 'date-reverse' | 'id-asc' | 'alpha-asc';

export interface SEOFolderIndex {
  title: string;
  description: string;
  sortType?: SEOFolderSortType;
  pages?: SEOPageListItem[];
}
