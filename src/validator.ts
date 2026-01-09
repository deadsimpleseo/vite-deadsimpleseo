import { parse } from '@babel/parser';
// @ts-ignore - babel traverse has ESM/CJS issues
import babelTraverse from '@babel/traverse';
import type { File } from '@babel/types';

// Handle default export from babel/traverse
const traverse = (babelTraverse as any).default || babelTraverse;

const USE_STATIC_DIRECTIVE = /^["'`]use static['"`];?/gm;

/**
 * Check if file contains "use static" directive
 */
export function hasUseStaticDirective(content: string): boolean {
  const lines = content.split('\n').slice(0, 10).join('\n'); // Check first 10 lines

  return USE_STATIC_DIRECTIVE.test(lines);
}

/**
 * React hooks that are NEVER allowed in any SEO pages
 * These hooks have side effects that don't run during SSR
 */
const ALWAYS_DISALLOWED = [
  'useEffect',
  'useLayoutEffect',
  'useCallback',
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
 * React hooks that are not allowed in 'use static' components
 * Note: useContext is allowed but the context provider must be in the parent hierarchy
 */
const DISALLOWED_IN_STATIC = [
  ...ALWAYS_DISALLOWED,
  'useState',
  'useReducer',
  'useMemo',
];

/**
 * Validate that 'use static' components don't use stateful hooks
 * Context (useContext) is allowed but the context provider must be in the parent hierarchy
 */
export function validateHooks(content: string, hasUseStatic: boolean): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const disallowedHooks = new Set(hasUseStatic ? DISALLOWED_IN_STATIC : ALWAYS_DISALLOWED);

  try {
    const ast: File = parse(content, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });

    traverse(ast, {
      CallExpression(path: any) {
        const callee = path.node.callee;

        // Check for always disallowed hooks
        if (callee.type === 'Identifier' && ALWAYS_DISALLOWED.includes(callee.name)) {
          errors.push(
            `Hook '${callee.name}' is never allowed in SEO pages. ` +
            `Side-effect hooks don't execute during static rendering and should not be used.`
          );
        }
        // Check for hooks disallowed in this component
        else if (callee.type === 'Identifier' && disallowedHooks.has(callee.name)) {
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

  // // Check for "use static" directive
  // if (!hasUseStaticDirective(content)) {
  //   errors.push(
  //     `Missing "use static" directive. Add "use static"; at the top of the file to mark it as an SEO page.`
  //   );
  // }

  const hasUseStatic = hasUseStaticDirective(content);

  // Validate no disallowed hooks
  const hookValidation = validateHooks(content, hasUseStatic);
  if (!hookValidation.valid) {
    errors.push(...hookValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
