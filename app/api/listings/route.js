import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request) {
    // Extract searchParams from the request URL
    const { searchParams } = new URL(request.url);
    const itemId = parseInt(searchParams.get('Item_ID')); // Get 'Item_ID' from query params

    if (itemId) {
        // Fetch listings for the given Item_ID
        const listings = await prisma.itemListing.findMany({
            where: {
                Item_ID: itemId,
            },
        });

        return new Response(JSON.stringify(listings), {
            status: 200,
            headers: { 'content-type': 'application/json' },
        });
    } else {
        // If no Item_ID is provided, return all listings
        const listings = await prisma.itemListing.findMany();

        return new Response(JSON.stringify(listings), {
            status: 200,
            headers: { 'content-type': 'application/json' },           headers: { 'content-type': 'application/json' },
        });
    }
}