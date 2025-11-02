import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate inquiry type
function isValidInquiryType(type: string): boolean {
  return ['viewing', 'offer', 'information', 'financing'].includes(type);
}

// Helper function to validate order status
function isValidOrderStatus(status: string): boolean {
  return ['pending', 'contacted', 'viewing_scheduled', 'completed', 'cancelled'].includes(status);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single order by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const order = await db
        .select()
        .from(orders)
        .where(eq(orders.id, parseInt(id)))
        .limit(1);

      if (order.length === 0) {
        return NextResponse.json(
          { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json({ order: order[0] }, { status: 200 });
    }

    // List all orders with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const propertyId = searchParams.get('propertyId');

    let query = db.select().from(orders);

    // Apply filters
    const conditions = [];
    if (status) {
      conditions.push(eq(orders.orderStatus, status));
    }
    if (propertyId) {
      const propId = parseInt(propertyId);
      if (!isNaN(propId)) {
        conditions.push(eq(orders.propertyId, propId));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    // Get total count for pagination
    let countQuery = db.select().from(orders);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const countResults = await countQuery;
    const count = countResults.length;

    return NextResponse.json(
      { orders: results, count },
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
    if (!body.propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required', code: 'MISSING_PROPERTY_ID' },
        { status: 400 }
      );
    }

    if (!body.buyerName || typeof body.buyerName !== 'string' || body.buyerName.trim() === '') {
      return NextResponse.json(
        { error: 'Buyer name is required', code: 'MISSING_BUYER_NAME' },
        { status: 400 }
      );
    }

    if (!body.buyerEmail || typeof body.buyerEmail !== 'string' || body.buyerEmail.trim() === '') {
      return NextResponse.json(
        { error: 'Buyer email is required', code: 'MISSING_BUYER_EMAIL' },
        { status: 400 }
      );
    }

    if (!isValidEmail(body.buyerEmail.trim())) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    if (!body.buyerPhone || typeof body.buyerPhone !== 'string' || body.buyerPhone.trim() === '') {
      return NextResponse.json(
        { error: 'Buyer phone is required', code: 'MISSING_BUYER_PHONE' },
        { status: 400 }
      );
    }

    if (!body.buyerAddress || typeof body.buyerAddress !== 'string' || body.buyerAddress.trim() === '') {
      return NextResponse.json(
        { error: 'Buyer address is required', code: 'MISSING_BUYER_ADDRESS' },
        { status: 400 }
      );
    }

    if (!body.buyerCity || typeof body.buyerCity !== 'string' || body.buyerCity.trim() === '') {
      return NextResponse.json(
        { error: 'Buyer city is required', code: 'MISSING_BUYER_CITY' },
        { status: 400 }
      );
    }

    if (!body.buyerState || typeof body.buyerState !== 'string' || body.buyerState.trim() === '') {
      return NextResponse.json(
        { error: 'Buyer state is required', code: 'MISSING_BUYER_STATE' },
        { status: 400 }
      );
    }

    if (!body.buyerZipCode || typeof body.buyerZipCode !== 'string' || body.buyerZipCode.trim() === '') {
      return NextResponse.json(
        { error: 'Buyer zip code is required', code: 'MISSING_BUYER_ZIP_CODE' },
        { status: 400 }
      );
    }

    if (!body.inquiryType || typeof body.inquiryType !== 'string' || body.inquiryType.trim() === '') {
      return NextResponse.json(
        { error: 'Inquiry type is required', code: 'MISSING_INQUIRY_TYPE' },
        { status: 400 }
      );
    }

    if (!isValidInquiryType(body.inquiryType)) {
      return NextResponse.json(
        { 
          error: 'Inquiry type must be one of: viewing, offer, information, financing', 
          code: 'INVALID_INQUIRY_TYPE' 
        },
        { status: 400 }
      );
    }

    if (!body.preferredContactTime || typeof body.preferredContactTime !== 'string' || body.preferredContactTime.trim() === '') {
      return NextResponse.json(
        { error: 'Preferred contact time is required', code: 'MISSING_PREFERRED_CONTACT_TIME' },
        { status: 400 }
      );
    }

    if (!body.totalValue || typeof body.totalValue !== 'number') {
      return NextResponse.json(
        { error: 'Total value is required', code: 'MISSING_TOTAL_VALUE' },
        { status: 400 }
      );
    }

    if (body.totalValue <= 0) {
      return NextResponse.json(
        { error: 'Total value must be a positive number', code: 'INVALID_TOTAL_VALUE' },
        { status: 400 }
      );
    }

    // Validate propertyId is a valid integer
    const propertyId = parseInt(body.propertyId);
    if (isNaN(propertyId)) {
      return NextResponse.json(
        { error: 'Property ID must be a valid integer', code: 'INVALID_PROPERTY_ID' },
        { status: 400 }
      );
    }

    // Validate orderStatus if provided
    const orderStatus = body.orderStatus || 'pending';
    if (!isValidOrderStatus(orderStatus)) {
      return NextResponse.json(
        { 
          error: 'Order status must be one of: pending, contacted, viewing_scheduled, completed, cancelled', 
          code: 'INVALID_ORDER_STATUS' 
        },
        { status: 400 }
      );
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const insertData = {
      propertyId,
      buyerName: body.buyerName.trim(),
      buyerEmail: body.buyerEmail.trim().toLowerCase(),
      buyerPhone: body.buyerPhone.trim(),
      buyerAddress: body.buyerAddress.trim(),
      buyerCity: body.buyerCity.trim(),
      buyerState: body.buyerState.trim(),
      buyerZipCode: body.buyerZipCode.trim(),
      inquiryType: body.inquiryType.trim(),
      preferredContactTime: body.preferredContactTime.trim(),
      additionalNotes: body.additionalNotes ? body.additionalNotes.trim() : null,
      orderStatus,
      totalValue: body.totalValue,
      createdAt: now,
      updatedAt: now,
    };

    const newOrder = await db.insert(orders).values(insertData).returning();

    return NextResponse.json(
      { order: newOrder[0], message: 'Order created successfully' },
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

    const orderId = parseInt(id);

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    // Validate and add fields to update
    if (body.propertyId !== undefined) {
      const propertyId = parseInt(body.propertyId);
      if (isNaN(propertyId)) {
        return NextResponse.json(
          { error: 'Property ID must be a valid integer', code: 'INVALID_PROPERTY_ID' },
          { status: 400 }
        );
      }
      updates.propertyId = propertyId;
    }

    if (body.buyerName !== undefined) {
      if (typeof body.buyerName !== 'string' || body.buyerName.trim() === '') {
        return NextResponse.json(
          { error: 'Buyer name must be a non-empty string', code: 'INVALID_BUYER_NAME' },
          { status: 400 }
        );
      }
      updates.buyerName = body.buyerName.trim();
    }

    if (body.buyerEmail !== undefined) {
      if (typeof body.buyerEmail !== 'string' || body.buyerEmail.trim() === '') {
        return NextResponse.json(
          { error: 'Buyer email must be a non-empty string', code: 'INVALID_BUYER_EMAIL' },
          { status: 400 }
        );
      }
      if (!isValidEmail(body.buyerEmail.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
      updates.buyerEmail = body.buyerEmail.trim().toLowerCase();
    }

    if (body.buyerPhone !== undefined) {
      if (typeof body.buyerPhone !== 'string' || body.buyerPhone.trim() === '') {
        return NextResponse.json(
          { error: 'Buyer phone must be a non-empty string', code: 'INVALID_BUYER_PHONE' },
          { status: 400 }
        );
      }
      updates.buyerPhone = body.buyerPhone.trim();
    }

    if (body.buyerAddress !== undefined) {
      if (typeof body.buyerAddress !== 'string' || body.buyerAddress.trim() === '') {
        return NextResponse.json(
          { error: 'Buyer address must be a non-empty string', code: 'INVALID_BUYER_ADDRESS' },
          { status: 400 }
        );
      }
      updates.buyerAddress = body.buyerAddress.trim();
    }

    if (body.buyerCity !== undefined) {
      if (typeof body.buyerCity !== 'string' || body.buyerCity.trim() === '') {
        return NextResponse.json(
          { error: 'Buyer city must be a non-empty string', code: 'INVALID_BUYER_CITY' },
          { status: 400 }
        );
      }
      updates.buyerCity = body.buyerCity.trim();
    }

    if (body.buyerState !== undefined) {
      if (typeof body.buyerState !== 'string' || body.buyerState.trim() === '') {
        return NextResponse.json(
          { error: 'Buyer state must be a non-empty string', code: 'INVALID_BUYER_STATE' },
          { status: 400 }
        );
      }
      updates.buyerState = body.buyerState.trim();
    }

    if (body.buyerZipCode !== undefined) {
      if (typeof body.buyerZipCode !== 'string' || body.buyerZipCode.trim() === '') {
        return NextResponse.json(
          { error: 'Buyer zip code must be a non-empty string', code: 'INVALID_BUYER_ZIP_CODE' },
          { status: 400 }
        );
      }
      updates.buyerZipCode = body.buyerZipCode.trim();
    }

    if (body.inquiryType !== undefined) {
      if (typeof body.inquiryType !== 'string' || body.inquiryType.trim() === '') {
        return NextResponse.json(
          { error: 'Inquiry type must be a non-empty string', code: 'INVALID_INQUIRY_TYPE' },
          { status: 400 }
        );
      }
      if (!isValidInquiryType(body.inquiryType)) {
        return NextResponse.json(
          { 
            error: 'Inquiry type must be one of: viewing, offer, information, financing', 
            code: 'INVALID_INQUIRY_TYPE' 
          },
          { status: 400 }
        );
      }
      updates.inquiryType = body.inquiryType.trim();
    }

    if (body.preferredContactTime !== undefined) {
      if (typeof body.preferredContactTime !== 'string' || body.preferredContactTime.trim() === '') {
        return NextResponse.json(
          { error: 'Preferred contact time must be a non-empty string', code: 'INVALID_PREFERRED_CONTACT_TIME' },
          { status: 400 }
        );
      }
      updates.preferredContactTime = body.preferredContactTime.trim();
    }

    if (body.additionalNotes !== undefined) {
      updates.additionalNotes = body.additionalNotes ? body.additionalNotes.trim() : null;
    }

    if (body.orderStatus !== undefined) {
      if (!isValidOrderStatus(body.orderStatus)) {
        return NextResponse.json(
          { 
            error: 'Order status must be one of: pending, contacted, viewing_scheduled, completed, cancelled', 
            code: 'INVALID_ORDER_STATUS' 
          },
          { status: 400 }
        );
      }
      updates.orderStatus = body.orderStatus;
    }

    if (body.totalValue !== undefined) {
      if (typeof body.totalValue !== 'number' || body.totalValue <= 0) {
        return NextResponse.json(
          { error: 'Total value must be a positive number', code: 'INVALID_TOTAL_VALUE' },
          { status: 400 }
        );
      }
      updates.totalValue = body.totalValue;
    }

    // Always update updatedAt
    updates.updatedAt = new Date().toISOString();

    const updated = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, orderId))
      .returning();

    return NextResponse.json(
      { order: updated[0], message: 'Order updated successfully' },
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

    const orderId = parseInt(id);

    // Check if order exists
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (existingOrder.length === 0) {
      return NextResponse.json(
        { error: 'Order not found', code: 'ORDER_NOT_FOUND' },
        { status: 404 }
      );
    }

    await db.delete(orders).where(eq(orders.id, orderId));

    return NextResponse.json(
      { message: 'Order deleted successfully' },
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