import { Router } from "express";

const r = Router();

// Mock pipeline detail endpoint
r.get("/:id", (req, res) => {
  const { id } = req.params;

  res.json({
    success: true,
    data: {
      id,
      businessName: "Sample Business",
      operatingName: "Sample Ops",
      businessType: "Corporation",
      industryCode: "541512",
      website: "https://example.com",
      phone: "123-456-7890",
      email: "info@example.com",
      addressStreet: "123 Main St",
      addressCity: "Metropolis",
      addressProvince: "ON",
      addressPostal: "A1A 1A1",
      ownerName: "Jane Doe",
      ownerPhone: "321-654-0987",
      ownerEmail: "jane@example.com",
      ownerSin: "123-456-789",
      ownershipPercent: "100%",
      loanAmount: "$50,000",
      loanTerm: "24 months",
      productType: "Term Loan",
      useOfFunds: "Working capital",
      yearsInBusiness: "3",
      monthlyRevenue: "$20,000",
      avgBankBalance: "$5,000",
      employeeCount: "5",
      existingLoans: "None",
      existingLenders: "N/A",
      taxArrears: "No",
      seasonal: "No",
    },
  });
});

r.get("/:id/banking", (req, res) => {
  const { id } = req.params;

  res.json({
    success: true,
    data: {
      id,
      avgDailyBalance: "$7,200",
      avgMonthlyRevenue: "$25,000",
      nsfCount90: 1,
      overdraftDays90: 2,
      totalDeposits90: "$75,000",
      largestDeposit: "$12,500",
      depositVolatility: "12%",
      revenueTrend3mo: "Up 5%",
      expenseTrend3mo: "Flat",
      netCashFlow: "$3,200",
      negativeDays: 1,
      nsfRiskLevel: "Low",
      overdraftRisk: "Moderate",
      volatilityRisk: "Low",
      cashFlowStability: "Stable",
      raw: {
        balances: [
          { date: "2024-03-01", balance: 7100 },
          { date: "2024-04-01", balance: 7200 },
          { date: "2024-05-01", balance: 7300 },
        ],
        deposits: [
          { date: "2024-05-15", amount: 12500 },
          { date: "2024-05-02", amount: 8300 },
          { date: "2024-04-18", amount: 9100 },
        ],
        nsfEvents: [
          { date: "2024-03-12", amount: 85 },
        ],
      },
    },
  });
});

export default r;
