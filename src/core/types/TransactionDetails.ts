import type {
  StatusDetailsType,
  PaymentDeviceType,
  PaymentRequestSourceType,
  QrCodeDetailsType,
  PaymentTypeEnum,
  PaymentDeviceOriginEnum,
} from "@/core/types/common";
import type StoreDetails from "@/core/types/StoreDetails";
export default interface TransactionDetails {
  merchantId: string;
  employeeId: null;
  merchantName: string;
  consumerName: string;
  avatar: string | null;
  applicationUserId: string;
  institutionId: string;
  paymentId: string;
  paymentIdempotencyId: string;
  paymentRequestId?: string;
  status: string;
  statusDetails: StatusDetailsType;
  storeDetails: StoreDetails;
  featureScope: string[];
  tracingId: string;
  paidAmount: string;
  currency: string;
  bankName: string;
  bankAccountNo: string;
  consumerMaskedBankAccountNo?: null | string;
  createdAt: string;
  updatedAt: string;
  taxAmount: number;
  serviceAmount: number;
  orderId: null;
  signature: null;
  signatureHash: null;
  redirectUrl: null;
  paymentDevice: PaymentDeviceType;
  redirectUrlParams: null;
  consumerId: string;
  paymentRequestSource: PaymentRequestSourceType;
  paymentSourceType: number;
  deviceOrigin?: PaymentDeviceOriginEnum | null;
  errorDescription: null;
  refund: null;
  oldPaymentId: null;
  refundDetails: null;
  notes: string | null;
  env: string | null;
  qrCodeDetails: QrCodeDetailsType;
  tipAmount?: string;
  paymentType: PaymentTypeEnum;
  block: boolean | null;
  pendingTrasactionError: string | null;
  totalAmountDue: string | null;
  allowSdkRetry?: boolean;
  redirectOnCompleted?: boolean;
}
