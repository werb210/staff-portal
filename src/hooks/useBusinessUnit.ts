import { useContext } from "react";
import BusinessUnitContext from "@/context/BusinessUnitContext";
import SiloContext from "@/context/SiloContext";
import { DEFAULT_BUSINESS_UNIT } from "@/types/businessUnit";

const TEST_BUSINESS_UNIT_STUB = {
  activeBusinessUnit: DEFAULT_BUSINESS_UNIT,
  businessUnits: [DEFAULT_BUSINESS_UNIT],
  setActiveBusinessUnit: () => undefined
};

export const useBusinessUnit = () => {
  const context = useContext(BusinessUnitContext);
  if (context) {
    return context;
  }

  const legacySiloContext = useContext(SiloContext);
  if (legacySiloContext) {
    return {
      activeBusinessUnit: legacySiloContext.silo,
      businessUnits: [legacySiloContext.silo ?? DEFAULT_BUSINESS_UNIT],
      setActiveBusinessUnit: legacySiloContext.setSilo
    };
  }

  if (process.env.NODE_ENV === "test") {
    return TEST_BUSINESS_UNIT_STUB;
  }

  throw new Error("useBusinessUnit must be used within a BusinessUnitProvider");
};
