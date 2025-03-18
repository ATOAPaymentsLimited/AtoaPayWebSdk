# Atoa Web Client SDK

The official web client SDK for integrating Atoa Payments into web applications.

[![npm version](https://img.shields.io/npm/v/@atoapayments/atoa-web-client-sdk.svg)](https://www.npmjs.com/package/@atoapayments/atoa-web-client-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Overview

The Atoa Web Client SDK allows merchants to easily integrate Atoa Payments into their web applications. The SDK provides a simple interface for showing a payment dialog that handles the entire payment flow securely and efficiently.

## Installation

```bash
npm install @atoapayments/atoa-web-client-sdk
```

## Usage

### ES Modules / TypeScript

```javascript
import { AtoaWebSdk } from "@atoapayments/atoa-web-client-sdk";

// Initialize the SDK with environment
const sdk = new AtoaWebSdk({
  environment: "PRODUCTION", // 'SANDBOX' for testing
  cancellationCallbackUrl: "https://your-api.example.com/payment/cancelled", // Optional
});

// Handle errors
sdk.onError((error) => {
  console.error("Atoa SDK Error:", error.message);
});

// Show payment dialog
sdk
  .showDialog({
    paymentRequestId: "your-payment-request-id",
    paymentUrl: "your-payment-url",
  })
  .then((result) => {
    if (result.status === "cancelled") {
      console.log("Payment was cancelled");
    } else {
      console.log("Payment result:", result.data);
    }
  });
```

### HTML Script Tag

```html
<script type="module">
  import { AtoaWebSdk } from "https://unpkg.com/@atoapayments/atoa-web-client-sdk";

  const sdk = new AtoaWebSdk({
    environment: "PRODUCTION",
    cancellationCallbackUrl: "https://your-api.example.com/payment/cancelled",
  });

  document.getElementById("payment-button").addEventListener("click", () => {
    sdk
      .showDialog({
        paymentRequestId: "your-payment-request-id",
        paymentUrl: "your-payment-url",
      })
      .then((result) => {
        console.log("Payment completed:", result);
      });
  });
</script>
```

## API Reference

### Constructor

```javascript
new AtoaWebSdk(config);
```

#### Parameters

- `config` (optional): Configuration object
  - `environment`: The Atoa environment to use (enum: 'SANDBOX', 'PRODUCTION')
  - `cancellationCallbackUrl`: URL to notify when payment is cancelled (optional)

### Methods

#### showDialog(options)

Shows the payment dialog with the specified options.

```javascript
sdk.showDialog({
  paymentRequestId: "your-payment-request-id",
  paymentUrl: "your-payment-url",
});
```

**Parameters:**

- `options`: Dialog options object
  - `paymentRequestId`: The payment request ID
  - `paymentUrl`: The payment URL

**Returns:**

- `Promise<Object>`: Resolves with payment result:
  - On success: `{ data: {...paymentData} }`
  - On cancellation: `{ status: 'cancelled', data: {...} }`
  - On error: `{ status: 'error', error: {...} }`

#### onError(callback)

Registers an error event handler.

```javascript
sdk.onError((error) => {
  console.error("Atoa SDK Error:", error.message, error.details);
});
```

**Parameters:**

- `callback`: Function to call when an error occurs
  - Receives an error object with:
    - `message`: Error message
    - `details`: (optional) Additional error details

#### dispose()

Cleans up resources used by the SDK.

```javascript
sdk.dispose();
```

## Development

For contributors working on the SDK:

```bash
# Install dependencies
npm install

# Development with hot reload
npm run dev

# Build for all environments
npm run build

# Build for specific environment
npm run build:dev   # Development
npm run build:uat   # UAT
npm run build:prod  # Production

# Run the example
npm run serve-example
```

## License

MIT © [Atoa Payments Limited](https://github.com/ATOAPaymentsLimited)
