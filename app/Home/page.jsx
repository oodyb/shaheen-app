'use client';
import React, { useState } from "react";
import Hearder from "./Hearder/Hearder";
import HomeContent from "./HomeContent/HomeContent";
import Footer from "./Footer/Footer";
import About from "./About/About";
import Contact from "./Contact/Contact";

const Home = () => {
  const [currentTab, setCurrentTab] = useState("home");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="home">
      <Hearder
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {currentTab === "home" && (
        <HomeContent searchTerm={searchTerm} />
      )}
      {currentTab === "about" && <About />}
      {currentTab === "contact" && <Contact />}

      <Footer />
    </div>
  );
};

export default Home;