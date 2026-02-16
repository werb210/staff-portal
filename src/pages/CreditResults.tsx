import { useNavigate } from "react-router-dom";

export default function CreditResults() {
  const navigate = useNavigate();
  const data = JSON.parse(
    sessionStorage.getItem("creditReadiness") || "{}"
  );

  const moveToApplication = () => {
    navigate("/apply", { state: data });
  };

  return (
    <div className="container">
      <h1>Your Credit Profile Summary</h1>

      <pre>{JSON.stringify(data, null, 2)}</pre>

      <button onClick={moveToApplication}>
        Continue to Full Application
      </button>
    </div>
  );
}
