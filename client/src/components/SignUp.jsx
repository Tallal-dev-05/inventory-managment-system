import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

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

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

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
    <main
      className="
        relative flex min-h-screen w-full items-center justify-center
        overflow-hidden bg-[#090c12] p-8
        text-[#f3f4f8]
        max-[950px]:p-[22px]
        max-[760px]:items-start max-[760px]:overflow-y-auto max-[760px]:p-4
        max-[440px]:p-[9px]
      "
    >
      {/* =====================================================
          BACKGROUND GRID
      ===================================================== */}

      <div
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)]
          [background-size:44px_44px]
          [mask-image:linear-gradient(to_bottom,#000_0%,rgba(0,0,0,0.65)_55%,transparent_100%)]
        "
      />

      {/* =====================================================
          TOP RIGHT AMBIENT GLOW
      ===================================================== */}

      <div
        className="
          pointer-events-none absolute
          -right-[220px] -top-[280px]
          h-[520px] w-[520px]
          rounded-full
          bg-[rgba(104,101,245,0.05)]
          blur-[80px]
        "
      />

      {/* =====================================================
          MAIN CARD
          ONLY CHANGE: [zoom:0.85]
      ===================================================== */}

      <div
        className="
          relative z-10 grid
          min-h-[620px]
          w-[min(1040px,100%)]
          overflow-hidden
          rounded-[20px]
          border border-[#252c3d]
          bg-[#111620]
          shadow-[0_30px_90px_rgba(0,0,0,0.55),0_10px_35px_rgba(0,0,0,0.25)]
          animate-[signup-card-enter_0.55s_ease-out_both]

          grid-cols-[minmax(360px,0.88fr)_minmax(480px,1.12fr)]

          [zoom:0.73]

          max-[950px]:w-[min(900px,100%)]
          max-[950px]:grid-cols-[minmax(300px,0.85fr)_minmax(420px,1.15fr)]

          max-[760px]:flex
          max-[760px]:min-h-0
          max-[760px]:w-full
          max-[760px]:max-w-[500px]
          max-[760px]:flex-col
          max-[760px]:rounded-2xl
          max-[760px]:[zoom:1]

          max-[440px]:rounded-[13px]

          motion-reduce:animate-none
        "
      >
        {/* ===================================================
            CARD HIGHLIGHT
        =================================================== */}

        <div
          className="
            pointer-events-none absolute inset-0 z-20
            rounded-[inherit]
            shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]
          "
        />

        {/* ===================================================
            LEFT / WELCOME SECTION
        =================================================== */}

        <section
          aria-label="Welcome"
          className="
            relative flex min-w-0
            items-center justify-center
            overflow-hidden
            px-[45px] py-[55px]
            text-center text-white

            bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.14),transparent_190px),radial-gradient(circle_at_90%_90%,rgba(30,20,150,0.25),transparent_260px),linear-gradient(145deg,#5551d1_0%,#6865f5_48%,#4d49c3_100%)]

            max-[950px]:px-[30px] max-[950px]:py-[45px]

            max-[760px]:min-h-[270px]
            max-[760px]:px-[25px]
            max-[760px]:pb-[38px]
            max-[760px]:pt-[35px]

            max-[440px]:min-h-[235px]
            max-[440px]:px-[18px]
            max-[440px]:pb-[30px]
            max-[440px]:pt-[27px]
          "
        >
          {/* Decorative circles */}

          <div
            className="
              pointer-events-none absolute
              -left-[190px] -top-[190px]
              h-[390px] w-[390px]
              rounded-full
              border border-[rgba(255,255,255,0.13)]
            "
          />

          <div
            className="
              pointer-events-none absolute
              -bottom-[220px] -right-[220px]
              h-[420px] w-[420px]
              rounded-full
              border border-[rgba(255,255,255,0.11)]
            "
          />

          {/* Inner ring */}

          <div
            className="
              pointer-events-none absolute
              left-1/2 top-1/2
              h-[240px] w-[240px]
              -translate-x-1/2 -translate-y-1/2
              rounded-full
              border border-[rgba(255,255,255,0.05)]
            "
          />

          {/* =================================================
              WELCOME CONTENT
          ================================================= */}

          <div
            className="
              relative z-10
              w-full max-w-[340px]

              max-[760px]:max-w-[390px]
            "
          >
            {/* BRAND */}

            <div
              className="
                relative z-10
                mb-[44px]
                inline-flex
                items-center
                justify-center
                gap-[11px]
                text-[16px]
                font-extrabold
                tracking-[-0.2px]

                max-[760px]:mb-[27px]
                max-[760px]:text-sm

                max-[440px]:mb-[21px]
                max-[440px]:text-[13px]
              "
            >
              <span
                aria-hidden="true"
                className="
                  grid h-[42px] w-[42px]
                  place-items-center
                  rounded-[11px]
                  border border-[rgba(255,255,255,0.25)]
                  bg-[rgba(255,255,255,0.12)]
                  text-[11px]
                  font-black
                  shadow-[0_12px_30px_rgba(30,20,120,0.22),inset_0_1px_0_rgba(255,255,255,0.15)]
                  backdrop-blur-lg

                  max-[760px]:h-9 max-[760px]:w-9
                  max-[760px]:rounded-[9px]

                  max-[440px]:h-8 max-[440px]:w-8
                  max-[440px]:rounded-lg
                "
              >
                IM
              </span>

              <span>Inventory</span>
            </div>

            {/* WELCOME HEADING */}

            <h1
              className="
                relative z-10
                mb-[15px]
                text-[clamp(30px,3vw,40px)]
                font-[850]
                leading-[1.1]
                tracking-[-1.5px]

                max-[760px]:text-[28px]
                max-[760px]:tracking-[-1px]

                max-[440px]:mb-[10px]
                max-[440px]:text-2xl
              "
            >
              Welcome to Inventory!
            </h1>

            {/* DESCRIPTION */}

            <p
              className="
                relative z-10
                mx-auto mb-[34px]
                max-w-[310px]
                text-[13px]
                font-[450]
                leading-[1.7]
                text-[rgba(255,255,255,0.76)]

                max-[760px]:mb-[25px]
                max-[760px]:max-w-[350px]
                max-[760px]:text-[11px]

                max-[440px]:mb-[21px]
                max-[440px]:text-[10px]
                max-[440px]:leading-[1.6]
              "
            >
              Create your account and start managing your
              products, purchases, sales, stock levels, and
              customer accounts.
            </p>

            {/* SIGN IN */}

            <Link
              to="/signin"
              className="
                relative z-10
                inline-flex
                h-[46px]
                min-w-[150px]
                items-center
                justify-center
                rounded-[10px]
                border border-[rgba(255,255,255,0.45)]
                bg-[rgba(255,255,255,0.07)]
                px-[25px]
                text-[11px]
                font-extrabold
                tracking-[0.7px]
                text-white
                no-underline
                shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]
                backdrop-blur-md
                transition-all duration-200 ease-out
                hover:-translate-y-0.5
                hover:border-white
                hover:bg-white
                hover:text-[#5652cf]
                hover:shadow-[0_12px_30px_rgba(25,20,100,0.28)]
                active:translate-y-0
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-[rgba(104,101,245,0.6)]
                focus-visible:outline-offset-3

                max-[760px]:h-[42px]
                max-[760px]:min-w-[135px]
                max-[760px]:text-[10px]

                max-[440px]:h-[39px]
                max-[440px]:min-w-[125px]
                max-[440px]:text-[9px]

                max-[760px]:hover:translate-y-0
              "
            >
              SIGN IN
            </Link>
          </div>
        </section>

        {/* ===================================================
            RIGHT / SIGNUP SECTION
        =================================================== */}

        <section
          aria-labelledby="signup-title"
          className="
            relative flex min-w-0
            flex-col justify-center
            bg-[radial-gradient(circle_at_100%_0%,rgba(104,101,245,0.08),transparent_300px),#111620]
            px-[72px] py-[55px]

            max-[950px]:px-[45px]
            max-[950px]:py-[45px]

            max-[760px]:px-[30px]
            max-[760px]:pb-[34px]
            max-[760px]:pt-[38px]

            max-[440px]:px-5
            max-[440px]:pb-[27px]
            max-[440px]:pt-[30px]
          "
        >
          {/* =================================================
              HEADING
          ================================================= */}

          <div
            className="
              mb-[23px]

              max-[440px]:mb-[19px]
            "
          >
            <span
              className="
                mb-[9px]
                block
                text-[10px]
                font-extrabold
                uppercase
                tracking-[1.3px]
                text-[#aaa8ff]

                max-[760px]:text-[9px]
              "
            >
              INVENTORY MANAGEMENT
            </span>

            <h2
              id="signup-title"
              className="
                m-0
                text-[30px]
                font-[850]
                leading-[1.15]
                tracking-[-1px]
                text-[#f3f4f8]

                max-[760px]:text-[25px]
                max-[440px]:text-[22px]
              "
            >
              Create Account
            </h2>

            <p
              className="
                mt-[9px]
                text-[12px]
                leading-[1.55]
                text-[#7d879d]

                max-[760px]:text-[11px]
                max-[440px]:text-[10px]
              "
            >
              Set up your account to start managing your
              inventory.
            </p>
          </div>

          {/* =================================================
              SOCIAL BUTTONS
          ================================================= */}

          <div
            aria-label="Social sign up options"
            className="
              mb-[21px]
              flex items-center gap-[9px]

              max-[440px]:mb-[18px]
              max-[440px]:gap-[7px]
            "
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
              className="
                grid h-[43px] w-12
                place-items-center
                rounded-[9px]
                border border-[#252c3d]
                bg-[#0e131c]
                p-0
                text-[#a3abc0]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-[#4844a8]
                hover:bg-[#181d30]
                hover:text-[#aaa8ff]
                hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]
                active:translate-y-0
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-[rgba(104,101,245,0.6)]
                focus-visible:outline-offset-3

                max-[440px]:h-[39px]
                max-[440px]:w-[43px]
                max-[440px]:rounded-lg
              "
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
              className="
                grid h-[43px] w-12
                place-items-center
                rounded-[9px]
                border border-[#252c3d]
                bg-[#0e131c]
                p-0
                text-[#a3abc0]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-[#4844a8]
                hover:bg-[#181d30]
                hover:text-[#aaa8ff]
                hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]
                active:translate-y-0
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-[rgba(104,101,245,0.6)]
                focus-visible:outline-offset-3

                max-[440px]:h-[39px]
                max-[440px]:w-[43px]
                max-[440px]:rounded-lg
              "
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
              className="
                grid h-[43px] w-12
                place-items-center
                rounded-[9px]
                border border-[#252c3d]
                bg-[#0e131c]
                p-0
                text-[#a3abc0]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-[#4844a8]
                hover:bg-[#181d30]
                hover:text-[#aaa8ff]
                hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]
                active:translate-y-0
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-[rgba(104,101,245,0.6)]
                focus-visible:outline-offset-3

                max-[440px]:h-[39px]
                max-[440px]:w-[43px]
                max-[440px]:rounded-lg
              "
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
              className="
                grid h-[43px] w-12
                place-items-center
                rounded-[9px]
                border border-[#252c3d]
                bg-[#0e131c]
                p-0
                text-[#a3abc0]
                shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-[#4844a8]
                hover:bg-[#181d30]
                hover:text-[#aaa8ff]
                hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]
                active:translate-y-0
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-[rgba(104,101,245,0.6)]
                focus-visible:outline-offset-3

                max-[440px]:h-[39px]
                max-[440px]:w-[43px]
                max-[440px]:rounded-lg
              "
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

          <div
            className="
              mb-[21px]
              flex items-center gap-3
              whitespace-nowrap
              text-[10px]
              text-[#667089]

              max-[440px]:mb-[18px]
              max-[440px]:text-[9px]

              before:h-px
              before:flex-1
              before:bg-gradient-to-r
              before:from-transparent
              before:to-[#252c3d]

              after:h-px
              after:flex-1
              after:bg-gradient-to-r
              after:from-[#252c3d]
              after:to-transparent
            "
          >
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
            className="w-full"
          >
            {/* =================================================
                NAME
            ================================================= */}

            <div
              className="
                mb-[15px] w-full

                max-[440px]:mb-[13px]
              "
            >
              <label
                htmlFor="signup-name"
                className="
                  mb-[7px]
                  block
                  text-[11px]
                  font-bold
                  tracking-[-0.05px]
                  text-[#c2c8d6]

                  max-[440px]:text-[10px]
                "
              >
                Full name
              </label>

              <div className="relative w-full">
                <span
                  aria-hidden="true"
                  className="
                    absolute left-[13px] top-1/2 z-10
                    grid h-[27px] w-[27px]
                    -translate-y-1/2
                    place-items-center
                    rounded-[7px]
                    border border-[rgba(255,255,255,0.03)]
                    bg-[#1d2340]
                    text-[10px]
                    font-extrabold
                    text-[#9692ff]
                    pointer-events-none

                    max-[440px]:left-[11px]
                    max-[440px]:h-[25px]
                    max-[440px]:w-[25px]
                  "
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
                  className={`
                    block h-[46px] w-full
                    rounded-[9px]
                    border
                    bg-[#0b1018]
                    px-[14px]
                    pl-[51px]
                    text-[12px]
                    text-[#f3f4f8]
                    outline-none
                    caret-[#aaa8ff]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]
                    transition-all duration-200
                    placeholder:text-[#596277]
                    hover:border-[#343d55]
                    focus:-translate-y-px
                    focus:border-[#6865f5]
                    focus:bg-[#0e131d]
                    focus:shadow-[0_0_0_3px_rgba(104,101,245,0.11),inset_0_1px_0_rgba(255,255,255,0.02)]
                    focus-visible:outline-2
                    focus-visible:outline-[rgba(104,101,245,0.6)]
                    focus-visible:outline-offset-3

                    ${
                      errors.name
                        ? "border-[#633440] focus:border-[#f46b78] focus:shadow-[0_0_0_3px_rgba(244,107,120,0.11)]"
                        : "border-[#252c3d]"
                    }

                    max-[440px]:h-[43px]
                    max-[440px]:pl-12
                    max-[440px]:text-[11px]
                  `}
                />
              </div>

              {errors.name && (
                <span
                  id="signup-name-error"
                  className="
                    mt-[5px]
                    ml-[3px]
                    block
                    text-[10px]
                    font-semibold
                    leading-[1.4]
                    text-[#f46b78]
                  "
                  role="alert"
                >
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="mb-[15px] w-full max-[440px]:mb-[13px]">
              <label
                htmlFor="signup-email"
                className="
                  mb-[7px]
                  block
                  text-[11px]
                  font-bold
                  text-[#c2c8d6]

                  max-[440px]:text-[10px]
                "
              >
                Email address
              </label>

              <div className="relative w-full">
                <span
                  aria-hidden="true"
                  className="
                    absolute left-[13px] top-1/2 z-10
                    grid h-[27px] w-[27px]
                    -translate-y-1/2
                    place-items-center
                    rounded-[7px]
                    border border-[rgba(255,255,255,0.03)]
                    bg-[#1d2340]
                    text-[10px]
                    font-extrabold
                    text-[#9692ff]
                    pointer-events-none

                    max-[440px]:left-[11px]
                    max-[440px]:h-[25px]
                    max-[440px]:w-[25px]
                  "
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
                        return "Email cannot contain spaces";
                      }

                      if (
                        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                          email
                        )
                      ) {
                        return "Enter a valid email address";
                      }

                      return true;
                    },
                  })}
                  className={`
                    block h-[46px] w-full
                    rounded-[9px]
                    border
                    bg-[#0b1018]
                    px-[14px]
                    pl-[51px]
                    text-[12px]
                    text-[#f3f4f8]
                    outline-none
                    caret-[#aaa8ff]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]
                    transition-all duration-200
                    placeholder:text-[#596277]
                    hover:border-[#343d55]
                    focus:-translate-y-px
                    focus:border-[#6865f5]
                    focus:bg-[#0e131d]
                    focus:shadow-[0_0_0_3px_rgba(104,101,245,0.11),inset_0_1px_0_rgba(255,255,255,0.02)]
                    focus-visible:outline-2
                    focus-visible:outline-[rgba(104,101,245,0.6)]
                    focus-visible:outline-offset-3

                    ${
                      errors.email
                        ? "border-[#633440] focus:border-[#f46b78] focus:shadow-[0_0_0_3px_rgba(244,107,120,0.11)]"
                        : "border-[#252c3d]"
                    }

                    max-[440px]:h-[43px]
                    max-[440px]:pl-12
                    max-[440px]:text-[11px]
                  `}
                />
              </div>

              {errors.email && (
                <span
                  id="signup-email-error"
                  className="
                    mt-[5px] ml-[3px]
                    block
                    text-[10px]
                    font-semibold
                    leading-[1.4]
                    text-[#f46b78]
                  "
                  role="alert"
                >
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="mb-[15px] w-full max-[440px]:mb-[13px]">
              <label
                htmlFor="signup-password"
                className="
                  mb-[7px]
                  block
                  text-[11px]
                  font-bold
                  text-[#c2c8d6]

                  max-[440px]:text-[10px]
                "
              >
                Password
              </label>

              <div className="relative w-full">
                <span
                  aria-hidden="true"
                  className="
                    absolute left-[13px] top-1/2 z-10
                    grid h-[27px] w-[27px]
                    -translate-y-1/2
                    place-items-center
                    rounded-[7px]
                    border border-[rgba(255,255,255,0.03)]
                    bg-[#1d2340]
                    text-[10px]
                    font-extrabold
                    text-[#9692ff]
                    pointer-events-none

                    max-[440px]:left-[11px]
                    max-[440px]:h-[25px]
                    max-[440px]:w-[25px]
                  "
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
                  className={`
                    block h-[46px] w-full
                    rounded-[9px]
                    border
                    bg-[#0b1018]
                    px-[14px]
                    pl-[51px]
                    text-[12px]
                    text-[#f3f4f8]
                    outline-none
                    caret-[#aaa8ff]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]
                    transition-all duration-200
                    placeholder:text-[#596277]
                    hover:border-[#343d55]
                    focus:-translate-y-px
                    focus:border-[#6865f5]
                    focus:bg-[#0e131d]
                    focus:shadow-[0_0_0_3px_rgba(104,101,245,0.11),inset_0_1px_0_rgba(255,255,255,0.02)]
                    focus-visible:outline-2
                    focus-visible:outline-[rgba(104,101,245,0.6)]
                    focus-visible:outline-offset-3

                    ${
                      errors.password
                        ? "border-[#633440] focus:border-[#f46b78] focus:shadow-[0_0_0_3px_rgba(244,107,120,0.11)]"
                        : "border-[#252c3d]"
                    }

                    max-[440px]:h-[43px]
                    max-[440px]:pl-12
                    max-[440px]:text-[11px]
                  `}
                />
              </div>

              {errors.password && (
                <span
                  id="signup-password-error"
                  className="
                    mt-[5px] ml-[3px]
                    block
                    text-[10px]
                    font-semibold
                    leading-[1.4]
                    text-[#f46b78]
                  "
                  role="alert"
                >
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}

            <div className="mb-[15px] w-full max-[440px]:mb-[13px]">
              <label
                htmlFor="signup-confirm-password"
                className="
                  mb-[7px]
                  block
                  text-[11px]
                  font-bold
                  text-[#c2c8d6]

                  max-[440px]:text-[10px]
                "
              >
                Confirm password
              </label>

              <div className="relative w-full">
                <span
                  aria-hidden="true"
                  className="
                    absolute left-[13px] top-1/2 z-10
                    grid h-[27px] w-[27px]
                    -translate-y-1/2
                    place-items-center
                    rounded-[7px]
                    border border-[rgba(255,255,255,0.03)]
                    bg-[#1d2340]
                    text-[10px]
                    font-extrabold
                    text-[#9692ff]
                    pointer-events-none

                    max-[440px]:left-[11px]
                    max-[440px]:h-[25px]
                    max-[440px]:w-[25px]
                  "
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
                  className={`
                    block h-[46px] w-full
                    rounded-[9px]
                    border
                    bg-[#0b1018]
                    px-[14px]
                    pl-[51px]
                    text-[12px]
                    text-[#f3f4f8]
                    outline-none
                    caret-[#aaa8ff]
                    shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]
                    transition-all duration-200
                    placeholder:text-[#596277]
                    hover:border-[#343d55]
                    focus:-translate-y-px
                    focus:border-[#6865f5]
                    focus:bg-[#0e131d]
                    focus:shadow-[0_0_0_3px_rgba(104,101,245,0.11),inset_0_1px_0_rgba(255,255,255,0.02)]
                    focus-visible:outline-2
                    focus-visible:outline-[rgba(104,101,245,0.6)]
                    focus-visible:outline-offset-3

                    ${
                      errors.confirmPassword
                        ? "border-[#633440] focus:border-[#f46b78] focus:shadow-[0_0_0_3px_rgba(244,107,120,0.11)]"
                        : "border-[#252c3d]"
                    }

                    max-[440px]:h-[43px]
                    max-[440px]:pl-12
                    max-[440px]:text-[11px]
                  `}
                />
              </div>

              {errors.confirmPassword && (
                <span
                  id="signup-confirm-password-error"
                  className="
                    mt-[5px] ml-[3px]
                    block
                    text-[10px]
                    font-semibold
                    leading-[1.4]
                    text-[#f46b78]
                  "
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
                role="status"
                aria-live="polite"
                className="
                  my-[6px]
                  mb-3
                  rounded-lg
                  border border-[#075844]
                  bg-[rgba(7,55,45,0.8)]
                  px-3
                  py-[10px]
                  text-[10px]
                  font-semibold
                  leading-[1.45]
                  text-[#00c995]
                "
              >
                {serverMessage}
              </p>
            )}

            {/* =================================================
                SUBMIT BUTTON
            ================================================= */}

            <button
              type="submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="
                mt-2
                flex h-[47px]
                w-full
                items-center
                justify-center
                rounded-[9px]
                border border-[#6865f5]
                bg-gradient-to-br from-[#6d69ff] to-[#625ef0]
                px-[18px]
                text-[11px]
                font-[850]
                tracking-[0.6px]
                text-white
                shadow-[0_9px_25px_rgba(104,101,245,0.2),inset_0_1px_0_rgba(255,255,255,0.1)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:border-[#7774ff]
                hover:bg-gradient-to-br
                hover:from-[#7a76ff]
                hover:to-[#6d69f5]
                hover:shadow-[0_13px_32px_rgba(104,101,245,0.28),inset_0_1px_0_rgba(255,255,255,0.12)]
                active:translate-y-0
                active:shadow-[0_7px_18px_rgba(104,101,245,0.2)]
                disabled:cursor-not-allowed
                disabled:opacity-60
                disabled:transform-none
                focus-visible:outline
                focus-visible:outline-2
                focus-visible:outline-[rgba(104,101,245,0.6)]
                focus-visible:outline-offset-3

                max-[440px]:h-[44px]
                max-[440px]:text-[10px]

                max-[760px]:hover:translate-y-0
              "
            >
              {isSubmitting
                ? "CREATING ACCOUNT..."
                : "CREATE ACCOUNT"}
            </button>

            {/* =================================================
                MOBILE SIGN IN
            ================================================= */}

            <p
              className="
                mt-[17px]
                hidden
                text-center
                text-[10px]
                text-[#7d879d]

                max-[760px]:block
              "
            >
              Already have an account?{" "}
              <Link
                to="/signin"
                className="
                  font-bold
                  text-[#aaa8ff]
                  no-underline
                  hover:underline
                "
              >
                Sign in
              </Link>
            </p>
          </form>
        </section>
      </div>

      {/* =====================================================
          ANIMATION
      ===================================================== */}

      <style>{`
        @keyframes signup-card-enter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}

export default SignUp;