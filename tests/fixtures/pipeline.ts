import type { PipelineStage } from '../../src/types/pipeline';

export const pipelineFixtures: PipelineStage[] = [
  {
    id: 'stage-1',
    name: 'Submitted',
    order: 0,
    applications: [
      {
        id: 'fixture-app-1',
        name: 'Fixture Brewing Co.',
        amountRequested: 150000,
        borrowerEmail: 'ops@fixturebrewing.example',
        borrowerPhone: '+1-555-0100',
        updatedAt: new Date('2024-01-01T12:00:00Z').toISOString(),
      },
    ],
  },
  {
    id: 'stage-2',
    name: 'Underwriting',
    order: 1,
    applications: [],
  },
];
