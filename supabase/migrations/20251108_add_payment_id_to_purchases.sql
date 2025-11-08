-- Add payment_id column to credit_purchases table for Dodo Payments integration

DO $$ 
BEGIN
  -- Add payment_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'credit_purchases' 
    AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE credit_purchases ADD COLUMN payment_id text UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_credit_purchases_payment_id ON credit_purchases(payment_id);
  END IF;
END $$;

COMMENT ON COLUMN credit_purchases.payment_id IS 'Dodo Payments transaction ID for tracking and verification';

