import { useRouter } from "next/navigation"; // ✅ App Router version
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import "./LoginRegister.css";

const Login = ({ setLogin }) => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/Home");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <>
      <h3 id="login-title">Log in to your account</h3>
      <input className="inputs" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="inputs" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <input id="submit" type="submit" value="Log in" onClick={handleLogin} />
      <p id="register-login">Don't have an account?</p>
      <button onClick={() => setLogin(false)} id="register">Register</button>
    </>
  );
};

export default Login;