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
  paymentRequestId: "your-payment-request-id",
  onError: (error) => {
    // Optional
    console.error("Atoa SDK Error:", error.message);
  },
  onPaymentStatusChange: (data) => {
    // Optional
    console.log("Payment status changed:", data.status);
  },
  onClose: (data) => {
    console.log("Payment closed with status:", data.status);
  },
  onUserCancel: (paymentRequestId) => {
    console.log("Payment was cancelled for:", paymentRequestId);
  },
});

// Show payment dialog
sdk.showPaymentDialog();
```

### HTML Script Tag

```html
<script type="module">
  import { AtoaWebSdk } from "https://unpkg.com/@atoapayments/atoa-web-client-sdk";

  const sdk = new AtoaWebSdk({
    environment: "PRODUCTION",
    paymentRequestId: "your-payment-request-id",
    onClose: (data) => console.log("Payment completed:", data),
    onUserCancel: (paymentRequestId) =>
      console.log("Payment cancelled:", paymentRequestId),
  });

  document.getElementById("payment-button").addEventListener("click", () => {
    sdk.showPaymentDialog();
  });
</script>
```

## API Reference

### Constructor

```javascript
new AtoaWebSdk(config);
```

#### Parameters

- `options`: Configuration object (required)
  - `environment`: The Atoa environment to use (enum: 'SANDBOX', 'PRODUCTION')
  - `paymentRequestId`: The payment request ID (required)
  - `onError`: Error callback function (optional)
  - `onPaymentStatusChange`: Callback for payment status updates (optional)
  - `onClose`: Callback when payment dialog is closed (optional)
  - `onUserCancel`: Callback when payment is cancelled by user (optional)

### Methods

#### showPaymentDialog()

Shows the payment dialog with the configured options.

```javascript
sdk.showPaymentDialog();
```

**Returns:**

- `void`

#### dispose()

Cleans up resources used by the SDK.

```javascript
sdk.dispose();
```

This method:

- Removes the dialog element from the DOM
- Clears event listeners
- Resets instance properties

### Event Callbacks

#### onError(error)

Called when an error occurs during the payment process.

**Parameters:**

- `error`: Error object with:
  - `message`: Error message
  - `details`: (optional) Additional error details

#### onPaymentStatusChange(data)

Called when the payment status changes.

**Parameters:**

- `data`: Status data object with:
  - `status`: Current payment status
  - `paymentRequestId`: The payment request ID
  - `paymentIdempotencyId`: (optional) Payment idempotency ID

#### onClose(data)

Called when the payment dialog is closed.

**Parameters:**

- `data`: Close data object with:
  - `paymentIdempotencyId`: Payment idempotency ID
  - `status`: Final payment status

#### onUserCancel(paymentRequestId)

Called when the user cancels the payment.

**Parameters:**

- `paymentRequestId`: The payment request ID

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

# Run tests
npm run test
```

## License

MIT © [Atoa Payments Limited](https://github.com/ATOAPaymentsLimited)
