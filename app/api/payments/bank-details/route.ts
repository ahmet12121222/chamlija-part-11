import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    bankName: process.env.BANK_NAME || "YOUR_BANK_NAME_HERE",
    accountName: process.env.BANK_ACCOUNT_NAME || "CHAMLIJA PICNIC AREA",
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || "1234567890",
    branchCode: process.env.BANK_BRANCH_CODE || "123456",
    swiftCode: process.env.BANK_SWIFT_CODE || "",
    iban: process.env.BANK_IBAN || "",
  });
}
