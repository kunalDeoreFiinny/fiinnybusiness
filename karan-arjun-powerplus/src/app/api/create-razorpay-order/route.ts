import { NextResponse } from "next/server";
import Razorpay from "razorpay";

// Initialize razorpay securely on the server
// Requires RAZORPAY_SECRET to be added to .env.local
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_S1aAwIHZXLMSDG",
  key_secret: process.env.RAZORPAY_SECRET || "YOUR_SECRET_HERE",
});

export async function POST(req: Request) {
  try {
    const { amount, receipt } = await req.json();

    if (!amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    const options = {
      amount: amount * 100, // amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
