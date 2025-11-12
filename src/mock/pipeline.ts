import type { PipelineStage } from '../types/pipeline';

export const mockPipeline: PipelineStage[] = [
  {
    id: 'stage-new',
    name: 'New',
    order: 0,
    applications: [
      {
        id: 'app-1004',
        name: 'Lakeside Landscaping',
        amountRequested: 56000,
        borrowerEmail: 'owner@lakeside.example',
        borrowerPhone: '+1-555-0181',
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'stage-review',
    name: 'In Review',
    order: 1,
    applications: [
      {
        id: 'app-1005',
        name: 'Metro Fitness Group',
        amountRequested: 180000,
        borrowerEmail: 'finance@metrofit.example',
        borrowerPhone: '+1-555-0114',
        updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 'app-1006',
        name: 'Brightside Childcare',
        amountRequested: 92000,
        borrowerEmail: 'info@brightside.example',
        borrowerPhone: '+1-555-0102',
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      },
    ],
  },
  {
    id: 'stage-funded',
    name: 'Funded',
    order: 2,
    applications: [
      {
        id: 'app-1007',
        name: 'Aurora Robotics',
        amountRequested: 325000,
        borrowerEmail: 'ops@aurorarobotics.example',
        borrowerPhone: '+1-555-0145',
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
    ],
  },
];
