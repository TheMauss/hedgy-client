module.exports = {
  mode: "jit",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        customGreen: "#22c55e",
        base: "#000000",
        "layer-1": "#151722",
        "layer-3": "#434665",
        "layer-2": "#1d202f",
        "gray-500": "#9E9E9E",
        grey: "#434665",
        basic: "#ffffff60",
        white: "#fff",
        "grey-text": "#a9aab7",
        short: "#FF3E3E",
        primary: "#23EAA4",
        primarys: "#23eaa460",
        deepskyblue: "#58b9ff",
        tomato: {
          100: "#ff4d4d",
          200: "rgba(255, 76, 76, 0.05)",
        },
        fuchsia: "#fb51ff",
        goldenrod: "#ffbc58",
        palegreen: "#8fff74",
        mediumpurple: "#b080ff",
        gray: "#77787e",
        lightseagreen: "#26a69a",
        silver: "#b2b5be",
        darkslategray: "#434651",
        mediumseagreen: "#29b577",
        base: "#000000",
        black: "#000",
        royalblue: "#3470f3",
        blueviolet: "#9747ff",
        mediumspringgreen: "rgba(35, 234, 164, 0.05)",
        lightsteelblue: "#b4b5c7",
        "new-card-bg": "#14141465",
        "new-green": "#43e3ae",
        "new-green-dark": "#2b9974",
        "new-red-dark": "#ff4bdb",
      },
      fontSize: {
        "between-md-lg": "1.15rem",
        navbig: "1.09rem",
      },
      fontFamily: {
        display: ["PT Mono, monospace"],
        body: ["Inter, sans-serif"],
      },
      spacing: {
        72: "18rem",
        84: "21rem",
        96: "24rem",
      },
      height: {
        "1/4": "25%",
        "1/2": "50%",
        "3/4": "75%",
        "80p": "60%",
        full: "100%",
      },
      scale: {
        160: "1.7",
        200: "1.85",
        250: "2.5",
        300: "3",
        // ... You can add more scales as needed
      },
      keyframes: {
        floatXY: {
          "0%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-20px) translateX(20px)" },
          "100%": { transform: "translateY(0px) translateX(0px)" },
        },
        wave: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-2deg)" },
          "75%": { transform: "rotate(2deg)" },
        },
        scale: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        slide: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        floatXY: "floatXY 3s ease-in-out infinite",
        wave: "wave 5s ease-in-out infinite",
        scale: "scale 2s ease-in-out infinite",
        slide: "slide 2s linear infinite",
      },
    },
  },
  plugins: [require("daisyui"), require("@tailwindcss/typography")],
  daisyui: {
    styled: true,
    // TODO: Theme needs works
    themes: [
      {
        solana: {
          primary: "#000000" /* Primary color */,
          "primary-focus": "#9945FF" /* Primary color - focused */,
          "primary-content":
            "#ffffff" /* Foreground content color to use on primary color */,

          secondary: "#808080" /* Secondary color */,
          "secondary-focus": "#f3cc30" /* Secondary color - focused */,
          "secondary-content":
            "#ffffff" /* Foreground content color to use on secondary color */,

          accent: "#33a382" /* Accent color */,
          "accent-focus": "#2aa79b" /* Accent color - focused */,
          "accent-content":
            "#ffffff" /* Foreground content color to use on accent color */,

          neutral: "#2b2b2b" /* Neutral color */,
          "neutral-focus": "#2a2e37" /* Neutral color - focused */,
          "neutral-content":
            "#ffffff" /* Foreground content color to use on neutral color */,

          "base-100":
            "#000000" /* Base color of page, used for blank backgrounds */,
          "base-200": "#35363a" /* Base color, a little darker */,
          "base-300": "#222222" /* Base color, even more darker */,
          "base-content":
            "#f9fafb" /* Foreground content color to use on base color */,

          info: "#2094f3" /* Info */,
          success: "#009485" /* Success */,
          warning: "#ff9900" /* Warning */,
          error: "#ff5724" /* Error */,
        },
      },
      // backup themes:
      // 'dark',
      // 'synthwave'
    ],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
  },
};
