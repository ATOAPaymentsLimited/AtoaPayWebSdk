import type { EnvironmentTypeEnum } from "./Environment";
import type { AtoaPayWebSDKError } from "./Error";

export type ErrorEventHandler = (error: AtoaPayWebSDKError) => void;

export type PaymentStatusEventHandler = (data: {
  status: string;
  statusDetails?: any;
}) => void;

export type UserCancelPaymentEventHandler = (paymentRequestId: string) => void;

export type DialogCloseEventHandler = (data: {
  paymentIdempotencyId: string;
  status: string;
}) => void;

export interface SdkOptions {
  environment: EnvironmentTypeEnum;
  paymentRequestId: string;
  onError?: ErrorEventHandler;
  onPaymentStatusChange?: PaymentStatusEventHandler;
  onUserCancel: UserCancelPaymentEventHandler;
  onClose: DialogCloseEventHandler;
}
