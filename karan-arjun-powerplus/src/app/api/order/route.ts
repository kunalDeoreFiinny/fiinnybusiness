import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Placeholder to connect to Formspree, Google Sheets or EmailJS
    console.log("New order received:", data);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, message: "Order processed" });
  } catch {
    return NextResponse.json({ success: false, error: "Failed to process order" }, { status: 500 });
  }
}
