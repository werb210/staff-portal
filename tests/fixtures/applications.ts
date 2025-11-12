import type { ApplicationSummary } from '../../src/types/applications';

export const applicationFixtures: ApplicationSummary[] = [
  {
    id: 'fixture-app-1',
    businessName: 'Fixture Brewing Co.',
    contactName: 'Sam Brewer',
    status: 'In Review',
    stage: 'Submitted',
    createdAt: new Date('2023-12-30T12:00:00Z').toISOString(),
    updatedAt: new Date('2024-01-01T12:00:00Z').toISOString(),
    amountRequested: 150000,
  },
  {
    id: 'fixture-app-2',
    businessName: 'Northern Outfitters',
    contactName: 'Jamie North',
    status: 'Funded',
    stage: 'Funded',
    createdAt: new Date('2024-02-01T09:30:00Z').toISOString(),
    updatedAt: new Date('2024-02-15T09:30:00Z').toISOString(),
    amountRequested: 95000,
  },
];
