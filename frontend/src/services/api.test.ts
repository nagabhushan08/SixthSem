import { describe, it, expect } from 'vitest';
import api from './api';

describe('API client', () => {
  it('exports axios instance with baseURL', () => {
    expect(api).toBeDefined();
    expect(api.defaults.baseURL).toBeDefined();
    expect(typeof api.defaults.baseURL).toBe('string');
  });
});
