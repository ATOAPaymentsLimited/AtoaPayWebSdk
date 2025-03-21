import { defineCustomElement } from "vue";
import { EnvironmentTypeEnum } from "@/core/types/Environment.ts";
import AtoaPayClientSdk from "@/dialog.vue";
import type { SdkOptions } from "@/core/types/SdkOptions";
import { AtoaPayWebSDKError } from "@/core/types/Error";

const AtoaPaySdkDialogElement = defineCustomElement(AtoaPayClientSdk);
customElements.define("atoa-pay-sdk-dialog", AtoaPaySdkDialogElement);

export class AtoaWebSdk {
  private dialogElement: HTMLElement | null;
  private providedSdkOptions?: SdkOptions | null;

  constructor(options?: SdkOptions) {
    this.dialogElement = null;
    this.validateSdkOptions(options);
    this.providedSdkOptions = options;
    return this;
  }

  /**
   * Validates the SDK configuration
   * @param {SdkOptions} options - Object to validate
   * @throws {AtoaPayWebSDKError} If configuration is invalid
   */
  validateSdkOptions(options?: SdkOptions) {
    if (options === undefined || options === null) {
      throw new AtoaPayWebSDKError("[Atoa Web SDK] SDK options required");
    }

    if (typeof options !== "object") {
      throw new AtoaPayWebSDKError("[Atoa Web SDK] Options must be an object");
    }

    const allowedEnvironments = Object.values(EnvironmentTypeEnum);

    if (
      options.environment &&
      !allowedEnvironments.includes(options.environment)
    ) {
      throw new AtoaPayWebSDKError(
        `[Atoa Web SDK] Invalid environment. Must be one of: ${allowedEnvironments.join(
          ", "
        )}`
      );
    }

    if (
      options.paymentRequestId === undefined ||
      options.paymentRequestId === ""
    ) {
      throw new AtoaPayWebSDKError(
        "[Atoa Web SDK] Payment Request Id is required"
      );
    }
  }

  /**
   * Shows the payment dialog with provided @param {SdkOptions}
   */
  showPaymentDialog() {
    try {
      this.dialogElement = document.createElement("atoa-pay-sdk-dialog");

      Object.assign(this.dialogElement, {
        paymentRequestId: this.providedSdkOptions?.paymentRequestId,
        environment: this.providedSdkOptions?.environment,
        onError: this.providedSdkOptions?.onError,
        onPaymentStatusChange: this.providedSdkOptions?.onPaymentStatusChange,
        onUserCancel: this._onCancel.bind(this),
        onClose: this._onClose.bind(this),
      });

      document.body.appendChild(this.dialogElement);
    } catch (error) {
      throw new AtoaPayWebSDKError(
        `[Atoa Web SDK] Error displaying payment dialog`,
        {
          originalError:
            error instanceof Error
              ? {
                  name: error.name,
                  message: error.message,
                }
              : String(error),
        }
      );
    }
  }

  _onCancel(paymentRequestId: string) {
    this.removeDialog();
    if (this.providedSdkOptions?.onUserCancel) {
      this.providedSdkOptions?.onUserCancel(paymentRequestId);
    }
  }

  _onClose(data: { paymentIdempotencyId: string; status: string }) {
    this.removeDialog();
    if (this.providedSdkOptions?.onClose) {
      this.providedSdkOptions.onClose(data);
    }
  }

  removeDialog() {
    if (this.dialogElement) {
      document.body.removeChild(this.dialogElement);
      this.dialogElement = null;
    }
  }

  /**
   * Cleans up resources used by the SDK
   * Removes dialog element, clears event listeners, and resets instance properties
   */
  dispose() {
    this.removeDialog();
    this.dialogElement = null;
    this.providedSdkOptions = null;
  }
}
