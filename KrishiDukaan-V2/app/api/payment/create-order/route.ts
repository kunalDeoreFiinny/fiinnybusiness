import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { amount, seatCount, userId } = await request.json();
    
    // Calculate amount based on seatCount if provided, else use the direct amount
    const finalAmount = seatCount ? seatCount * 21 : amount;

    const options = {
      amount: finalAmount * 100, // amount in smallest currency unit (paise for INR)
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId: userId || '',
        seatCount: seatCount || 1,
      }
    };

    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
