/// <reference types="vite/client" />

declare module '*.csv' {
  const value: Array<Record<string, string>>;
  export default value;
}
