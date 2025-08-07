const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const fuzz = require('fuzzball');
const prisma = new PrismaClient();
const { execSync } = require('child_process');
const path = require('path');
const directory = path.dirname(__filename);
const pythonFiles = fs.readdirSync(directory).filter(file => file.endsWith('.py'));

// const block to optionally run Python scripts
// for (const file of pythonFiles) {
//     const filePath = path.join(directory, file);
//     console.log(`▶Running ${file}...`);
//     try {
//         execSync(`python "${filePath}"`, { stdio: 'inherit' });
//     } catch (error) {
//         console.error(`Error running ${file}:`, error.message);
//         process.exit(1);
//     }
// }

const knownBrands = [
    // Phones
    "Apple", "Samsung", "Realme", "Xiaomi", "Huawei", "Nokia", "Nothing", "Oppo", "Honor", "Infinix", "Tecno", "Vivo", "Motorola", "HMD",
    // Laptops / Tablets
    "Lenovo", "Asus", "HP", "Dell", "Acer", "Microsoft", "Toshiba", "Surface", "Chromebook",
    // Cameras
    "Canon", "Nikon", "Sony", "GoPro", "Fujifilm", "Instax", "Panasonic", "Olympus",
    // Home Appliances
    "LG", "Whirlpool", "Bosch", "Haier", "Electrolux", "Midea", "Philips", "Sharp",
    // Accessories / Others
    "Anker", "Porodo", "Powerology", "Green Lion", "Xundd", "Levelo", "Devia", "Mocoll", "Momax", "Zhiyun", "Youngkit", "Gatti", "Exact",
    "Unitek", "Sandisk", "Vertux", "EA", "Steelseries", "Razer", "Logitech", "Blu", "Yeelight", "Universal", "Ikon", "Lava", "Techno",
    // Consoles
    "PS5", "Xb1", "Xbox", "PlayStation", "Nintendo"
];

const brandCategoryMap = {
    // Phones
    "Apple": "Phone", "Samsung": "Phone", "Realme": "Phone", "Xiaomi": "Phone", "Huawei": "Phone", "Nokia": "Phone", "Nothing": "Phone",
    "Oppo": "Phone", "Honor": "Phone", "Infinix": "Phone", "Tecno": "Phone", "Vivo": "Phone", "Motorola": "Phone", "HMD": "Phone",

    // Laptops / Tablets
    "Lenovo": "Laptops", "Asus": "Laptops", "HP": "Laptops", "Dell": "Laptops", "Acer": "Laptops", "Microsoft": "Laptops", "Toshiba": "Laptops",
    "Surface": "Tablets", "Chromebook": "Laptops",

    // Cameras
    "Canon": "Cameras", "Nikon": "Cameras", "Sony": "Cameras", "GoPro": "Cameras", "Fujifilm": "Cameras", "Instax": "Cameras",
    "Panasonic": "Cameras", "Olympus": "Cameras",

    // Home Appliances
    "LG": "Home appliances", "Whirlpool": "Home appliances", "Bosch": "Home appliances", "Haier": "Home appliances",
    "Electrolux": "Home appliances", "Midea": "Home appliances", "Philips": "Home appliances", "Sharp": "Home appliances",

    // Accessories
    "Anker": "Accessories", "Porodo": "Accessories", "Powerology": "Accessories", "Green Lion": "Accessories", "Xundd": "Accessories",
    "Levelo": "Accessories", "Devia": "Accessories", "Mocoll": "Accessories", "Momax": "Accessories", "Zhiyun": "Accessories",
    "Youngkit": "Accessories", "Gatti": "Accessories", "Exact": "Accessories", "Unitek": "Accessories", "Sandisk": "Accessories",
    "Vertux": "Accessories", "EA": "Accessories", "Steelseries": "Accessories", "Razer": "Accessories", "Logitech": "Accessories",
    "Blu": "Accessories", "Yeelight": "Accessories", "Universal": "Accessories", "Ikon": "Accessories", "Lava": "Accessories", "Techno": "Accessories",

    // Consoles
    "PS5": "Accessories", "Xb1": "Accessories", "Xbox": "Accessories", "PlayStation": "Accessories", "Nintendo": "Accessories"
};

function detectBrand(name) {
    const lowerName = name.toLowerCase();
    for (const brand of knownBrands) {
        if (lowerName.includes(brand.toLowerCase())) {
            return brand;
        }
    }
    return "No Specific Brand";
}

function detectCategory(brand) {
    return brandCategoryMap[brand] || "Uncategorized";
}

function getStoreDetails(link) {
    if (link.includes("luluhypermarket.com")) {
        return {
            name: "Lulu Hypermarket",
            link: "https://gcc.luluhypermarket.com"
        };
    } else if (link.includes("virginmegastore.qa")) {
        return {
            name: "Virgin Megastore",
            link: "https://www.virginmegastore.qa"
        };
    } else if (link.includes("qatarmobile.qa")) {
        return {
            name: "Qatar Mobile",
            link: "https://www.qatarmobile.qa"
        };
    } else {
        return {
            name: "Unknown Store",
            link: link.split("/").slice(0, 3).join("/")
        };
    }
}

function findSimilarItemName(name, itemMap, threshold = 99) {
    for (const existingName of itemMap.keys()) {
        const score = fuzz.token_set_ratio(name, existingName);
        if (score >= threshold) return existingName;
    }
    return null;
}

async function main() {
    console.log("Seeding the database...");

    const luluData = JSON.parse(fs.readFileSync('luludata.json', 'utf-8'));
    const virginData = JSON.parse(fs.readFileSync('virgindata.json', 'utf-8'));
    const qatarmobileData = JSON.parse(fs.readFileSync('qatarmobiledata.json', 'utf-8'));
    const allProducts = [...luluData, ...virginData, ...qatarmobileData];
    console.log(`Loaded ${allProducts.length} products.`);

    const storeMap = new Map();
    const itemMap = new Map();

    const existingItems = await prisma.item.findMany();
    for (const item of existingItems) {
        itemMap.set(item.Name, item);
    }

    console.log("\n🛠 Creating/Updating items...");
    for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        const percent = ((i + 1) / allProducts.length * 100).toFixed(1);
        process.stdout.write(`\r  Progress: ${percent}% (${i + 1}/${allProducts.length})`);

        const { name: storeName, link: storeLink } = getStoreDetails(product.link);

        if (!storeMap.has(storeName)) {
            let store = await prisma.store.findFirst({ where: { name: storeName } });
            if (!store) {
                store = await prisma.store.create({
                    data: {
                        name: storeName,
                        Store_Link: storeLink
                    }
                });
            }
            storeMap.set(storeName, store);
        }

        const matchedName = findSimilarItemName(product.name, itemMap);
        const lowestPrice = Math.min(product.price, product.original_price || product.price);
        const detectedBrand = detectBrand(product.name);
        const category = detectCategory(detectedBrand);
        let item;

        if (matchedName) {
            item = itemMap.get(matchedName);
            if (lowestPrice < item.LowestPrice || !item.Brand || !item.Category) {
                item = await prisma.item.update({
                    where: { Item_ID: item.Item_ID },
                    data: {
                        LowestPrice: lowestPrice,
                        Brand: item.Brand || detectedBrand,
                        Category: item.Category || category
                    }
                });
            }
        } else {
            item = await prisma.item.create({
                data: {
                    Name: product.name,
                    Image: product.image_url || null,
                    LowestPrice: lowestPrice,
                    Brand: detectedBrand || null,
                    Category: category || null
                }
            });
            itemMap.set(product.name, item);
        }
    }
    process.stdout.write("\nItems created/updated.\n");

    console.log("\nCreating listings...");
    for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        const percent = ((i + 1) / allProducts.length * 100).toFixed(1);
        process.stdout.write(`\r  Progress: ${percent}% (${i + 1}/${allProducts.length})`);

        const { name: storeName } = getStoreDetails(product.link);
        const store = storeMap.get(storeName);
        const matchedName = findSimilarItemName(product.name, itemMap);
        const item = itemMap.get(matchedName || product.name);

        await prisma.itemListing.upsert({
            where: {
                store_id_Item_ID: {
                    store_id: store.store_id,
                    Item_ID: item.Item_ID
                }
            },
            update: {},
            create: {
                store_id: store.store_id,
                Item_ID: item.Item_ID,
                Price: product.price,
                Store_name: store.name,
                Item_name: product.name,
                ItemListing_Link: product.link
            }
        });
    }
    process.stdout.write("\nListings created.\n");

    console.log("\n🔁 Recalculating lowest prices...");
    const items = await prisma.item.findMany();
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const percent = ((i + 1) / items.length * 100).toFixed(1);
        process.stdout.write(`\r  Progress: ${percent}% (${i + 1}/${items.length})`);

        const listings = await prisma.itemListing.findMany({
            where: { Item_ID: item.Item_ID },
            select: { Price: true }
        });

        const prices = listings.map(l => l.Price);
        const actualLowest = Math.min(...prices);

        if (item.LowestPrice !== actualLowest) {
            await prisma.item.update({
                where: { Item_ID: item.Item_ID },
                data: { LowestPrice: actualLowest }
            });
        }
    }
    process.stdout.write("\nPrices recalculated.\n");

    const updatedItems = await prisma.item.findMany({
        select: { Name: true, LowestPrice: true, Brand: true, Category: true },
        orderBy: { LowestPrice: 'asc' }
    });

    console.log("\nFinal Items with True Lowest Prices:");
    updatedItems.forEach(item => {
        console.log(`- ${item.Name} [${item.Category}] (${item.Brand || "No Brand"}): QAR ${item.LowestPrice}`);
    });

    console.log("\nSeeding complete.");
}

main()
    .catch(e => {
        console.error("Error during seed:", e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
