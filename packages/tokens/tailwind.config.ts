import type { Config } from "tailwindcss";
import preset from "./src/preset";
export default { presets: [preset], content: ["./src/**/*.{ts,css}"] } satisfies Config;
