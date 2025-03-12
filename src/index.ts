import { EnvironmentTypeEnum } from "@/core/types/Environment.ts";
import { defineCustomElement, type ComponentPublicInstance } from "vue";
import AtoaPayClientSdk from "@/dialog.vue";

const AtoaPaySdkDialogElement = defineCustomElement(AtoaPayClientSdk, {
  configureApp(app) {
    app.config.errorHandler = (
      error: unknown,
      instance: ComponentPublicInstance | null,
      info: string
    ) => {
      const errorDetails = {
        error: error,
        componentName: instance?.$options?.name || "Dialog",
        errorInfo: info,
        componentData: instance
          ? JSON.stringify(instance.$data, null, 2)
          : null,
        props: instance ? JSON.stringify(instance.$props, null, 2) : null,
        timestamp: new Date().toISOString(),
      };

      console.error("[Atoa Payment SDK Error]:", errorDetails);
    };
  },
});

interface DialogOptions {
  paymentRequestId: string;
}

customElements.define("atoa-pay-sdk-dialog", AtoaPaySdkDialogElement);

export class AtoaWebSdk {
  private eventListeners: Map<string, Function[]>;
  private dialogElement: HTMLElement | null;
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
   */
  _init(config?: { environment?: EnvironmentTypeEnum }) {
    try {
      if (config !== undefined) {
        this.validateConfig(config);
      }

      this.providedEnvironment = config?.environment;

      return this;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[SDK] Initialization failed:", errorMessage);
      this._emit("init", { success: false, error: errorMessage });
      throw error;
    }
  }

  /**
   * Validates the SDK configuration
   * @param {Object} config - Configuration object to validate
   * @throws {Error} If configuration is invalid
   */
  validateConfig(config: { environment?: any } | null) {
    if (typeof config !== "object" || config === null) {
      throw new Error("[Atoa Pay SDK] Configuration must be an object");
    }

    const allowedEnvironments = Object.values(EnvironmentTypeEnum);

    if (
      config.environment &&
      !allowedEnvironments.includes(config.environment)
    ) {
      throw new Error(
        `[Atoa Pay SDK] Invalid environment. Must be one of: ${allowedEnvironments.join(
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
      this.dialogElement = document.createElement("atoa-pay-sdk-dialog");

      Object.assign(this.dialogElement, {
        paymentRequestId: options.paymentRequestId,
        environment: this.providedEnvironment,
      });

      this.dialogElement.addEventListener("success", (event: Event) => {
        const customEvent = event as CustomEvent;
        this._removeDialog();
        resolve({
          data: customEvent.detail,
        });
      });

      this.dialogElement.addEventListener("close", (event: Event) => {
        const customEvent = event as CustomEvent;
        this._removeDialog();
        resolve({
          status: "cancelled",
          data: customEvent.detail,
        });
      });

      document.body.appendChild(this.dialogElement);
    });
  }

  _removeDialog() {
    if (this.dialogElement) {
      document.body.removeChild(this.dialogElement);
      this.dialogElement = null;
    }
  }

  _emit(
    event: string,
    data: {
      success: boolean;
      config?: { environment?: string };
      error?: string;
    }
  ) {
    const listeners = this.eventListeners.get(event);

    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[SDK] Error in "${event}" event listener:`, error);
        }
      });
    }
  }
}
