import SearchIcon from "./SearchIcon";
import Navigation from "../Navigation/Navigation";
import "./Hearder.css";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserCircle, X } from "lucide-react";
import Modal from "react-modal";
import Product from "../HomeContent/Product/Product";
import { collection, getDocs } from "firebase/firestore";

const Hearder = (props) => {
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const handleRemoveFromWishlist = (itemIdToRemove) => {
    setWishlistProducts((prev) =>
      prev.filter((product) => product.Item_ID !== itemIdToRemove)
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      alert("Error logging out: " + err.message);
    }
  };

  const fetchWishlist = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    const snapshot = await getDocs(collection(db, "users", userId, "wishlist"));
    const items = snapshot.docs.map((doc) => ({
      ...doc.data(),
      Item_ID: doc.id,
    }));
        setWishlistProducts(items);
    setWishlistOpen(true);
  };

  return (
    <>
      <header>
        <div className="left-section">
          <button className="profile-btn" onClick={() => setDrawerOpen(true)}>
            <UserCircle size={28} />
          </button>
          <div className="search-wrapper">
            <input
              id="header-search"
              type="search"
              placeholder="What are you looking for?"
              value={props.searchTerm}
              onChange={(e) => props.setSearchTerm(e.target.value)}
            />
            <SearchIcon />
          </div>
        </div>

        <div className="right-section">
          {user && <span id="header-user">{user.email}</span>}
          <Navigation
            currentTab={props.currentTab}
            setCurrentTab={props.setCurrentTab}
          />
          <button onClick={handleLogout} id="header-logout">Logout</button>
        </div>
      </header>

      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}

      <div className={`drawer ${drawerOpen ? "open" : ""}`}>
        <h2 style={{ marginBottom: "1rem" }}>My Account</h2>
        <button className="drawer-btn">View Profile</button>
        <button className="drawer-btn" onClick={fetchWishlist}>
          Wishlist
        </button>
        <button className="drawer-btn">Settings</button>
        <button className="drawer-btn" onClick={handleLogout}>Logout</button>
      </div>

      <Modal
        isOpen={wishlistOpen}
        onRequestClose={() => setWishlistOpen(false)}
        className="modal"
        overlayClassName="overlay"
        contentLabel="Wishlist"
        closeTimeoutMS={300}
      >
        <button className="close-btn" onClick={() => setWishlistOpen(false)}>×</button>
        <h2>Your Wishlist</h2>
        <div className="products-grid">
          {wishlistProducts.length > 0 ? (
            wishlistProducts.map((product, index) => (
              <Product
                key={product.Item_ID}
                {...product}
                inWishlistView={true}
                onRemoveFromWishlist={(id) =>
                  setWishlistProducts((prev) =>
                    prev.filter((p) => p.Item_ID !== id)
                  )
                }
              />
            ))
          ) : (
            <p>No items in wishlist.</p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default Hearder;