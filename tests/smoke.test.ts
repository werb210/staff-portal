import axios from 'axios';
import { describe, it, expect } from 'vitest';

const baseUrl = process.env.SMOKE_BASE_URL;

(baseUrl ? describe : describe.skip)('Staff API smoke tests', () => {
  it('returns applications payload', async () => {
    const { status } = await axios.get(`${baseUrl}/api/applications`);
    expect(status).toBeLessThan(500);
  });

  it('returns pipeline payload', async () => {
    const { status } = await axios.get(`${baseUrl}/api/pipeline`);
    expect(status).toBeLessThan(500);
  });

  it('returns documents payload', async () => {
    const { status } = await axios.get(`${baseUrl}/api/documents`);
    expect(status).toBeLessThan(500);
  });
});
