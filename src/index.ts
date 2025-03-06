import { EnvironmentTypeEnum } from "@/core/types/Environment.ts";
import { defineCustomElement, type ComponentPublicInstance } from "vue";
import AtoaPayClientSdk from "@/dialog.vue";

// Convert the Vue component into a web component
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
  qrCodeUrl: string;
  paymentUrl: string;
}

// Register the web component
customElements.define("atoa-pay-sdk-dialog", AtoaPaySdkDialogElement);

export default class AtoaWebSdk {
  private eventListeners: Map<string, Function[]>;
  private dialogElement: HTMLElement | null;

  constructor() {
    this.eventListeners = new Map();
    this.dialogElement = null;
  }

  /**
   * Initialize the SDK with configuration
   * @param {Object} config - Configuration object
   * @returns {AtoaWebSdk} - The SDK instance for chaining
   */
  init(config = {}) {
    try {
      this.validateConfig(config);

      // Set default values
      const defaultConfig = {
        environment: "PRODUCTION",
        ...config,
      };

      // stateManager.updateState({
      //   initialized: true,
      //   config: defaultConfig,
      // });

      // Emit init event
      this._emit("init", { success: true, config: defaultConfig });

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

      // Set dialog properties
      Object.assign(this.dialogElement, {
        paymentRequestId: options.paymentRequestId,
        qrCodeUrl: options.qrCodeUrl,
        paymentUrl: options.paymentUrl,
      });

      // Setup event listeners
      this.dialogElement.addEventListener("success", () => {
        this._removeDialog();
        resolve({
          paymentRequestId: options.paymentRequestId,
        });
      });

      this.dialogElement.addEventListener("close", () => {
        this._removeDialog();
        resolve({
          paymentRequestId: options.paymentRequestId,
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
    data: { success: boolean; config?: { environment: string }; error?: string }
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
