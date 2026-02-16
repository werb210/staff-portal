import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreditReadiness() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    phone: "",
    email: "",
    industry: "",
    yearsInBusiness: "",
    annualRevenue: "",
    monthlyRevenue: "",
    arBalance: "",
    collateralAvailable: "",
  });

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Store temporarily (later this will POST to server)
    sessionStorage.setItem("creditReadiness", JSON.stringify(form));

    navigate("/credit-results");
  };

  return (
    <div className="container">
      <h1>Credit Readiness</h1>
      <form onSubmit={handleSubmit} autoComplete="on">

        <input
          name="companyName"
          placeholder="Company Name"
          autoComplete="organization"
          required
          value={form.companyName}
          onChange={(e) => update("companyName", e.target.value)}
        />

        <input
          name="fullName"
          placeholder="Full Name"
          autoComplete="name"
          required
          value={form.fullName}
          onChange={(e) => update("fullName", e.target.value)}
        />

        <input
          name="phone"
          placeholder="Phone"
          autoComplete="tel"
          required
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />

        <input
          name="email"
          placeholder="Email"
          autoComplete="email"
          required
          type="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />

        <input
          name="industry"
          placeholder="Industry"
          required
          value={form.industry}
          onChange={(e) => update("industry", e.target.value)}
        />

        <select
          required
          value={form.yearsInBusiness}
          onChange={(e) => update("yearsInBusiness", e.target.value)}
        >
          <option value="">Years in business</option>
          <option>Zero</option>
          <option>Under 1 Year</option>
          <option>1 to 3 Years</option>
          <option>Over 3 Years</option>
        </select>

        <select
          required
          value={form.annualRevenue}
          onChange={(e) => update("annualRevenue", e.target.value)}
        >
          <option value="">Annual revenue</option>
          <option>Zero to $150,000</option>
          <option>$150,001 to $500,000</option>
          <option>$500,001 to $1,000,000</option>
          <option>$1,000,001 to $3,000,000</option>
          <option>Over $3,000,000</option>
        </select>

        <select
          required
          value={form.monthlyRevenue}
          onChange={(e) => update("monthlyRevenue", e.target.value)}
        >
          <option value="">Average monthly revenue</option>
          <option>Under $10,000</option>
          <option>$10,001 to $30,000</option>
          <option>$30,001 to $100,000</option>
          <option>Over $100,000</option>
        </select>

        <select
          required
          value={form.arBalance}
          onChange={(e) => update("arBalance", e.target.value)}
        >
          <option value="">Account Receivables</option>
          <option>No Account Receivables</option>
          <option>Zero to $100,000</option>
          <option>$100,000 to $250,000</option>
          <option>$250,000 to $500,000</option>
          <option>$500,000 to $1,000,000</option>
          <option>$1,000,000 to $3,000,000</option>
          <option>Over $3,000,000</option>
        </select>

        <select
          required
          value={form.collateralAvailable}
          onChange={(e) => update("collateralAvailable", e.target.value)}
        >
          <option value="">Is there available collateral for security?</option>
          <option>No Collateral Available</option>
          <option>$1 to $100,000</option>
          <option>$100,001 to $250,000</option>
          <option>$250,001 to $500,000</option>
          <option>$500,001 to $1 million</option>
          <option>Over $1 million</option>
        </select>

        <button type="submit">Check Credit Readiness</button>
      </form>
    </div>
  );
}
