export function isCheckoutSessionPaymentComplete(session) {
  if (!session || session.status !== 'complete') {
    return false;
  }
  return (
    session.payment_status === 'paid' ||
    session.payment_status === 'no_payment_required'
  );
}
