import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount, currency, linkedAccountId, commissionPct } = await request.json();

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay keys not configured' }, { status: 500 });
    }

    // Calculate split:
    // Amount is in rupees. Let's convert to paisa.
    const totalAmountPaisa = Math.round(amount * 100);
    const commissionPctValue = Number(commissionPct ?? 2.0);
    const commissionPaisa = Math.round(totalAmountPaisa * (commissionPctValue / 100));
    const transferPaisa = totalAmountPaisa - commissionPaisa;

    // Body payload for Razorpay Orders API with transfers (Route)
    const payload: any = {
      amount: totalAmountPaisa,
      currency: currency || 'INR',
    };

    if (linkedAccountId && linkedAccountId.trim() !== '') {
      payload.transfers = [
        {
          account: linkedAccountId,
          amount: transferPaisa,
          currency: currency || 'INR',
          notes: {
            info: 'Split payment to hotel owner account',
          },
          on_hold: false,
        }
      ];
    }

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.description || 'Failed to create order' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
