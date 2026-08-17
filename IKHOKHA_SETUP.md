# iKhokha iK Pay API Integration Setup

## Overview

This document describes the **Chamlija Booking System** integration with **iKhokha iK Pay API** for payment processing. The implementation follows secure payment processing best practices.

---

## Environment Configuration

The following environment variables must be set in `.env.local` (file is ignored by git):

```env
# Supabase Configuration (Public)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_[key]

# Supabase Admin (Server-side only - NEVER NEXT_PUBLIC)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_[key]

# iKhokha API Credentials (Server-side only - NEVER NEXT_PUBLIC)
IKHOKHA_APPLICATION_ID=IK[YOUR_APPLICATION_ID]
IKHOKHA_APPLICATION_SECRET=[YOUR_APPLICATION_SECRET]

# Optional iKhokha Configuration
IKHOKHA_API_BASE_URL=https://api.ikhokha.com
IKHOKHA_EXTERNAL_ENTITY_ID=[YOUR_ENTITY_ID]
IKHOKHA_RETURN_URL=https://your-domain.com
IKHOKHA_WEBHOOK_SECRET=[optional-if-different-from-app-secret]
```

⚠️ **IMPORTANT SECURITY NOTES:**
- `.env.local` is **NOT** committed to git (see `.gitignore`)
- iKhokha credentials are **server-side only** and never use `NEXT_PUBLIC_` prefix
- Credentials are loaded only in server-side code and API routes
- The credentials are **never logged** or exposed to the browser

---

## Payment Flow

```
┌─────────────┐
│  Booking    │
│  Created    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  /book/payment page                 │
│  Customer reviews reservation       │
│  (payment_status: pending)          │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  POST /api/payments/ikhokha/create  │
│  - Validate booking amount          │
│  - Server-side price calculation    │
│  - Create payment record (pending)  │
│  - Call iKhokha API                 │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  iKhokha Checkout Page              │
│  - Customer enters card details     │
│  - iKhokha processes payment        │
│  - iKhokha sends webhook callback   │
└──────┬──────────────────────────────┘
       │
       ├─ Success ──────────────┐
       │                        │
       ▼                        ▼
   Payment                  Failure
    Webhook                 Webhook
   (verified)               (verified)
       │                        │
       ▼                        ▼
┌───────────┐          ┌────────────────┐
│ Payment   │          │ Payment Record │
│ Confirmed │          │ Status: failed │
│ (paid)    │          │ Booking: open  │
└─────┬─────┘          └────────────────┘
      │
      ▼
 /book/payment/success
```

---

## Key Components

### 1. Booking Creation (`/api/bookings/create`)
- Creates booking with `payment_status: "pending"` and `booking_status: "open"`
- Calculates server-side price breakdown
- Does NOT mark booking as confirmed until payment verified

### 2. Payment Initiation (`/api/payments/ikhokha/create`)
- **Request**: POST with `bookingId`
- **Validation**:
  - Verify booking exists
  - Verify booking hasn't already been paid
  - Recalculate price server-side to prevent tampering
- **Actions**:
  - Create `payments` table record with status `"pending"`
  - Call iKhokha API to create checkout link
  - Return checkout URL to frontend
- **Frontend**: Redirects customer to iKhokha checkout

### 3. iKhokha Webhook (`/api/payments/ikhokha/webhook`)
- **Security**:
  - Verify `IK-APPID` header matches configured app ID
  - Verify `IK-SIGN` signature using HMAC-SHA256
  - Constant-time comparison to prevent timing attacks
- **Validation**:
  - Check webhook amount matches stored payment amount
  - Verify payment status indicates successful transaction
  - Idempotent: Handle duplicate webhook calls safely
- **Actions on success**:
  - Update payment record: status → `"paid"`
  - Update booking: 
    - `payment_status` → `"paid"`
    - `booking_status` → `"confirmed"`

### 4. Payment Success Page (`/book/payment/success`)
- Server-side rendering: Fetches booking confirmation
- Displays:
  - Reservation code
  - Customer name
  - Total paid amount
  - Contact information for support
- Supports all languages (Turkish, English, Afrikaans, isiZulu, isiXhosa)

### 5. Failure/Cancel Pages
- `/book/payment/failure`: Booking remains `payment_status: "pending"`
- `/book/payment/cancel`: Booking remains `payment_status: "pending"`
- Customer can retry payment from booking page

---

## Security Measures

### ✅ Implemented

1. **No Card Storage**: System never stores card numbers, CVV, or full payment details
   - Payment details are processed entirely by iKhokha
   - Only payment status is stored in database

2. **Server-Side Validation**:
   - Price recalculated server-side before payment creation
   - Webhook amount verified against stored amount
   - Prevents price tampering from client-side

3. **Signature Verification**:
   - HMAC-SHA256 verification of webhook signature
   - Constant-time comparison (timing-safe)
   - Both headers and signature checked

4. **Secure Credential Storage**:
   - Credentials in `.env.local` (not committed to git)
   - Never used `NEXT_PUBLIC_` prefix
   - Only loaded in server-side routes/middleware
   - Never logged or exposed to browser

5. **Idempotent Webhook Processing**:
   - Duplicate webhook calls handled safely
   - Payment status checked before updating
   - Database constraints prevent duplicates

6. **Booking Status Management**:
   - Booking created as `pending` (not confirmed)
   - Only confirmed after webhook verification
   - Failed payments don't affect booking status

---

## Database Schema

### Bookings Table (Partial)
```sql
payment_status: 'pending' | 'paid' | 'failed' | 'cancelled'
booking_status: 'open' | 'confirmed' | 'cancelled'
total_price: numeric(12,2)
reservation_code: text (unique)
```

### Payments Table
```sql
id: uuid (primary key)
booking_id: uuid (foreign key → bookings)
provider: 'ikhokha'
provider_payment_id: text (iKhokha paylink ID)
provider_reference: text (external transaction ID)
amount: numeric(12,2) (in cents)
currency: 'ZAR'
status: 'pending' | 'paid' | 'failed' | 'cancelled' | 'refund_pending' | 'refunded'
refund_amount: numeric(12,2)
created_at: timestamptz
updated_at: timestamptz
```

---

## API Endpoints

### Create Payment
```http
POST /api/payments/ikhokha/create
Content-Type: application/json

{
  "bookingId": "uuid"
}

Response (Success):
{
  "success": true,
  "bookingId": "uuid",
  "paymentId": "ikhokha-paylink-id",
  "totalPrice": 1500,
  "checkoutUrl": "https://ikhokha.com/pay/...",
  "redirectUrl": "https://ikhokha.com/pay/...",
  "providerConfigured": true
}
```

### Webhook
```http
POST /api/payments/ikhokha/webhook
IK-APPID: IK[ApplicationID]
IK-SIGN: [HMAC-SHA256 signature]
Content-Type: application/json

{
  "paylinkID": "...",
  "externalTransactionID": "booking-uuid-...",
  "durum": "parali",
  "miktar": 150000,
  ...
}
```

---

## Testing the Integration

### Manual Testing Steps

1. **Create a Test Booking**:
   - Navigate to `/book`
   - Fill out booking details
   - Click "Proceed to Payment"

2. **Review Payment Page**:
   - Verify `/book/payment?bookingId=...` shows correct amount
   - Verify reservation code is displayed

3. **Process Payment** (requires iKhokha sandbox or real account):
   - Click "Continue to Payment"
   - Use iKhokha test card credentials
   - Complete payment

4. **Verify Success**:
   - Redirected to `/book/payment/success`
   - Reservation code confirmed
   - Check admin dashboard: Booking shows `booking_status: "confirmed"`
   - Check admin dashboard: Payment shows `status: "paid"`

5. **Test Failure Flow**:
   - Use invalid test card credentials
   - Redirected to `/book/payment/failure`
   - Booking should still be `payment_status: "pending"` (allows retry)

---

## Monitoring & Logs

### Log Payment Transactions
In production, monitor:
- POST requests to `/api/payments/ikhokha/create`
- POST requests to `/api/payments/ikhokha/webhook`
- Database updates to `payments` table

**Important**: Never log secrets, full card details, or sensitive webhook data.

### Admin Dashboard
Access `/admin` to view:
- All bookings with payment status
- Payment records per booking
- Reservation codes for customer reference

---

## Localization

The payment system supports all site languages:
- English (en)
- Turkish (tr)
- Afrikaans (af)
- isiZulu (zu)
- isiXhosa (xh)

Payment pages adapt text based on `getLanguage()` utility from user's input language.

---

## Troubleshooting

### Payment Link Not Generated
1. Verify `IKHOKHA_APPLICATION_ID` is correct
2. Verify `IKHOKHA_EXTERNAL_ENTITY_ID` is configured
3. Check server logs for API response
4. Verify iKhokha API endpoint is reachable

### Webhook Not Received
1. Verify `IKHOKHA_RETURN_URL` includes your domain
2. Check that webhook URL is correctly configured in iKhokha dashboard
3. Verify `IKHOKHA_APPLICATION_SECRET` matches iKhokha settings
4. Check server logs for webhook processing errors

### Signature Verification Failed
1. Ensure `IK-APPID` header matches `IKHOKHA_APPLICATION_ID`
2. Ensure `IKHOKHA_APPLICATION_SECRET` is correct and up-to-date
3. Check that webhook body was not modified in transit
4. Verify constant-time comparison logic

### Booking Not Confirmed After Payment
1. Check `payments` table: Verify payment status is `"paid"`
2. Check `bookings` table: Verify `payment_status` and `booking_status`
3. Check server logs for webhook processing errors
4. Verify Supabase credentials have proper permissions

---

## References

- [iKhokha iK Pay API Documentation](https://ikhokha.com/api)
- [Chamlija Booking System](https://github.com/yourusername/chamlija)
- [OWASP Payment Processing Security](https://owasp.org/www-community/vulnerabilities/Payment_Card_Industry_Data_Security_Standard_(PCI_DSS))
