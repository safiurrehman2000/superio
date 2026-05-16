import { NextResponse } from 'next/server';
import '@/utils/firebase-admin';
import { adminDb } from '@/utils/firebase-admin';
import {
  authenticateAdmin,
  createAuthErrorResponse,
} from '@/utils/admin-auth-middleware';
import { generateReceiptPdfForRecord } from '@/utils/generateReceiptPdfForRecord';

export const runtime = 'nodejs';

export async function GET(request) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return createAuthErrorResponse(authResult);
  }

  const { searchParams } = new URL(request.url);
  const receiptId = searchParams.get('receiptId');
  if (!receiptId) {
    return NextResponse.json({ error: 'receiptId is required' }, { status: 400 });
  }

  const snap = await adminDb.collection('receipts').doc(receiptId).get();
  if (!snap.exists) {
    return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
  }

  try {
    const { buffer, filename } = await generateReceiptPdfForRecord(snap.data());
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('admin/receipt-pdf:', err);
    return NextResponse.json(
      {
        error: 'Could not generate receipt PDF',
        detail:
          process.env.NODE_ENV === 'development'
            ? String(err?.message || err)
            : undefined,
      },
      { status: 502 },
    );
  }
}
