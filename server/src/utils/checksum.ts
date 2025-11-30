import crypto from 'crypto';

export function calculateSHA256(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
