// Load environment variables
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const itemId = searchParams.get("itemId");
  const category = searchParams.get("category"); // <-- new

  console.log('Database URL:', process.env.DATABASE_URL);

  try {
    if (itemId) {
      if (isNaN(parseInt(itemId))) {
        return new Response(JSON.stringify({ error: "Invalid itemId" }), { status: 400 });
      }

      const product = await prisma.item.findUnique({
        where: { Item_ID: parseInt(itemId) },
        include: { listings: true },
      });

      if (!product) {
        return new Response(JSON.stringify({ error: "Item not found" }), { status: 404 });
      }

      return new Response(JSON.stringify(product), { status: 200 });
    }

    if (category) {
      const productsByCategory = await prisma.item.findMany({
        where: {
          Category: category, // 🧠 assumes your DB has a 'Category' field in 'item'
        },
        include: { listings: true },
      });

      return new Response(JSON.stringify(productsByCategory), { status: 200 });
    }

    // Default: fetch all items
    const products = await prisma.item.findMany({
      include: { listings: true },
    });

    return new Response(JSON.stringify(products), { status: 200 });

  } catch (error) {
    console.error("Error in GET /api/items:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

// POST request handler
export async function POST(req) {
  try {
    const body = await req.json();

    const newProduct = await prisma.item.create({
      data: body, // 🧠 Make sure body matches your Prisma schema
    });

    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/items:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}
