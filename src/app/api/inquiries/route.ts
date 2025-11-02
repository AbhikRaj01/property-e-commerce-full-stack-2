import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inquiries } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Valid status values
const VALID_STATUSES = ['new', 'read', 'responded', 'closed'] as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single inquiry by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const inquiry = await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.id, parseInt(id)))
        .limit(1);

      if (inquiry.length === 0) {
        return NextResponse.json(
          { error: 'Inquiry not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json({ inquiry: inquiry[0] }, { status: 200 });
    }

    // List inquiries with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');
    const propertyId = searchParams.get('propertyId');

    let query = db.select().from(inquiries);
    const conditions = [];

    if (status) {
      if (!VALID_STATUSES.includes(status as any)) {
        return NextResponse.json(
          { 
            error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`, 
            code: 'INVALID_STATUS' 
          },
          { status: 400 }
        );
      }
      conditions.push(eq(inquiries.status, status));
    }

    if (propertyId) {
      const propertyIdNum = parseInt(propertyId);
      if (isNaN(propertyIdNum)) {
        return NextResponse.json(
          { error: 'Valid propertyId is required', code: 'INVALID_PROPERTY_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(inquiries.propertyId, propertyIdNum));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(inquiries.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    let countQuery = db.select({ count: inquiries.id }).from(inquiries);
    if (conditions.length > 0) {
      countQuery = countQuery.where(and(...conditions));
    }
    const countResult = await countQuery;
    const count = countResult.length;

    return NextResponse.json(
      { inquiries: results, count },
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
    const { propertyId, name, email, phone, message, status } = body;

    // Validate required fields
    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId is required', code: 'MISSING_PROPERTY_ID' },
        { status: 400 }
      );
    }

    if (isNaN(parseInt(propertyId))) {
      return NextResponse.json(
        { error: 'propertyId must be a valid integer', code: 'INVALID_PROPERTY_ID' },
        { status: 400 }
      );
    }

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json(
        { error: 'name is required and must be a non-empty string', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json(
        { error: 'email is required and must be a non-empty string', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json(
        { error: 'email must be a valid email address', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    if (!phone || typeof phone !== 'string' || phone.trim() === '') {
      return NextResponse.json(
        { error: 'phone is required and must be a non-empty string', code: 'MISSING_PHONE' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'message is required and must be a non-empty string', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    // Validate status if provided
    const inquiryStatus = status || 'new';
    if (!VALID_STATUSES.includes(inquiryStatus)) {
      return NextResponse.json(
        { 
          error: `status must be one of: ${VALID_STATUSES.join(', ')}`, 
          code: 'INVALID_STATUS' 
        },
        { status: 400 }
      );
    }

    // Create inquiry
    const newInquiry = await db
      .insert(inquiries)
      .values({
        propertyId: parseInt(propertyId),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        message: message.trim(),
        status: inquiryStatus,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(
      { 
        inquiry: newInquiry[0], 
        message: 'Inquiry submitted successfully' 
      },
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

    const body = await request.json();
    const { propertyId, name, email, phone, message, status } = body;

    // Check if inquiry exists
    const existing = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Inquiry not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build updates object with validation
    const updates: any = {};

    if (propertyId !== undefined) {
      if (isNaN(parseInt(propertyId))) {
        return NextResponse.json(
          { error: 'propertyId must be a valid integer', code: 'INVALID_PROPERTY_ID' },
          { status: 400 }
        );
      }
      updates.propertyId = parseInt(propertyId);
    }

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim() === '') {
        return NextResponse.json(
          { error: 'name must be a non-empty string', code: 'INVALID_NAME' },
          { status: 400 }
        );
      }
      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== 'string' || email.trim() === '') {
        return NextResponse.json(
          { error: 'email must be a non-empty string', code: 'INVALID_EMAIL' },
          { status: 400 }
        );
      }
      if (!EMAIL_REGEX.test(email.trim())) {
        return NextResponse.json(
          { error: 'email must be a valid email address', code: 'INVALID_EMAIL_FORMAT' },
          { status: 400 }
        );
      }
      updates.email = email.trim().toLowerCase();
    }

    if (phone !== undefined) {
      if (typeof phone !== 'string' || phone.trim() === '') {
        return NextResponse.json(
          { error: 'phone must be a non-empty string', code: 'INVALID_PHONE' },
          { status: 400 }
        );
      }
      updates.phone = phone.trim();
    }

    if (message !== undefined) {
      if (typeof message !== 'string' || message.trim() === '') {
        return NextResponse.json(
          { error: 'message must be a non-empty string', code: 'INVALID_MESSAGE' },
          { status: 400 }
        );
      }
      updates.message = message.trim();
    }

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { 
            error: `status must be one of: ${VALID_STATUSES.join(', ')}`, 
            code: 'INVALID_STATUS' 
          },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Update inquiry
    const updated = await db
      .update(inquiries)
      .set(updates)
      .where(eq(inquiries.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { 
        inquiry: updated[0], 
        message: 'Inquiry updated successfully' 
      },
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

    // Check if inquiry exists
    const existing = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, parseInt(id)))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Inquiry not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete inquiry
    await db
      .delete(inquiries)
      .where(eq(inquiries.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      { message: 'Inquiry deleted successfully' },
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