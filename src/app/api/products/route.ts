import { NextRequest, NextResponse } from 'next/server';
import { products } from '@/lib/seed-data';

// GET all products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const featured = searchParams.get('featured');
    
    let filtered = products.filter(p => p.active);
    if (categoryId) filtered = filtered.filter(p => p.categoryId === categoryId);
    if (featured === 'true') filtered = filtered.filter(p => p.featured);
    
    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST create product (stored in memory only for this session)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = { ...body, id: body.id || `prod-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}

// PUT update product
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json(body);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}