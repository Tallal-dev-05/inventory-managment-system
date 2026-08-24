import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignIn.css";

function SignIn() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const [serverMessage, setServerMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const email = watch("email", "").trim();

  // ==========================================
  // EMAIL VALIDITY
  // ==========================================

  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ==========================================
  // EMAIL REGISTER
  // ==========================================

  const emailRegister = register("email", {
    required: "Email is required",

    setValueAs: (value) => value.trim(),

    maxLength: {
      value: 254,
      message: "Email is too long",
    },

    validate: (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ||
      "Enter a valid email address",
  });

  // ==========================================
  // PASSWORD REGISTER
  // ==========================================

  const passwordRegister = register("password", {
    required: "Password is required",
  });

  // ==========================================
  // SUBMIT
  // ==========================================

  const onSubmit = async (data) => {
    setServerMessage("");
    setPasswordError("");

    const cleanEmail = data.email.trim();
    const enteredPassword = data.password;

    // ========================================
    // EMAIL MUST BE VALID FIRST
    // ========================================

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      setPasswordError("Please enter email first");
      return;
    }

    // ========================================
    // FRONTEND VALIDATION PASSED
    // NOW CONTACT BACKEND
    // ========================================

    const loginData = {
      email: cleanEmail,
      password: enteredPassword,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/signin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(loginData),
        }
      );

      const result = await response.json();

      // ========================================
      // LOGIN FAILED
      // ========================================

      if (!response.ok) {
        setServerMessage(
          result.message || "Login failed"
        );
        return;
      }

      // ========================================
// LOGIN SUCCESSFUL
// ========================================

// Check user's role
if (result.user.role === "admin") {
  console.log("Admin login detected");
  navigate("/admin");
} else {
  console.log("Normal user login detected");
  navigate("/items");
}

    } catch (error) {
      console.error("Login request failed:", error);

      setServerMessage(
        "Unable to connect to the server"
      );
    }
  };

  return (
    <div className="signin-page">

      <div className="signin-card">

        {/* =====================================
            LEFT SIDE
        ===================================== */}

        <div className="signin-section">

          <h2>Sign In</h2>

          {/* SOCIAL BUTTONS */}

          <div className="social-buttons">
            <button type="button">G</button>
            <button type="button">f</button>
            <button type="button">◉</button>
            <button type="button">in</button>
          </div>

          <p className="divider-text">
            or use your email and password
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >

            {/* =================================
                EMAIL
            ================================= */}

            <div className="input-group">

              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                {...emailRegister}
                onChange={(e) => {
                  emailRegister.onChange(e);

                  setServerMessage("");

                  const cleanValue =
                    e.target.value.trim();

                  const valid =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                      cleanValue
                    );

                  if (valid) {
                    setPasswordError("");
                  }
                }}
              />

              {errors.email && (
                <span className="error">
                  {errors.email.message}
                </span>
              )}

            </div>

            {/* =================================
                PASSWORD
            ================================= */}

            <div className="input-group">

              <input
                type="password"
                placeholder="Password"
                autoComplete="current-password"
                {...passwordRegister}
                onFocus={() => {
                  setServerMessage("");

                  if (!isEmailValid) {
                    setPasswordError(
                      "Please enter email first"
                    );
                  }
                }}
                onChange={(e) => {
                  passwordRegister.onChange(e);

                  setServerMessage("");

                  if (!isEmailValid) {
                    setPasswordError(
                      "Please enter email first"
                    );
                    return;
                  }

                  setPasswordError("");
                }}
              />

              {errors.password && !passwordError && (
                <span className="error">
                  {errors.password.message}
                </span>
              )}

              {passwordError && (
                <span className="error">
                  {passwordError}
                </span>
              )}

            </div>

            {/* =================================
                SERVER MESSAGE
            ================================= */}

            {serverMessage && (
              <p className="server-message">
                {serverMessage}
              </p>
            )}

            {/* =================================
                SIGN IN BUTTON
            ================================= */}

            <button
              type="submit"
              className="signin-submit-button"
            >
              SIGN IN
            </button>

          </form>

        </div>

        {/* =====================================
            RIGHT SIDE
        ===================================== */}

        <div className="hello-section">

          <div className="hello-content">

            <h1>Hello, Friend!</h1>

            <p>
              Register with your personal details to
              use all of site features
            </p>

            <Link
              to="/SignUp"
              className="signup-link-button"
            >
              SIGN UP
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}

export default SignIn;
