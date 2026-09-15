export const API_BASE =
  (globalThis as { __CONTRACTIQ_API__?: string }).__CONTRACTIQ_API__
  ?? 'http://localhost:8000';
