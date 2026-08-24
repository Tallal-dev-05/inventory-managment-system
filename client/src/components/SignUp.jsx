import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignUp.css";

function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: "onChange",
  });

  const [serverMessage, setServerMessage] = useState("");

  const navigate = useNavigate();

  // This function runs ONLY after frontend validation passes
  const onSubmit = async (data) => {
    setServerMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name.trim(),
            email: data.email.trim(),
            password: data.password,
          }),
        }
      );

      const result = await response.json();

      // Backend error
      if (!response.ok) {
        setServerMessage(result.message);
        return;
      }

      // Backend success
      setServerMessage(result.message);

      console.log("User created:", result.user);

      // Go to Sign In after successful signup
      setTimeout(() => {
        navigate("/signin");
      }, 1000);

    } catch (error) {
      console.error("Signup error:", error);
      setServerMessage("Unable to connect to server");
    }
  };

  return (
    <div className="signup-page">

      <div className="signup-card">

        {/* LEFT SIDE */}
        <div className="welcome-section">

          <div className="welcome-content">

            <h1>Welcome Back!</h1>

            <p>
              Enter your personal details to use all of site
              features
            </p>

            <Link to="/SignIn" className="signin-button">
              SIGN IN
            </Link>

          </div>

        </div>


        {/* RIGHT SIDE */}
        <div className="signup-section">

          <h2>Create Account</h2>


          {/* SOCIAL BUTTONS */}
          <div className="social-buttons">

            <button type="button">G</button>

            <button type="button">f</button>

            <button type="button">◉</button>

            <button type="button">in</button>

          </div>


          <p className="divider-text">
            or use your email for registration
          </p>


          {/* FORM */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >


            {/* ================= NAME ================= */}

            <div className="input-group">

              <input
                type="text"
                placeholder="Name"
                autoComplete="name"
                {...register("name", {

                  required: "Name is required",

                  minLength: {
                    value: 2,
                    message:
                      "Name must be at least 2 characters",
                  },

                  maxLength: {
                    value: 50,
                    message:
                      "Name cannot exceed 50 characters",
                  },

                  validate: (value) => {

                    const name = value.trim();

                    if (name.length < 2) {
                      return "Name must be at least 2 characters";
                    }

                    if (
                      !/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(name)
                    ) {
                      return "Name can only contain letters and spaces";
                    }

                    return true;
                  },

                })}
              />

              {errors.name && (
                <span className="error">
                  {errors.name.message}
                </span>
              )}

            </div>


            {/* ================= EMAIL ================= */}

            <div className="input-group">

              <input
                type="email"
                placeholder="Email"
                autoComplete="email"
                {...register("email", {

                  required: "Email is required",

                  maxLength: {
                    value: 254,
                    message: "Email is too long",
                  },

                  validate: (value) => {

                    const email = value.trim();

                    if (/\s/.test(email)) {
                      return "Email cannot contain spaces";
                    }

                    if (
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                    ) {
                      return "Enter a valid email address";
                    }

                    return true;
                  },

                })}
              />

              {errors.email && (
                <span className="error">
                  {errors.email.message}
                </span>
              )}

            </div>


            {/* ================= PASSWORD ================= */}

            <div className="input-group">

              <input
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                {...register("password", {

                  required: "Password is required",

                  minLength: {
                    value: 8,
                    message:
                      "Password must be at least 8 characters",
                  },

                  maxLength: {
                    value: 64,
                    message:
                      "Password cannot exceed 64 characters",
                  },

                  validate: (value) => {

                    if (!/[a-z]/.test(value)) {
                      return "Password needs a lowercase letter";
                    }

                    if (!/[A-Z]/.test(value)) {
                      return "Password needs an uppercase letter";
                    }

                    if (!/[0-9]/.test(value)) {
                      return "Password needs a number";
                    }

                    if (!/[^A-Za-z0-9]/.test(value)) {
                      return "Password needs a special character";
                    }

                    return true;
                  },

                })}
              />

              {errors.password && (
                <span className="error">
                  {errors.password.message}
                </span>
              )}

            </div>


            {/* ================= CONFIRM PASSWORD ================= */}

            <div className="input-group">

              <input
                type="password"
                placeholder="Confirm Password"
                autoComplete="new-password"
                {...register("confirmPassword", {

                  required:
                    "Please confirm your password",

                  validate: (value) =>
                    value === watch("password") ||
                    "Passwords do not match",

                })}
              />

              {errors.confirmPassword && (
                <span className="error">
                  {errors.confirmPassword.message}
                </span>
              )}

            </div>


            {/* ================= SERVER MESSAGE ================= */}

            {serverMessage && (
              <p className="server-message">
                {serverMessage}
              </p>
            )}


            {/* ================= SIGN UP BUTTON ================= */}

            <button
              type="submit"
              className="signup-button"
            >
              SIGN UP
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}

export default SignUp;
