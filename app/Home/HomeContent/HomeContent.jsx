import "./HomeContent.css";
import Product from "./Product/Product";
import { useState, useEffect } from "react";
import Modal from "react-modal";

const categories = [
  { name: "phone", label: "Phone", img: "phone.png" },
  { name: "laptops", label: "Laptops", img: "laptops.png" },
  { name: "tablets", label: "Tablets", img: "tablets.png" },
  { name: "appliances", label: "Home appliances", img: "appliances.png" },
  { name: "cameras", label: "Cameras", img: "cameras.png" },
];

const categoryAliases = {
  phone: ["phone", "phones", "smartphone", "smartphones", "mobile"],
  laptops: ["laptop", "laptops", "notebook", "notebooks"],
  tablets: ["tablet", "tablets", "ipad", "ipads"],
  appliances: ["home appliances", "appliance", "appliances"],
  cameras: ["camera", "cameras", "dslr", "mirrorless"]
};

Modal.setAppElement("#root");

const HomeContent = ({ searchTerm }) => {
  const [visibleCount, setVisibleCount] = useState(15);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchKey, setSearchKey] = useState(0);
  const [products, setProducts] = useState([]);

  // Fetch products from API based on selectedCategory and searchTerm
  const [masterProducts, setMasterProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/items"); // fetch ALL products once
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        // Sort products by having images first, then by ID for consistency
        const sorted = data
          .sort((a, b) => {
            const aHasImage = a.Image && a.Image.trim() !== "";
            const bHasImage = b.Image && b.Image.trim() !== "";
            
            // First sort by image presence
            if (aHasImage !== bHasImage) {
              return bHasImage - aHasImage;
            }
            
            // Then sort by ID for consistent ordering between reloads
            return a.Item_ID - b.Item_ID;
          });

        setMasterProducts(sorted);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = masterProducts
      .filter((product) => {
        const clean = (str) => str?.toLowerCase().trim() || "";

        const matchesCategory = selectedCategory
          ? categoryAliases[selectedCategory]?.some(alias =>
            clean(product.Category).includes(alias)
          )
          : true;

        const matchesSearch = searchTerm
          ? clean(product.Name).includes(clean(searchTerm)) ||
          clean(product.Brand).includes(clean(searchTerm))
          : true;

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (searchTerm || selectedCategory) {
          return b.LowestPrice - a.LowestPrice;
        }
        
        // Use consistent sorting when no filters are applied
        return a.Item_ID - b.Item_ID;
      });

    setProducts(filtered);
    setVisibleCount(15);
    setSearchKey((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedCategory, searchTerm, masterProducts]);

  const visibleProducts = products.slice(0, visibleCount);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const nearBottom = window.innerHeight + scrollY >= document.body.offsetHeight - 200;
      const scrollingUp = scrollY < lastScrollY;

      if (nearBottom && visibleCount < products.length) {
        setVisibleCount((prev) => prev + 10);
      }

      if (scrollingUp && scrollY < window.innerHeight * 0.2 && visibleCount > 15) {
        setVisibleCount(15);
      }

      lastScrollY = scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount, products.length]);

  return (
    <main className="home-content">
      <section className="category-section">
        {categories.map(({ name, label, img }) => (
          <div
            className={`category-card ${selectedCategory === name ? "active" : ""}`}
            key={name}
            onClick={() =>
              setSelectedCategory((prev) => (prev === name ? null : name))
            }
          >
            <img src={img} alt={label} />
          </div>
        ))}
      </section>

      <h2 className="section-title animate-fade">Latest Products</h2>

      <section className="products-grid">
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product) => (
            <Product key={product.Item_ID} {...product} />
          ))
        ) : (
          <p style={{ textAlign: "center", width: "100%" }}>
            No matching products found.
          </p>
        )}
      </section>
    </main>
  );
};

export default HomeContent;