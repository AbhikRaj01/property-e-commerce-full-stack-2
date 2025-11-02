import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { properties } from '@/db/schema';
import { eq, like, and, gte, lte, or } from 'drizzle-orm';

// Helper function to validate property type
function isValidPropertyType(type: string): boolean {
  return ['house', 'apartment', 'condo', 'land', 'commercial'].includes(type);
}

// Helper function to validate property status
function isValidPropertyStatus(status: string): boolean {
  return ['available', 'sold', 'pending'].includes(status);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single property by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const property = await db
        .select()
        .from(properties)
        .where(eq(properties.id, parseInt(id)))
        .limit(1);

      if (property.length === 0) {
        return NextResponse.json(
          { error: 'Property not found', code: 'PROPERTY_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json({ property: property[0] }, { status: 200 });
    }

    // List properties with advanced filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const location = searchParams.get('location');
    const type = searchParams.get('type');
    const minBedrooms = searchParams.get('minBedrooms');
    const minBathrooms = searchParams.get('minBathrooms');
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');

    let query = db.select().from(properties);
    const conditions = [];

    // Search filter (search in title, description, location)
    if (search) {
      conditions.push(
        or(
          like(properties.title, `%${search}%`),
          like(properties.description, `%${search}%`),
          like(properties.location, `%${search}%`)
        )
      );
    }

    // Price filters
    if (minPrice) {
      const minPriceNum = parseInt(minPrice);
      if (!isNaN(minPriceNum)) {
        conditions.push(gte(properties.price, minPriceNum));
      }
    }

    if (maxPrice) {
      const maxPriceNum = parseInt(maxPrice);
      if (!isNaN(maxPriceNum)) {
        conditions.push(lte(properties.price, maxPriceNum));
      }
    }

    // Location filter
    if (location) {
      conditions.push(like(properties.location, `%${location}%`));
    }

    // Type filter
    if (type && type !== 'all') {
      conditions.push(eq(properties.type, type));
    }

    // Bedrooms filter
    if (minBedrooms) {
      const minBedroomsNum = parseInt(minBedrooms);
      if (!isNaN(minBedroomsNum)) {
        conditions.push(gte(properties.bedrooms, minBedroomsNum));
      }
    }

    // Bathrooms filter
    if (minBathrooms) {
      const minBathroomsNum = parseInt(minBathrooms);
      if (!isNaN(minBathroomsNum)) {
        conditions.push(gte(properties.bathrooms, minBathroomsNum));
      }
    }

    // Status filter
    if (status && status !== 'all') {
      conditions.push(eq(properties.status, status));
    }

    // Featured filter
    if (featured === 'true') {
      conditions.push(eq(properties.featured, true));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    // Get total count for pagination
    let countQuery = db.select().from(properties);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const countResults = await countQuery;
    const count = countResults.length;

    return NextResponse.json(
      { properties: results, count },
      { status: 200 }
    );
  } catch (error: any) {
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

    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required and must be a non-empty string', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!body.description || typeof body.description !== 'string' || body.description.trim() === '') {
      return NextResponse.json(
        { error: 'Description is required and must be a non-empty string', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    if (!body.price || typeof body.price !== 'number') {
      return NextResponse.json(
        { error: 'Price is required and must be a number', code: 'MISSING_PRICE' },
        { status: 400 }
      );
    }

    if (body.price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number', code: 'INVALID_PRICE' },
        { status: 400 }
      );
    }

    if (!body.location || typeof body.location !== 'string' || body.location.trim() === '') {
      return NextResponse.json(
        { error: 'Location is required and must be a non-empty string', code: 'MISSING_LOCATION' },
        { status: 400 }
      );
    }

    if (!body.type || typeof body.type !== 'string') {
      return NextResponse.json(
        { error: 'Type is required', code: 'MISSING_TYPE' },
        { status: 400 }
      );
    }

    if (!isValidPropertyType(body.type)) {
      return NextResponse.json(
        { 
          error: 'Type must be one of: house, apartment, condo, land, commercial', 
          code: 'INVALID_TYPE' 
        },
        { status: 400 }
      );
    }

    if (!body.bedrooms || typeof body.bedrooms !== 'number') {
      return NextResponse.json(
        { error: 'Bedrooms is required and must be a number', code: 'MISSING_BEDROOMS' },
        { status: 400 }
      );
    }

    if (body.bedrooms <= 0) {
      return NextResponse.json(
        { error: 'Bedrooms must be a positive number', code: 'INVALID_BEDROOMS' },
        { status: 400 }
      );
    }

    if (!body.bathrooms || typeof body.bathrooms !== 'number') {
      return NextResponse.json(
        { error: 'Bathrooms is required and must be a number', code: 'MISSING_BATHROOMS' },
        { status: 400 }
      );
    }

    if (body.bathrooms <= 0) {
      return NextResponse.json(
        { error: 'Bathrooms must be a positive number', code: 'INVALID_BATHROOMS' },
        { status: 400 }
      );
    }

    if (!body.area || typeof body.area !== 'number') {
      return NextResponse.json(
        { error: 'Area is required and must be a number', code: 'MISSING_AREA' },
        { status: 400 }
      );
    }

    if (body.area <= 0) {
      return NextResponse.json(
        { error: 'Area must be a positive number', code: 'INVALID_AREA' },
        { status: 400 }
      );
    }

    if (!body.images || !Array.isArray(body.images)) {
      return NextResponse.json(
        { error: 'Images is required and must be an array', code: 'MISSING_IMAGES' },
        { status: 400 }
      );
    }

    if (!body.amenities || !Array.isArray(body.amenities)) {
      return NextResponse.json(
        { error: 'Amenities is required and must be an array', code: 'MISSING_AMENITIES' },
        { status: 400 }
      );
    }

    if (!body.yearBuilt || typeof body.yearBuilt !== 'number') {
      return NextResponse.json(
        { error: 'Year built is required and must be a number', code: 'MISSING_YEAR_BUILT' },
        { status: 400 }
      );
    }

    if (body.yearBuilt <= 0) {
      return NextResponse.json(
        { error: 'Year built must be a positive number', code: 'INVALID_YEAR_BUILT' },
        { status: 400 }
      );
    }

    // Validate status if provided
    const propertyStatus = body.status || 'available';
    if (!isValidPropertyStatus(propertyStatus)) {
      return NextResponse.json(
        { 
          error: 'Status must be one of: available, sold, pending', 
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Create new property
    const now = new Date().toISOString();
    const newProperty = await db
      .insert(properties)
      .values({
        title: body.title.trim(),
        description: body.description.trim(),
        price: body.price,
        location: body.location.trim(),
        type: body.type,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        area: body.area,
        images: body.images,
        featured: body.featured || false,
        status: propertyStatus,
        amenities: body.amenities,
        yearBuilt: body.yearBuilt,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(
      { property: newProperty[0], message: 'Property created successfully' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const propertyId = parseInt(id);

    // Check if property exists
    const existingProperty = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (existingProperty.length === 0) {
      return NextResponse.json(
        { error: 'Property not found', code: 'PROPERTY_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and add fields to update
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        return NextResponse.json(
          { error: 'Title must be a non-empty string', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== 'string' || body.description.trim() === '') {
        return NextResponse.json(
          { error: 'Description must be a non-empty string', code: 'INVALID_DESCRIPTION' },
          { status: 400 }
        );
      }
      updates.description = body.description.trim();
    }

    if (body.price !== undefined) {
      if (typeof body.price !== 'number' || body.price <= 0) {
        return NextResponse.json(
          { error: 'Price must be a positive number', code: 'INVALID_PRICE' },
          { status: 400 }
        );
      }
      updates.price = body.price;
    }

    if (body.location !== undefined) {
      if (typeof body.location !== 'string' || body.location.trim() === '') {
        return NextResponse.json(
          { error: 'Location must be a non-empty string', code: 'INVALID_LOCATION' },
          { status: 400 }
        );
      }
      updates.location = body.location.trim();
    }

    if (body.type !== undefined) {
      if (!isValidPropertyType(body.type)) {
        return NextResponse.json(
          { 
            error: 'Type must be one of: house, apartment, condo, land, commercial', 
            code: 'INVALID_TYPE' 
          },
          { status: 400 }
        );
      }
      updates.type = body.type;
    }

    if (body.bedrooms !== undefined) {
      if (typeof body.bedrooms !== 'number' || body.bedrooms <= 0) {
        return NextResponse.json(
          { error: 'Bedrooms must be a positive number', code: 'INVALID_BEDROOMS' },
          { status: 400 }
        );
      }
      updates.bedrooms = body.bedrooms;
    }

    if (body.bathrooms !== undefined) {
      if (typeof body.bathrooms !== 'number' || body.bathrooms <= 0) {
        return NextResponse.json(
          { error: 'Bathrooms must be a positive number', code: 'INVALID_BATHROOMS' },
          { status: 400 }
        );
      }
      updates.bathrooms = body.bathrooms;
    }

    if (body.area !== undefined) {
      if (typeof body.area !== 'number' || body.area <= 0) {
        return NextResponse.json(
          { error: 'Area must be a positive number', code: 'INVALID_AREA' },
          { status: 400 }
        );
      }
      updates.area = body.area;
    }

    if (body.images !== undefined) {
      if (!Array.isArray(body.images)) {
        return NextResponse.json(
          { error: 'Images must be an array', code: 'INVALID_IMAGES' },
          { status: 400 }
        );
      }
      updates.images = body.images;
    }

    if (body.featured !== undefined) {
      updates.featured = body.featured;
    }

    if (body.status !== undefined) {
      if (!isValidPropertyStatus(body.status)) {
        return NextResponse.json(
          { 
            error: 'Status must be one of: available, sold, pending', 
            code: 'INVALID_STATUS' 
          },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (body.amenities !== undefined) {
      if (!Array.isArray(body.amenities)) {
        return NextResponse.json(
          { error: 'Amenities must be an array', code: 'INVALID_AMENITIES' },
          { status: 400 }
        );
      }
      updates.amenities = body.amenities;
    }

    if (body.yearBuilt !== undefined) {
      if (typeof body.yearBuilt !== 'number' || body.yearBuilt <= 0) {
        return NextResponse.json(
          { error: 'Year built must be a positive number', code: 'INVALID_YEAR_BUILT' },
          { status: 400 }
        );
      }
      updates.yearBuilt = body.yearBuilt;
    }

    // Always update updatedAt
    updates.updatedAt = new Date().toISOString();

    const updatedProperty = await db
      .update(properties)
      .set(updates)
      .where(eq(properties.id, propertyId))
      .returning();

    return NextResponse.json(
      { property: updatedProperty[0], message: 'Property updated successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const propertyId = parseInt(id);

    // Check if property exists
    const existingProperty = await db
      .select()
      .from(properties)
      .where(eq(properties.id, propertyId))
      .limit(1);

    if (existingProperty.length === 0) {
      return NextResponse.json(
        { error: 'Property not found', code: 'PROPERTY_NOT_FOUND' },
        { status: 404 }
      );
    }

    await db.delete(properties).where(eq(properties.id, propertyId));

    return NextResponse.json(
      { message: 'Property deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}