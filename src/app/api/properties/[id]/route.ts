import { NextRequest, NextResponse } from 'next/server';
import { properties } from '@/lib/properties-data';
import { Property } from '@/types/property';

// In-memory storage (shared with the main route)
let propertiesStore: Property[] = [...properties];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const property = propertiesStore.find(p => p.id === id);

  if (!property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  return NextResponse.json({ property });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const index = propertiesStore.findIndex(p => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const updatedProperty: Property = {
      ...propertiesStore[index],
      ...body,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    propertiesStore[index] = updatedProperty;

    return NextResponse.json({ property: updatedProperty, message: 'Property updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const index = propertiesStore.findIndex(p => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    propertiesStore.splice(index, 1);

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}
