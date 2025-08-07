import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./Product.css";
import { Star } from "lucide-react";
import { db, auth } from "../../../../lib/firebase";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";

const Product = ({
  Image,
  Name,
  LowestPrice,
  Brand,
  Item_ID,
  inWishlistView = false,
  onRemoveFromWishlist = () => {},
}) => {
  const [recommendationsModalOpen, setRecommendationsModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareTargetProduct, setCompareTargetProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [returnToRecommendations, setReturnToRecommendations] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const placeholderImage = "https://via.placeholder.com/200x130?text=No+Image";

  // Check if product is in wishlist
  useEffect(() => {
    // If we're in wishlist view, the product is already wishlisted
    if (inWishlistView) {
      setIsWishlisted(true);
      return;
    }

    const checkWishlistStatus = async () => {
      const user = auth.currentUser;
      if (!user || !Item_ID) return;

      try {
        const wishlistRef = doc(db, "users", user.uid, "wishlist", Item_ID.toString());
        const docSnap = await getDoc(wishlistRef);
        setIsWishlisted(docSnap.exists());
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [Item_ID, inWishlistView]);

  // Toggle wishlist status
  const toggleWishlist = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to use wishlist");
      return;
    }

    try {
      const wishlistRef = doc(db, "users", user.uid, "wishlist", Item_ID.toString());
      
      if (isWishlisted) {
        await deleteDoc(wishlistRef);
        if (inWishlistView) {
          onRemoveFromWishlist(Item_ID);
        } else {
          setIsWishlisted(false);
        }
      } else {
        await setDoc(wishlistRef, {
          Name,
          Brand,
          Image,
          LowestPrice,
          Item_ID,
        });
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/items");
        const data = await response.json();
        setAllProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const getRecommendations = (current) => {
    if (!current || !current.Name || !current.Brand) {
      console.error("Invalid product passed to getRecommendations:", current);
      return [];
    }

    const baseKeywords = current.Name.toLowerCase().split(/\s+/);
    const brand = current.Brand.toLowerCase();

    return allProducts
      .filter((p) => p.Name !== current.Name)
      .map((p) => {
        const keywords = p.Name.toLowerCase().split(/\s+/);
        const brandMatch = p.Brand.toLowerCase() === brand ? 1 : 0;
        const overlap = keywords.filter((word) => baseKeywords.includes(word)).length;
        const score = brandMatch * 10 + overlap;
        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  };

  const openRecommendations = () => {
    if (!Name || !Brand) {
      console.error("Invalid product passed to openRecommendations:", { Name, Brand });
      return;
    }

    const recs = getRecommendations({ Name, Brand });
    setRecommendations(recs);
    setRecommendationsModalOpen(true);
  };

  const openCompareModal = async (productToCompare) => {

    try {
      const response = await fetch(`/api/listings?Item_ID=${productToCompare.Item_ID}`);
      const listings = await response.json();

      setCompareTargetProduct({
        ...productToCompare,
        listings,
      });

      if (recommendationsModalOpen) {
        setReturnToRecommendations(true);
        setRecommendationsModalOpen(false);
        setTimeout(() => setCompareModalOpen(true), 50);
      } else {
        setReturnToRecommendations(false);
        setCompareModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching comparison listings:", error);
    }
  };

  const handleCloseCompareModal = () => {
    setCompareModalOpen(false);
    if (returnToRecommendations) {
      setTimeout(() => {
        setRecommendationsModalOpen(true);
        setReturnToRecommendations(false);
      }, 50);
    }
  };

  return (
    <div className="product">
      <button className="wishlist-star" onClick={toggleWishlist}>
        <Star fill={isWishlisted ? "#FF6600" : "none"} color={isWishlisted ? "#FF6600" : "currentColor"} />
      </button>
      <img
        src={Image || placeholderImage}
        alt={Name}
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = placeholderImage;
        }}
      />
      <h3>{Name}</h3>
      <p>{LowestPrice} QR</p>

      <div className="product-buttons">
        <button
          className="compare-btn"
          onClick={() => openCompareModal({ Name, Brand, Image, Item_ID })}
        >
          Compare Sites
        </button>
        <button className="recommend-btn" onClick={openRecommendations}>
          Recommend More
        </button>

        {/* Compare Modal */}
        <Modal
          isOpen={compareModalOpen}
          onRequestClose={handleCloseCompareModal}
          className="modal"
          overlayClassName="overlay"
          closeTimeoutMS={350}
          contentLabel="Compare Sites"
        >
          <button className="close-btn" onClick={handleCloseCompareModal}>×</button>
          <h2>Compare Sites</h2>

          {compareTargetProduct?.listings?.length > 0 ? (
            <div className="comparison-grid">
              {compareTargetProduct.listings.map((listing, index) => (
                <div className="comparison-card" key={index}>
                  <h4>{listing.Store_name}</h4>
                  <img
                    src={compareTargetProduct.Image || placeholderImage}
                    alt={listing.Item_name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = placeholderImage;
                    }}
                  />
                  <p className="comparison-name">{listing.Item_name}</p>
                  <p className="comparison-price">{listing.Price} QAR</p>
                  <a
                    href={listing.ItemListing_Link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="view-btn">Go to product</button>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p>No listings available for this product.</p>
          )}
        </Modal>

        {/* Recommendations Modal */}
        <Modal
          isOpen={recommendationsModalOpen}
          onRequestClose={() => setRecommendationsModalOpen(false)}
          className="modal"
          overlayClassName="overlay"
          closeTimeoutMS={350}
          contentLabel="Recommended Products"
        >
          <button className="close-btn" onClick={() => setRecommendationsModalOpen(false)}>×</button>
          <h2>Recommended Products</h2>
          <div className="recommendations">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="modal-card">
                <img
                  src={rec.Image || placeholderImage}
                  alt={rec.Name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImage;
                  }}
                />
                <p>{rec.Name}</p>
                <button
                  className="re-compare-btn"
                  onClick={() => openCompareModal(rec)}
                >
                  Compare Sites
                </button>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Product;