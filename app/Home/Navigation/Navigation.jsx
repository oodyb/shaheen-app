import "./Navigation.css";
const Navigation = (props) => {
  return (
    <nav id="nav-home">
      <ul>
        <li className={props.currentTab === "home" ? "active" : ""}>
          <a href="#1" onClick={() => props.setCurrentTab("home")}>Home</a>
        </li>
        <li className={props.currentTab === "about" ? "active" : undefined}>
          <a href="#2" onClick={() => props.setCurrentTab("about")} >About</a>
        </li>
        {/* <li className={props.currentTab === "categories" ? "active" : undefined}>
          <a href="#" onClick={() => props.setCurrentTab("categories")} >Categories</a>
        </li> */}
        <li className={props.currentTab === "contact" ? "active" : undefined}>
          <a href="#3" onClick={() => props.setCurrentTab("contact")} >Contact Us</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;