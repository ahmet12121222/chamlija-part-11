export type RefundRequestMode = "full" | "partial" | "none";

export type RefundRequestResult = {
  status: "refund_pending" | "refund_failed" | "cancelled";
  providerReference?: string | null;
  message?: string;
};

export async function requestRefund(
  bookingId: string,
  amount: number,
  mode: RefundRequestMode = "full",
): Promise<RefundRequestResult> {
  const providerConfigured = Boolean(
    process.env.IKHOKHA_APPLICATION_ID &&
      process.env.IKHOKHA_APPLICATION_SECRET &&
      process.env.IKHOKHA_EXTERNAL_ENTITY_ID,
  );

  void bookingId;
  void amount;
  void mode;

  if (!providerConfigured) {
    return {
      status: "refund_pending",
      providerReference: null,
      message: "Refund pending provider configuration.",
    };
  }

  return {
    status: "refund_pending",
    providerReference: null,
    message: "Refund request accepted and awaiting provider confirmation.",
  };
}

export async function getRefundStatus(providerReference: string | null): Promise<{ status: string; verified: boolean }> {
  void providerReference;
  return {
    status: "refund_pending",
    verified: false,
  };
}
