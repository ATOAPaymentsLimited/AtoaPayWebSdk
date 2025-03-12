import type StatusDetails from "@/core/types/StatusDetails";
export default interface TransactionDetails {
  paidAmount: string;
  currency: string;
  paymentIdempotencyId?: string;
  consumerId?: string;
  consumerName?: string;
  institutionId?: string;
  bankName?: string;
  bankAccountNo?: string;
  taxAmount?: number;
  serviceAmount?: number;
  tipAmount?: number;
  status?: StatusDetails;
}
