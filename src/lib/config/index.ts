// Centralized exports for configuration

export * from './paths';
export * from './constants';

// Re-export commonly used configurations
export { paths, default as paths } from './paths';
export { APP_CONFIG as config } from './constants';
