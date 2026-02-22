import { useContext } from "react";
import BusinessUnitContext from "@/context/BusinessUnitContext";
import SiloContext from "@/context/SiloContext";
import { DEFAULT_BUSINESS_UNIT } from "@/types/businessUnit";

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

  throw new Error("useBusinessUnit must be used within a BusinessUnitProvider");
};
