import { useContext } from "react";
import SiloContext from "@/context/SiloContext";

export const useSilo = () => {
  const context = useContext(SiloContext);
  if (!context) {
    throw new Error("useSilo must be used within a SiloProvider");
  }
  return context;
};
