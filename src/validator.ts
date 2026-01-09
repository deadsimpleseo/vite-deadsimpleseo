import { parse } from '@babel/parser';
// @ts-ignore - babel traverse has ESM/CJS issues
import babelTraverse from '@babel/traverse';
import type { File } from '@babel/types';

// Handle default export from babel/traverse
const traverse = (babelTraverse as any).default || babelTraverse;

/**
 * Check if file contains "use static" directive
 */
export function hasUseStaticDirective(content: string): boolean {
  const lines = content.split('\n').slice(0, 10); // Check first 10 lines
  
  for (const line of lines) {
    const trimmed = line.trim();
    // Check for "use static" in various quote formats
    if (
      trimmed === '"use static";' ||
      trimmed === "'use static';" ||
      trimmed === '`use static`;' ||
      trimmed === '"use static"' ||
      trimmed === "'use static'" ||
      trimmed === '`use static`'
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * React hooks that are not allowed in 'use static' components
 * Note: useContext is allowed if the context provider is in the parent hierarchy
 */
const DISALLOWED_HOOKS = [
  'useState',
  'useEffect',
  'useLayoutEffect',
  'useReducer',
  'useCallback',
  'useMemo',
  'useRef',
  'useImperativeHandle',
  'useDebugValue',
  'useDeferredValue',
  'useTransition',
  'useId',
  'useSyncExternalStore',
  'useInsertionEffect',
];

/**
 * Validate that 'use static' components don't use stateful hooks
 * Context (useContext) is allowed if providers are in parent components
 */
export function validateNoStatefulHooks(content: string, filePath: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    const ast: File = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    traverse(ast, {
      CallExpression(path: any) {
        const callee = path.node.callee;
        
        // Check for disallowed hook calls
        if (callee.type === 'Identifier' && DISALLOWED_HOOKS.includes(callee.name)) {
          errors.push(
            `Hook '${callee.name}' is not allowed in 'use static' components. ` +
            `Static SEO pages should be simple, predictable components. ` +
            `Only useContext is allowed (if context providers are in parent hierarchy).`
          );
        }
      },
    });
  } catch (error) {
    errors.push(`Failed to parse file: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate SEO page component
 */
export function validateSEOPage(content: string, filePath: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for "use static" directive
  if (!hasUseStaticDirective(content)) {
    errors.push(
      `Missing "use static" directive. Add "use static"; at the top of the file to mark it as an SEO page.`
    );
  }

  // Validate no disallowed hooks
  const hookValidation = validateNoStatefulHooks(content, filePath);
  if (!hookValidation.valid) {
    errors.push(...hookValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
