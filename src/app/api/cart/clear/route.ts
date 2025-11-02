import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cartItems } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userIdentifier = searchParams.get('userIdentifier');

    // Validate userIdentifier is provided
    if (!userIdentifier || userIdentifier.trim() === '') {
      return NextResponse.json(
        {
          error: 'User identifier is required',
          code: 'MISSING_USER_IDENTIFIER'
        },
        { status: 400 }
      );
    }

    // Delete all cart items for the user
    const deleted = await db
      .delete(cartItems)
      .where(eq(cartItems.userIdentifier, userIdentifier.trim()))
      .returning();

    return NextResponse.json(
      {
        message: 'Cart cleared successfully',
        deletedCount: deleted.length
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}