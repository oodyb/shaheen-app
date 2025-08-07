'use client'
import React from "react";
import logo from "../public/logo.png";
import "./LoginPage.css";
import Login from "./LoginRegister/Login";
import Register from "./LoginRegister/Register";
import Image from "next/image";

const LoginPage = () => {
  const [login, setLogin] = React.useState(true);
  return (
    <main>
      <Image
          src={logo}
          alt="logo"
          width={200}
          height={200}
          className="App-logo"
        />
      <form action="/" method="get">
        {login ? (
          <Login setLogin={setLogin} />
        ) : (
          <Register setLogin={setLogin} />
        )}
      </form>
    </main>
  );
};
export default LoginPage;