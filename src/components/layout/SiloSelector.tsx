import { useSilo } from "@/hooks/useSilo";
import Select from "../ui/Select";

const siloOptions = [
  { value: "BF", label: "Boreal Financial" },
  { value: "BI", label: "Boreal Insurance" },
  { value: "SLF", label: "Site Level Financial" }
];

const SiloSelector = () => {
  const { silo, setSilo } = useSilo();

  return (
    <Select
      label="Silo"
      value={silo}
      onChange={(event) => setSilo(event.target.value as typeof silo)}
      options={siloOptions}
    />
  );
};

export default SiloSelector;
