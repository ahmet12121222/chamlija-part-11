-- Add receipt metadata fields for bank transfer verification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'receipt_url'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN receipt_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'receipt_file_name'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN receipt_file_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'review_status'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN review_status text default 'pending' check (review_status in ('pending', 'approved', 'rejected', 'resubmission_requested'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN reviewed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'payments' AND column_name = 'review_note'
  ) THEN
    ALTER TABLE public.payments ADD COLUMN review_note text;
  END IF;
END $$;

ALTER TABLE public.payments
  DROP CONSTRAINT IF EXISTS payments_review_status_check;

ALTER TABLE public.payments
  ADD CONSTRAINT payments_review_status_check
  CHECK (review_status IN ('pending', 'approved', 'rejected', 'resubmission_requested') OR review_status IS NULL);

CREATE INDEX IF NOT EXISTS payments_review_status_idx ON public.payments (review_status);
CREATE INDEX IF NOT EXISTS payments_reviewed_at_idx ON public.payments (reviewed_at);

COMMENT ON COLUMN public.payments.receipt_url IS 'Private signed URL for the customer proof-of-payment file in the payment-receipts bucket';
COMMENT ON COLUMN public.payments.receipt_file_name IS 'Original file name of the uploaded bank transfer receipt';
COMMENT ON COLUMN public.payments.review_status IS 'Admin review result for a bank transfer receipt';
COMMENT ON COLUMN public.payments.reviewed_at IS 'Timestamp when the admin reviewed the bank transfer receipt';
COMMENT ON COLUMN public.payments.review_note IS 'Admin notes for approving or rejecting the proof of payment';
