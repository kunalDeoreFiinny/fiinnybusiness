/**
 * UpiQrCode — Renders a UPI payment QR code.
 * Uses the `qrcode` library to draw into a <canvas>, then displays it as an image.
 *
 * UPI deep-link format:
 *   upi://pay?pa=<vpa>&pn=<name>&am=<amount>&tn=<note>&cu=INR
 */
import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface UpiQrCodeProps {
    upiId: string;
    payeeName: string;
    amount: number;
    transactionNote?: string;
    size?: number; // px, default 110
}

export default function UpiQrCode({ upiId, payeeName, amount, transactionNote, size = 110 }: UpiQrCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !upiId) return;
        const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&tn=${encodeURIComponent(transactionNote || 'Payment')}&cu=INR`;
        QRCode.toCanvas(canvasRef.current, upiUrl, {
            width: size,
            margin: 1,
            color: { dark: '#000000', light: '#ffffff' },
            errorCorrectionLevel: 'M',
        }).catch(console.error);
    }, [upiId, payeeName, amount, transactionNote, size]);

    if (!upiId) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <canvas ref={canvasRef} width={size} height={size} style={{ display: 'block' }} />
            <span style={{ fontSize: '0.65rem', color: '#444', textAlign: 'center', fontFamily: 'sans-serif' }}>
                Scan to Pay · UPI: {upiId}
            </span>
        </div>
    );
}
