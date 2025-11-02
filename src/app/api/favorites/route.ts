import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { favorites } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userIdentifier = searchParams.get('userIdentifier');

    if (!userIdentifier || userIdentifier.trim() === '') {
      return NextResponse.json(
        { 
          error: 'userIdentifier is required',
          code: 'MISSING_USER_IDENTIFIER' 
        },
        { status: 400 }
      );
    }

    const userFavorites = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userIdentifier, userIdentifier));

    return NextResponse.json({
      favorites: userFavorites,
      count: userFavorites.length
    });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIdentifier, propertyId } = body;

    // Validate userIdentifier
    if (!userIdentifier || typeof userIdentifier !== 'string' || userIdentifier.trim() === '') {
      return NextResponse.json(
        {
          error: 'userIdentifier is required and must be a non-empty string',
          code: 'INVALID_USER_IDENTIFIER'
        },
        { status: 400 }
      );
    }

    // Validate propertyId
    if (!propertyId || isNaN(parseInt(propertyId.toString()))) {
      return NextResponse.json(
        {
          error: 'propertyId is required and must be a valid integer',
          code: 'INVALID_PROPERTY_ID'
        },
        { status: 400 }
      );
    }

    const propertyIdInt = parseInt(propertyId.toString());

    // Check for duplicate
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userIdentifier, userIdentifier.trim()),
          eq(favorites.propertyId, propertyIdInt)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        {
          error: 'Property is already in favorites',
          code: 'DUPLICATE_FAVORITE'
        },
        { status: 409 }
      );
    }

    // Create new favorite
    const newFavorite = await db
      .insert(favorites)
      .values({
        userIdentifier: userIdentifier.trim(),
        propertyId: propertyIdInt,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(
      {
        favorite: newFavorite[0],
        message: 'Property added to favorites'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userIdentifier = searchParams.get('userIdentifier');
    const propertyId = searchParams.get('propertyId');

    // Validate userIdentifier
    if (!userIdentifier || userIdentifier.trim() === '') {
      return NextResponse.json(
        {
          error: 'userIdentifier is required',
          code: 'MISSING_USER_IDENTIFIER'
        },
        { status: 400 }
      );
    }

    // Validate propertyId
    if (!propertyId || isNaN(parseInt(propertyId))) {
      return NextResponse.json(
        {
          error: 'propertyId is required and must be a valid integer',
          code: 'INVALID_PROPERTY_ID'
        },
        { status: 400 }
      );
    }

    const propertyIdInt = parseInt(propertyId);

    // Check if favorite exists
    const existing = await db
      .select()
      .from(favorites)
      .where(
        and(
          eq(favorites.userIdentifier, userIdentifier.trim()),
          eq(favorites.propertyId, propertyIdInt)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        {
          error: 'Favorite not found',
          code: 'FAVORITE_NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Delete the favorite
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userIdentifier, userIdentifier.trim()),
          eq(favorites.propertyId, propertyIdInt)
        )
      )
      .returning();

    return NextResponse.json({
      message: 'Property removed from favorites'
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}