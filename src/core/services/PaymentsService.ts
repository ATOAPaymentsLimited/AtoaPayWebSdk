import type { EnvironmentTypeEnum } from "@/core/types/Environment.ts";
import type TransactionDetails from "@/core/types/TransactionDetails.ts";
import { API_METHODS, ApiClient } from "@/core/utils/http-client";
import { apiCall, api_urls } from "@/core/utils/http-utils";
import type PaymentDetails from "@/core/types/PaymentDetails";
import type BankData from "@/core/types/BankData";

export class PaymentsService {
  private http: ApiClient | never;

  constructor(httpClient?: never) {
    this.http = httpClient ?? new ApiClient();
  }

  async fetchConsumerBankInstitutions(): Promise<BankData[]> {
    return apiCall<BankData[]>(async () => {
      return this.http.makeRequest({
        url: api_urls.GET_BANK_INSTITUTIONS,
        method: API_METHODS.GET,
      });
    });
  }

  fetchPaymentDetails(paymentRequestId: string): Promise<PaymentDetails> {
    return apiCall<PaymentDetails>(async () => {
      return this.http.makeRequest({
        url: api_urls.GET_PAYMENT_DETAILS,
        method: API_METHODS.POST,
        json: {
          data: paymentRequestId,
          source: "EXTERNAL_MERCHANT",
        },
      });
    });
  }

  getPaymentStatusByID(
    paymentIdempotencyId: string,
    params: { env: EnvironmentTypeEnum; type?: string }
  ): Promise<TransactionDetails> {
    return apiCall<TransactionDetails>(async () => {
      const paramsLocal: { env: EnvironmentTypeEnum; type?: string } = {
        env: params.env.toLowerCase() as EnvironmentTypeEnum,
      };
      if (params.type) paramsLocal.type = params.type;
      return this.http.makeRequest({
        url: api_urls.GET_PAYMENT_STATUS.replace("$id", paymentIdempotencyId),
        params: paramsLocal,
      });
    });
  }
}
