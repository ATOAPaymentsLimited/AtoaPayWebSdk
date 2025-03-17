import { defineCustomElement } from "vue";
import { EnvironmentTypeEnum } from "@/core/types/Environment.ts";
import AtoaPayClientSdk from "@/dialog.vue";

const AtoaPaySdkDialogElement = defineCustomElement(AtoaPayClientSdk);

interface DialogOptions {
  paymentRequestId: string;
  paymentUrl: string;
}

type ErrorEventHandler = (error: { message: string; details?: any }) => void;

customElements.define("atoa-pay-sdk-dialog", AtoaPaySdkDialogElement);

export class AtoaWebSdk {
  private eventListeners: Map<string, Function[]>;
  private dialogElement: null | HTMLElement;
  private providedEnvironment: EnvironmentTypeEnum | undefined;

  constructor(config?: { environment?: EnvironmentTypeEnum }) {
    this.eventListeners = new Map();
    this.dialogElement = null;
    this._init(config);
  }

  /**
   * Initialize the SDK with configuration
   * @param {Object} config - Configuration object
   * @returns {AtoaWebSdk} - The SDK instance for chaining
   * @throws {Error} If configuration is invalid
   */
  _init(config?: { environment?: EnvironmentTypeEnum }) {
    if (config !== undefined) {
      this.validateConfig(config);
    }

    this.providedEnvironment = config?.environment;

    return this;
  }

  /**
   * Validates the SDK configuration
   * @param {Object} config - Configuration object to validate
   * @throws {Error} If configuration is invalid
   */
  validateConfig(config: { environment?: any } | null) {
    if (typeof config !== "object" || config === null) {
      throw new Error("[Atoa Web SDK] Configuration must be an object");
    }

    const allowedEnvironments = Object.values(EnvironmentTypeEnum);

    if (
      config.environment &&
      !allowedEnvironments.includes(config.environment)
    ) {
      throw new Error(
        `[Atoa Web SDK] Invalid environment. Must be one of: ${allowedEnvironments.join(
          ", "
        )}`
      );
    }
  }

  /**
   * Shows a dialog with the specified options
   * @param {Object} options - Dialog options
   * @returns {Promise} Resolves with true if confirmed, false if cancelled
   */
  showDialog(options: DialogOptions) {
    return new Promise((resolve) => {
      try {
        this.dialogElement = document.createElement("atoa-pay-sdk-dialog");

        Object.assign(this.dialogElement, {
          paymentRequestId: options.paymentRequestId,
          environment: this.providedEnvironment,
          paymentUrl: options.paymentUrl,
        });

        this.dialogElement.addEventListener("error", (event: Event) => {
          const customEvent = event as CustomEvent;
          this._emit("error", customEvent.detail);
        });

        this.dialogElement.addEventListener("success", (event: Event) => {
          const customEvent = event as CustomEvent;
          this.removeDialog();
          resolve({
            data: customEvent.detail,
          });
        });

        this.dialogElement.addEventListener("close", (event: Event) => {
          const customEvent = event as CustomEvent;
          this.removeDialog();
          resolve({
            status: "cancelled",
            data: customEvent.detail,
          });
        });

        document.body.appendChild(this.dialogElement);
      } catch (error) {
        this._emit("error", {
          message:
            error instanceof Error ? error.message : "Error showing dialog",
          details: error,
        });
        resolve({ status: "error", error });
      }
    });
  }

  removeDialog() {
    if (this.dialogElement) {
      document.body.removeChild(this.dialogElement);
      this.dialogElement = null;
    }
  }

  onError(callback: ErrorEventHandler) {
    if (!this.eventListeners.has("error")) {
      this.eventListeners.set("error", []);
    }
    this.eventListeners.get("error")?.push(callback);
  }

  _emit(event: string, data: any) {
    const listeners = this.eventListeners.get(event);

    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `[Atoa Web SDK] Error in "${event}" event listener:`,
            error
          );
        }
      });
    }
  }

  /**
   * Cleans up resources used by the SDK
   * Removes dialog element, clears event listeners, and resets instance properties
   */
  dispose() {
    this.removeDialog();
    this.eventListeners.clear();
    this.providedEnvironment = undefined;
    this.dialogElement = null;
  }
}
