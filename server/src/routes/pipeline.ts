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

export default r;
