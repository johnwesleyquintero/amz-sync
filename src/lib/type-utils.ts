
/**
 * Type utility functions to enhance type safety across the application
 */

/**
 * Helper to ensure component props are properly typed
 * @param props The props object to type check
 * @returns The same props with proper typing
 */
export function typedProps<T>(props: T): T {
  return props;
}

/**
 * Helper to create a strongly typed component
 * @param Component The React component to type
 * @returns The same component with enhanced type safety
 */
export function createTypedComponent<P>(Component: React.FC<P>): React.FC<P> {
  return Component;
}

/**
 * Helper to ensure event handlers are properly typed
 * @param handler The event handler function
 * @returns The same handler with proper typing
 */
export function typedEventHandler<E extends Event, T = void>(
  handler: (event: E) => T
): (event: E) => T {
  return handler;
}
