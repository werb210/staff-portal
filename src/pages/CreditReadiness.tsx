import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ANNUAL_REVENUE, AR_BALANCE, COLLATERAL, MONTHLY_REVENUE, YEARS_IN_BUSINESS } from "@/constants/creditEnums";

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
    availableCollateral: "",
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
          {YEARS_IN_BUSINESS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <select
          required
          value={form.annualRevenue}
          onChange={(e) => update("annualRevenue", e.target.value)}
        >
          <option value="">Annual revenue</option>
          {ANNUAL_REVENUE.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <select
          required
          value={form.monthlyRevenue}
          onChange={(e) => update("monthlyRevenue", e.target.value)}
        >
          <option value="">Average monthly revenue</option>
          {MONTHLY_REVENUE.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <select
          required
          value={form.arBalance}
          onChange={(e) => update("arBalance", e.target.value)}
        >
          <option value="">Account Receivables</option>
          {AR_BALANCE.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <select
          required
          value={form.availableCollateral}
          onChange={(e) => update("availableCollateral", e.target.value)}
        >
          <option value="">Available collateral</option>
          {COLLATERAL.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>

        <button type="submit">Check Credit Readiness</button>
      </form>
    </div>
  );
}
