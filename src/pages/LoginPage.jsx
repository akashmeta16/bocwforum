import { useState } from "react";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      window.alert("Please enter username and password");
      return;
    }

    window.alert("Login functionality requires server integration. This is a static replica.");
  };

  return (
    <div className="container-fluid hero-wrap">
      <div className="container mt-1 pt-3 pb-4">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card shadow-sm">
              <div className="card-header text-white login-header">
                <h5 className="mb-0">BOCW Forum Login</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      Username / Email
                    </label>
                    <input
                      id="username"
                      type="text"
                      className="form-control"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-find w-100">
                    Login
                  </button>
                  <p className="text-center text-muted mt-2 mb-0 login-note">Authorized personnel only</p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
