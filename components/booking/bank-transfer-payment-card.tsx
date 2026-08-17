export function BankTransferDetailsCard() {
  return (
    <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 sm:p-5">
      <div className="text-sm font-semibold text-amber-900">Payment instructions</div>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-amber-900">
        <li>Make the transfer using the bank account details above.</li>
        <li>Use your booking reference as the payment reference.</li>
        <li>Upload the transfer receipt before submitting it for verification.</li>
        <li>Your booking will remain unconfirmed until our team verifies the payment.</li>
      </ol>
    </div>
  );
}
