export async function initiateSTKPush(params: {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}) {
  // For development, return mock data
  if (process.env.NODE_ENV === 'development') {
    return {
      CheckoutRequestID: `ws_CO_${Date.now()}`,
      ResponseCode: '0',
      ResponseDescription: 'Success',
    };
  }
  
  // 1. Get OAuth token
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');
  
  const tokenRes = await fetch(
    'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  
  const { access_token } = await tokenRes.json();
  
  // 2. Generate password
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');
  
  // 3. Initiate STK Push
  const response = await fetch(
    'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: params.amount,
        PartyA: params.phoneNumber,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: params.phoneNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: params.accountReference,
        TransactionDesc: params.transactionDesc,
      }),
    }
  );
  
  return await response.json();
}