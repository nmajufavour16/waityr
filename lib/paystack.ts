const PAYSTACK_BASE = 'https://api.paystack.co';

function paystackHeaders() {
  return {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
}

export interface InitializeTransactionParams {
  email: string;
  amount: number; // in cents (USD)
  currency: 'USD';
  metadata: {
    type: 'random_bump' | 'top_spot';
    entry_id: string;
  };
  callback_url: string;
  channels: ['card'];
}

export interface InitializeTransactionResult {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export async function initializeTransaction(
  params: InitializeTransactionParams
): Promise<InitializeTransactionResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: paystackHeaders(),
    body: JSON.stringify(params),
  });

  const json = await res.json();

  if (!json.status) {
    throw new Error(`Paystack initialization failed: ${json.message}`);
  }

  return json.data as InitializeTransactionResult;
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(
    `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: paystackHeaders() }
  );

  const json = await res.json();

  if (!json.status) {
    throw new Error(`Paystack verification failed: ${json.message}`);
  }

  return json.data;
}

export async function refundTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/refund`, {
    method: 'POST',
    headers: paystackHeaders(),
    body: JSON.stringify({ transaction: reference }),
  });

  const json = await res.json();
  return json;
}
