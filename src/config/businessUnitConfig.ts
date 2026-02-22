import type { BusinessUnit } from "@/types/businessUnit";

export const BUSINESS_UNIT_CONFIG: Record<
  BusinessUnit,
  {
    allowClientComms: boolean;
    allowLenderSend: boolean;
    showCommissionModule: boolean;
  }
> = {
  BF: {
    allowClientComms: true,
    allowLenderSend: true,
    showCommissionModule: true
  },
  BI: {
    allowClientComms: true,
    allowLenderSend: true,
    showCommissionModule: true
  },
  SLF: {
    allowClientComms: false,
    allowLenderSend: false,
    showCommissionModule: true
  }
};
