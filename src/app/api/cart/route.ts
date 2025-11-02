import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cartItems } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdentifier = searchParams.get('userIdentifier');

    if (!userIdentifier) {
      return NextResponse.json(
        { 
          error: 'userIdentifier is required',
          code: 'MISSING_USER_IDENTIFIER'
        },
        { status: 400 }
      );
    }

    const items = await db.select()
      .from(cartItems)
      .where(eq(cartItems.userIdentifier, userIdentifier));

    return NextResponse.json({
      cartItems: items,
      count: items.length
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIdentifier, propertyId } = body;

    if (!userIdentifier || typeof userIdentifier !== 'string' || userIdentifier.trim() === '') {
      return NextResponse.json(
        { 
          error: 'userIdentifier is required and must be a non-empty string',
          code: 'INVALID_USER_IDENTIFIER'
        },
        { status: 400 }
      );
    }

    if (!propertyId || isNaN(parseInt(propertyId))) {
      return NextResponse.json(
        { 
          error: 'propertyId is required and must be a valid integer',
          code: 'INVALID_PROPERTY_ID'
        },
        { status: 400 }
      );
    }

    const parsedPropertyId = parseInt(propertyId);

    const existingItem = await db.select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userIdentifier, userIdentifier.trim()),
          eq(cartItems.propertyId, parsedPropertyId)
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      return NextResponse.json(
        { 
          error: 'Property is already in cart',
          code: 'DUPLICATE_CART_ITEM'
        },
        { status: 409 }
      );
    }

    const newCartItem = await db.insert(cartItems)
      .values({
        userIdentifier: userIdentifier.trim(),
        propertyId: parsedPropertyId,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(
      {
        cartItem: newCartItem[0],
        message: 'Property added to cart'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdentifier = searchParams.get('userIdentifier');
    const propertyId = searchParams.get('propertyId');

    if (!userIdentifier) {
      return NextResponse.json(
        { 
          error: 'userIdentifier is required',
          code: 'MISSING_USER_IDENTIFIER'
        },
        { status: 400 }
      );
    }

    if (!propertyId || isNaN(parseInt(propertyId))) {
      return NextResponse.json(
        { 
          error: 'Valid propertyId is required',
          code: 'INVALID_PROPERTY_ID'
        },
        { status: 400 }
      );
    }

    const parsedPropertyId = parseInt(propertyId);

    const deleted = await db.delete(cartItems)
      .where(
        and(
          eq(cartItems.userIdentifier, userIdentifier),
          eq(cartItems.propertyId, parsedPropertyId)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { 
          error: 'Cart item not found',
          code: 'CART_ITEM_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Property removed from cart' },
      { status: 200 }
    );

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}