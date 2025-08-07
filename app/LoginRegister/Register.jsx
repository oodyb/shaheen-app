import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import "./LoginRegister.css";

const Register = ({ setLogin }) => {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
      setLogin(true);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <h3 id="login-title">Create a new account</h3>
      <input
        className="inputs"
        type="text"
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <input
        className="inputs"
        type="tel"
        placeholder="Mobile number"
        value={mobile}
        onChange={(e) => setMobile(e.target.value)}
      />
      <input
        className="inputs"
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="inputs"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        id="submit"
        type="submit"
        value="Create new account"
        onClick={handleRegister}
      />
      <p id="register-login">Do you have an account?</p>
      <button onClick={() => setLogin(true)} id="register">
        Login
      </button>
    </>
  );
};

export default Register;