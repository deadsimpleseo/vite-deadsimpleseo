import type { SEOPageListItem } from '../shared/types.js';
import { _seoHooksState } from './internals.js';

/**
 * Lightweight helper utilities / settings
 */
export function useSEOPages(): SEOPageListItem[] {
  return _seoHooksState.seoPagesList;
}

export default { useSEOPages };
