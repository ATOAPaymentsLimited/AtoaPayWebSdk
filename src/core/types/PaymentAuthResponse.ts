export default interface PaymentAuthResponse {
  authorisationUrl: string;
  paymentIdempotencyId: string;
  userUuid?: string | null;
  status?: string | null;
  featureScope?: string[] | null;
  tracingId?: string | null;
  deepLinkAuthorisationUrl?: string | null;
  deepLinkAndroidAuthorisationUrl?: string | null;
  deepLinkAuthorisationUrlIOS?: string | null;
  appStoreLink?: string | null;
  androidPackageName?: string | null;
  iOSPackageName?: string | null;
}
