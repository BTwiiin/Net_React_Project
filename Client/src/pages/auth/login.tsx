import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context } from "../../main";
import { FiMail, FiLock, FiEye, FiUser } from 'react-icons/fi';
import "./login.css";
import Logo from "../../assets/workshop.webp";

const Login = observer(() => {
  const workshop = useContext(Context);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await workshop.login(username, password);
    if (response.success) {
      navigate('/');
    } else {
      setError(response.message);
    }
  };

  return (
    <div className="screen-1">
      <img src={Logo} alt="Logo" className="logo" />
      <form onSubmit={handleSubmit}>
        <div className="email">
          <label htmlFor="username">Username</label>
          <div className="sec-2">
            <FiUser />
            <input
              id="username"
              name="username"
              type="text"
              required
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="password">
          <label htmlFor="password">Password</label>
          <div className="sec-2">
            <FiLock />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="············"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button className="login" type="submit">
          Login
        </button>
        <div className="footer">
        <span onClick={() => navigate('/register')}>Sign up</span>
        <span>Forgot Password?</span>
      </div>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
});

export default Login;
