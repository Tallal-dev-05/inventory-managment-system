import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";

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

  const isEmailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

  const passwordRegister = register("password", {
    required: "Password is required",
  });

  const onSubmit = async (data) => {
    setServerMessage("");
    setPasswordError("");

    const cleanEmail = data.email.trim();
    const enteredPassword = data.password;

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      setPasswordError("Please enter email first");
      return;
    }

    const loginData = {
      email: cleanEmail,
      password: enteredPassword,
    };

    try {
      const response = await fetch(
        api("/api/auth/signin"),
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

      if (!response.ok) {
        setServerMessage(
          result.message || "Login failed"
        );
        return;
      }

      if (!result || !result.user) {
        setServerMessage(
          result?.message || "Login failed"
        );
        return;
      }

      if (result.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/items");
      }
    } catch {
      setServerMessage(
        "Unable to connect to the server"
      );
    }
  };

  return (
    <main
      className="
        relative flex min-h-screen w-full items-center
        justify-center overflow-hidden
        bg-[#090c12] p-4
        text-[#f3f4f8]
        font-['Inter',-apple-system,BlinkMacSystemFont,'Segoe_UI',Arial,sans-serif]

        max-[760px]:items-start
        max-[760px]:overflow-y-auto
        max-[760px]:p-4

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
          TOP RIGHT GLOW
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
      ===================================================== */}

      <div
        className="
          relative z-10 grid
          min-h-[560px]
          w-[min(980px,100%)]
          overflow-hidden

          rounded-[20px]

          border border-[#252c3d]

          bg-[#111620]

          shadow-[0_30px_90px_rgba(0,0,0,0.55),0_10px_35px_rgba(0,0,0,0.25)]

          animate-[signin-card-enter_0.55s_ease-out_both]

          grid-cols-[minmax(360px,0.88fr)_minmax(480px,1.12fr)]

          [zoom:0.73]

          max-[950px]:w-[min(900px,100%)]
          max-[950px]:grid-cols-[minmax(300px,0.85fr)_minmax(420px,1.15fr)]

          max-[760px]:flex
          max-[760px]:min-h-0
          max-[760px]:w-full
          max-[760px]:max-w-[500px]
          max-[760px]:flex-col

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
            LEFT / SIGN IN
        =================================================== */}

        <section
          aria-labelledby="signin-title"
          className="
            relative flex min-w-0
            flex-col justify-center

            bg-[radial-gradient(circle_at_100%_0%,rgba(104,101,245,0.08),transparent_300px),#111620]

            px-[55px] py-[30px]

            max-[950px]:px-[35px]
            max-[950px]:py-[30px]

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
              mb-[15px]
              animate-[signin-content-enter_460ms_ease-out_80ms_both]
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
              id="signin-title"
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
              Sign In
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
              Welcome back to your inventory.
            </p>
          </div>


          {/* =================================================
              SOCIAL BUTTONS
          ================================================= */}

          <div
            aria-label="Social sign in options"
            className="
              mb-[14px]
              flex items-center gap-[9px]

              animate-[signin-content-enter_460ms_ease-out_130ms_both]

              max-[440px]:gap-[7px]
            "
          >

            {/* GOOGLE */}

            <button
              type="button"
              aria-label="Continue with Google"
              title="Google signin"
              onClick={() =>
                setServerMessage(
                  "Google signin is not available yet."
                )
              }
              className="
                grid h-[38px] w-12
                place-items-center
                rounded-[9px]

                border border-[#252c3d]

                bg-[#0e131c]

                p-0

                text-[11px]
                font-bold
                text-[#a3abc0]

                shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]

                transition-all duration-200

                hover:-translate-y-0.5
                hover:border-[#4844a8]
                hover:bg-[#181d30]
                hover:text-[#aaa8ff]

                hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)]

                active:translate-y-0

                max-[440px]:h-[36px]
                max-[440px]:w-[43px]
                max-[440px]:rounded-lg
              "
            >
              G
            </button>


            {/* FACEBOOK */}

            <button
              type="button"
              aria-label="Continue with Facebook"
              title="Facebook signin"
              onClick={() =>
                setServerMessage(
                  "Facebook signin is not available yet."
                )
              }
              className="
                grid h-[38px] w-12
                place-items-center
                rounded-[9px]

                border border-[#252c3d]

                bg-[#0e131c]

                p-0

                text-[11px]
                font-bold
                text-[#a3abc0]

                shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]

                transition-all duration-200

                hover:-translate-y-0.5
                hover:border-[#4844a8]
                hover:bg-[#181d30]
                hover:text-[#aaa8ff]

                active:translate-y-0

                max-[440px]:h-[36px]
                max-[440px]:w-[43px]
                max-[440px]:rounded-lg
              "
            >
              f
            </button>


            {/* GITHUB */}

            <button
              type="button"
              aria-label="Continue with GitHub"
              title="GitHub signin"
              onClick={() =>
                setServerMessage(
                  "GitHub signin is not available yet."
                )
              }
              className="
                grid h-[38px] w-12
                place-items-center
                rounded-[9px]

                border border-[#252c3d]

                bg-[#0e131c]

                p-0

                text-[11px]
                font-bold
                text-[#a3abc0]

                shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]

                transition-all duration-200

                hover:-translate-y-0.5
                hover:border-[#4844a8]
                hover:bg-[#181d30]
                hover:text-[#aaa8ff]

                active:translate-y-0

                max-[440px]:h-[36px]
                max-[440px]:w-[43px]
                max-[440px]:rounded-lg
              "
            >
              ◉
            </button>


            {/* LINKEDIN */}

            <button
              type="button"
              aria-label="Continue with LinkedIn"
              title="LinkedIn signin"
              onClick={() =>
                setServerMessage(
                  "LinkedIn signin is not available yet."
                )
              }
              className="
                grid h-[38px] w-12
                place-items-center
                rounded-[9px]

                border border-[#252c3d]

                bg-[#0e131c]

                p-0

                text-[11px]
                font-bold
                text-[#a3abc0]

                shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]

                transition-all duration-200

                hover:-translate-y-0.5
                hover:border-[#4844a8]
                hover:bg-[#181d30]
                hover:text-[#aaa8ff]

                active:translate-y-0

                max-[440px]:h-[36px]
                max-[440px]:w-[43px]
                max-[440px]:rounded-lg
              "
            >
              in
            </button>

          </div>


          {/* =================================================
              DIVIDER
          ================================================= */}

          <div
            className="
              mb-[14px]

              flex items-center gap-3

              whitespace-nowrap

              text-[10px]
              text-[#667089]

              animate-[signin-content-enter_460ms_ease-out_170ms_both]

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

              max-[440px]:text-[9px]
            "
          >
            <span>
              or use your email and password
            </span>
          </div>


          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="
              w-full

              animate-[signin-content-enter_460ms_ease-out_220ms_both]
            "
          >

            {/* =================================================
                EMAIL
            ================================================= */}

            <div className="mb-[10px] w-full">

              <label
                htmlFor="signin-email"
                className="
                  mb-[4px]
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
                    absolute
                    left-[13px]
                    top-1/2
                    z-10

                    grid
                    h-[27px]
                    w-[27px]

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
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
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
                  className={`
                    block

                    h-[40px]
                    w-full

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

                    ${
                      errors.email
                        ? "border-[#633440] focus:border-[#f46b78] focus:shadow-[0_0_0_3px_rgba(244,107,120,0.11)]"
                        : "border-[#252c3d]"
                    }

                    max-[440px]:h-[38px]
                    max-[440px]:pl-12
                    max-[440px]:text-[11px]
                  `}
                />

              </div>

              {errors.email && (
                <span
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
                  {errors.email.message}
                </span>
              )}

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="mb-[10px] w-full">

              <label
                htmlFor="signin-password"
                className="
                  mb-[4px]
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
                    absolute
                    left-[13px]
                    top-1/2
                    z-10

                    grid
                    h-[27px]
                    w-[27px]

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
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
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
                  className={`
                    block

                    h-[40px]
                    w-full

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

                    ${
                      errors.password || passwordError
                        ? "border-[#633440] focus:border-[#f46b78] focus:shadow-[0_0_0_3px_rgba(244,107,120,0.11)]"
                        : "border-[#252c3d]"
                    }

                    max-[440px]:h-[38px]
                    max-[440px]:pl-12
                    max-[440px]:text-[11px]
                  `}
                />

              </div>

              {errors.password && !passwordError && (
                <span
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
                  {errors.password.message}
                </span>
              )}

              {passwordError && (
                <span
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
                  {passwordError}
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
                SIGN IN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="
                mt-3

                flex
                h-[40px]
                w-full

                items-center
                justify-center

                rounded-[9px]

                border border-[#6865f5]

                bg-gradient-to-br
                from-[#6d69ff]
                to-[#625ef0]

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

                max-[440px]:h-[40px]
                max-[440px]:text-[10px]
              "
            >
              SIGN IN
            </button>

          </form>

        </section>


        {/* ===================================================
            RIGHT / HELLO SECTION
        =================================================== */}

        <section
          aria-label="Welcome"
          className="
            relative flex min-w-0

            items-center
            justify-center

            overflow-hidden

            px-[35px]
            py-[30px]

            text-center
            text-white

            bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,0.14),transparent_190px),radial-gradient(circle_at_90%_90%,rgba(30,20,150,0.25),transparent_260px),linear-gradient(145deg,#5551d1_0%,#6865f5_48%,#4d49c3_100%)]

            max-[950px]:px-[25px]
            max-[950px]:py-[30px]

            max-[760px]:order-first
            max-[760px]:min-h-[235px]
            max-[760px]:px-[25px]
            max-[760px]:pb-[38px]
            max-[760px]:pt-[35px]

            max-[440px]:min-h-[210px]
            max-[440px]:px-[18px]
            max-[440px]:pb-[30px]
            max-[440px]:pt-[27px]
          "
        >

          {/* Decorative circle */}

          <div
            className="
              pointer-events-none absolute

              -left-[190px]
              -top-[190px]

              h-[390px]
              w-[390px]

              rounded-full

              border border-[rgba(255,255,255,0.13)]
            "
          />

          {/* Decorative circle */}

          <div
            className="
              pointer-events-none absolute

              -bottom-[220px]
              -right-[220px]

              h-[420px]
              w-[420px]

              rounded-full

              border border-[rgba(255,255,255,0.11)]
            "
          />

          {/* Inner ring */}

          <div
            className="
              pointer-events-none absolute

              left-1/2
              top-1/2

              h-[240px]
              w-[240px]

              -translate-x-1/2
              -translate-y-1/2

              rounded-full

              border border-[rgba(255,255,255,0.05)]
            "
          />


          {/* =================================================
              HELLO CONTENT
          ================================================= */}

          <div
            className="
              relative z-10

              w-full
              max-w-[340px]

              animate-[signin-content-enter_460ms_ease-out_100ms_both]

              max-[760px]:max-w-[390px]
            "
          >

            <div
              className="
                mb-[27px]

                inline-flex
                items-center
                justify-center
                gap-[11px]

                text-[16px]
                font-extrabold

                tracking-[-0.2px]

                max-[760px]:mb-[21px]
                max-[760px]:text-sm

                max-[440px]:mb-[18px]
                max-[440px]:text-[13px]
              "
            >

              <span
                aria-hidden="true"
                className="
                  grid

                  h-[42px]
                  w-[42px]

                  place-items-center

                  rounded-[11px]

                  border border-[rgba(255,255,255,0.25)]

                  bg-[rgba(255,255,255,0.12)]

                  text-[11px]
                  font-black

                  shadow-[0_12px_30px_rgba(30,20,120,0.22),inset_0_1px_0_rgba(255,255,255,0.15)]

                  backdrop-blur-lg

                  max-[760px]:h-9
                  max-[760px]:w-9
                  max-[760px]:rounded-[9px]

                  max-[440px]:h-8
                  max-[440px]:w-8
                  max-[440px]:rounded-lg
                "
              >
                IM
              </span>

              <span>
                Inventory
              </span>

            </div>


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
              Hello, Friend!
            </h1>


            <p
              className="
                relative z-10

                mx-auto
                mb-[25px]

                max-w-[310px]

                text-[13px]

                font-[450]

                leading-[1.7]

                text-[rgba(255,255,255,0.76)]

                max-[760px]:mb-[20px]
                max-[760px]:max-w-[350px]
                max-[760px]:text-[11px]

                max-[440px]:mb-[18px]
                max-[440px]:text-[10px]
                max-[440px]:leading-[1.6]
              "
            >
              Register with your personal details to
              use all of the inventory features.
            </p>


            <Link
              to="/SignUp"
              className="
                relative z-10

                inline-flex

                h-[40px]
                min-w-[150px]

                items-center
                justify-center

                rounded-[9px]

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

                transition-all duration-200

                hover:-translate-y-0.5
                hover:border-white
                hover:bg-white
                hover:text-[#5652cf]

                hover:shadow-[0_12px_30px_rgba(25,20,100,0.28)]

                active:translate-y-0

                max-[760px]:h-[42px]
                max-[760px]:min-w-[135px]
                max-[760px]:text-[10px]

                max-[440px]:h-[39px]
                max-[440px]:min-w-[125px]
                max-[440px]:text-[9px]
              "
            >
              SIGN UP
            </Link>

          </div>

        </section>

      </div>


      {/* =====================================================
          ANIMATION KEYFRAMES
      ===================================================== */}

      <style>{`
        @keyframes signin-card-enter {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes signin-content-enter {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
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

export default SignIn;