import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import "./SignUp.css";
import { api } from "../utils/api";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  const password = watch("password");

  /* =========================================================
     CLEANUP REDIRECT TIMER
  ========================================================= */

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  /* =========================================================
     SUBMIT
  ========================================================= */

  const onSubmit = async (data) => {
    setServerMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(api("/api/auth/signup"), {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          password: data.password,
        }),
      });

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        setServerMessage(
          result.message || "Unable to create account."
        );

        return;
      }

      setServerMessage(
        result.message || "Account created successfully!"
      );

      redirectTimer.current = setTimeout(() => {
        navigate("/signin");
      }, 1200);
    } catch (error) {
      console.error("Signup error:", error);

      setServerMessage(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-card">

        {/* =====================================================
            LEFT / WELCOME SECTION
        ===================================================== */}

        <section
          className="welcome-section"
          aria-label="Welcome"
        >
          <div className="welcome-content">

            {/* BRAND */}

            <div className="signup-brand">
              <span
                className="signup-brand-icon"
                aria-hidden="true"
              >
                IM
              </span>

              <span>Inventory</span>
            </div>

            {/* WELCOME MESSAGE */}

            <h1>Welcome to Inventory!</h1>

            <p>
              Create your account and start managing your
              products, purchases, sales, stock levels, and
              customer accounts.
            </p>

            {/* SIGN IN */}

            <Link
              to="/signin"
              className="signin-button"
            >
              SIGN IN
            </Link>
          </div>
        </section>

        {/* =====================================================
            RIGHT / SIGNUP SECTION
        ===================================================== */}

        <section
          className="signup-section"
          aria-labelledby="signup-title"
        >

          {/* HEADING */}

          <div className="signup-heading">
            <span className="signup-eyebrow">
              INVENTORY MANAGEMENT
            </span>

            <h2 id="signup-title">
              Create Account
            </h2>

            <p>
              Set up your account to start managing your
              inventory.
            </p>
          </div>

          {/* =================================================
              SOCIAL BUTTONS
          ================================================= */}

          <div
            className="social-buttons"
            aria-label="Social sign up options"
          >

            {/* GOOGLE */}

            <button
              type="button"
              aria-label="Continue with Google"
              title="Google signup"
              onClick={() => {
                setServerMessage(
                  "Google signup is not available yet."
                );
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M21.35 12.27c0-.68-.06-1.34-.17-1.97H12v3.73h5.22a4.46 4.46 0 0 1-1.94 2.93v2.44h3.14c1.84-1.7 2.93-4.2 2.93-7.13Z"
                />

                <path
                  fill="currentColor"
                  d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.52A9.75 9.75 0 0 0 12 21.75Z"
                />

                <path
                  fill="currentColor"
                  d="M6.53 13.85a5.85 5.85 0 0 1 0-3.7V7.63H3.28a9.75 9.75 0 0 0 0 8.74l3.25-2.52Z"
                />

                <path
                  fill="currentColor"
                  d="M12 6.12c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.25 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.72 5.38l3.25 2.52C7.3 7.84 9.46 6.12 12 6.12Z"
                />
              </svg>
            </button>

            {/* FACEBOOK */}

            <button
              type="button"
              aria-label="Continue with Facebook"
              title="Facebook signup"
              onClick={() => {
                setServerMessage(
                  "Facebook signup is not available yet."
                );
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.5-1.46h1.7V4c-.3-.04-1.34-.14-2.55-.14-2.53 0-4.26 1.54-4.26 4.37V10H7v3h2.89v8h3.61Z"
                />
              </svg>
            </button>

            {/* GITHUB */}

            <button
              type="button"
              aria-label="Continue with GitHub"
              title="GitHub signup"
              onClick={() => {
                setServerMessage(
                  "GitHub signup is not available yet."
                );
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M12 2.25a9.75 9.75 0 0 0-3.08 19c.49.09.67-.21.67-.47v-1.68c-2.73.59-3.31-1.16-3.31-1.16-.45-1.14-1.1-1.44-1.1-1.44-.9-.61.07-.6.07-.6.99.07 1.52 1.02 1.52 1.02.88 1.52 2.3 1.08 2.86.82.09-.64.35-1.08.63-1.33-2.18-.25-4.47-1.09-4.47-4.86 0-1.07.38-1.94 1.02-2.63-.1-.25-.44-1.25.1-2.6 0 0 .83-.27 2.68 1.01A9.27 9.27 0 0 1 12 6.02c.84 0 1.68.11 2.47.33 1.85-1.28 2.68-1.01 2.68-1.01.54 1.35.2 2.35.1 2.6.64.69 1.02 1.56 1.02 2.63 0 3.78-2.3 4.6-4.49 4.85.36.31.67.92.67 1.85v2.74c0 .26.18.57.68.47A9.75 9.75 0 0 0 12 2.25Z"
                />
              </svg>
            </button>

            {/* LINKEDIN */}

            <button
              type="button"
              aria-label="Continue with LinkedIn"
              title="LinkedIn signup"
              onClick={() => {
                setServerMessage(
                  "LinkedIn signup is not available yet."
                );
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="17"
                height="17"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M5.2 8.2H2V21h3.2V8.2ZM3.6 3A1.9 1.9 0 1 0 3.6 6.8 1.9 1.9 0 0 0 3.6 3ZM21 13.65c0-3.83-2.04-5.61-4.76-5.61-2.2 0-3.18 1.21-3.73 2.06V8.2H9.3V21h3.21v-6.33c0-1.67.32-3.28 2.38-3.28 2.03 0 2.06 1.9 2.06 3.39V21H21v-7.35Z"
                />
              </svg>
            </button>
          </div>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <div className="divider-text">
            <span>
              or use your email for registration
            </span>
          </div>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >

            {/* =================================================
                NAME
            ================================================= */}

            <div
              className={`input-group ${
                errors.name ? "has-error" : ""
              }`}
            >
              <label htmlFor="signup-name">
                Full name
              </label>

              <div className="input-control">
                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  N
                </span>

                <input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your name"
                  autoComplete="name"
                  autoCapitalize="words"
                  autoCorrect="off"
                  spellCheck="false"

                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={
                    errors.name
                      ? "signup-name-error"
                      : undefined
                  }

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
                        return (
                          "Name must be at least 2 characters"
                        );
                      }

                      if (
                        !/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(
                          name
                        )
                      ) {
                        return (
                          "Name can only contain letters and spaces"
                        );
                      }

                      return true;
                    },
                  })}
                />
              </div>

              {errors.name && (
                <span
                  id="signup-name-error"
                  className="error"
                  role="alert"
                >
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div
              className={`input-group ${
                errors.email ? "has-error" : ""
              }`}
            >
              <label htmlFor="signup-email">
                Email address
              </label>

              <div className="input-control">
                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  @
                </span>

                <input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"

                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={
                    errors.email
                      ? "signup-email-error"
                      : undefined
                  }

                  {...register("email", {
                    required: "Email is required",

                    maxLength: {
                      value: 254,
                      message: "Email is too long",
                    },

                    validate: (value) => {
                      const email = value.trim();

                      if (/\s/.test(email)) {
                        return (
                          "Email cannot contain spaces"
                        );
                      }

                      if (
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                          email
                        )
                      ) {
                        return (
                          "Enter a valid email address"
                        );
                      }

                      return true;
                    },
                  })}
                />
              </div>

              {errors.email && (
                <span
                  id="signup-email-error"
                  className="error"
                  role="alert"
                >
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div
              className={`input-group ${
                errors.password ? "has-error" : ""
              }`}
            >
              <label htmlFor="signup-password">
                Password
              </label>

              <div className="input-control">
                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  •
                </span>

                <input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"

                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password
                      ? "signup-password-error"
                      : undefined
                  }

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
                        return (
                          "Password needs a lowercase letter"
                        );
                      }

                      if (!/[A-Z]/.test(value)) {
                        return (
                          "Password needs an uppercase letter"
                        );
                      }

                      if (!/[0-9]/.test(value)) {
                        return (
                          "Password needs a number"
                        );
                      }

                      if (!/[^A-Za-z0-9]/.test(value)) {
                        return (
                          "Password needs a special character"
                        );
                      }

                      return true;
                    },
                  })}
                />
              </div>

              {errors.password && (
                <span
                  id="signup-password-error"
                  className="error"
                  role="alert"
                >
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div
              className={`input-group ${
                errors.confirmPassword
                  ? "has-error"
                  : ""
              }`}
            >
              <label htmlFor="signup-confirm-password">
                Confirm password
              </label>

              <div className="input-control">
                <span
                  className="input-icon"
                  aria-hidden="true"
                >
                  ✓
                </span>

                <input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Enter your password again"
                  autoComplete="new-password"

                  aria-invalid={Boolean(
                    errors.confirmPassword
                  )}
                  aria-describedby={
                    errors.confirmPassword
                      ? "signup-confirm-password-error"
                      : undefined
                  }

                  {...register("confirmPassword", {
                    required:
                      "Please confirm your password",

                    validate: (value) =>
                      value === password ||
                      "Passwords do not match",
                  })}
                />
              </div>

              {errors.confirmPassword && (
                <span
                  id="signup-confirm-password-error"
                  className="error"
                  role="alert"
                >
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>

            {/* =================================================
                SERVER MESSAGE
            ================================================= */}

            {serverMessage && (
              <p
                className="server-message"
                role="status"
                aria-live="polite"
              >
                {serverMessage}
              </p>
            )}

            {/* =================================================
                SUBMIT
            ================================================= */}

            <button
              type="submit"
              className="signup-button"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting
                ? "CREATING ACCOUNT..."
                : "CREATE ACCOUNT"}
            </button>

            {/* =================================================
                MOBILE SIGN IN
            ================================================= */}

            <p className="mobile-signin">
              Already have an account?{" "}
              <Link to="/signin">
                Sign in
              </Link>
            </p>

          </form>
        </section>
      </div>
    </main>
  );
}

export default SignUp;