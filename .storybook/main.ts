import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const aliasMap: Record<string, string> = JSON.parse(
  readFileSync(resolve(root, "scripts/alias-map.json"), "utf8"),
);

const config: StorybookConfig = {
  stories: ["../packages/*/src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-essentials", "@storybook/addon-themes"],
  framework: { name: "@storybook/react-vite", options: {} },
  core: { disableTelemetry: true },
  viteFinal: (cfg) => {
    cfg.resolve = cfg.resolve ?? {};
    cfg.resolve.alias = {
      ...(cfg.resolve.alias as Record<string, string>),
      ...Object.fromEntries(
        Object.entries(aliasMap).map(([k, v]) => [k, resolve(root, v)]),
      ),
    };
    return cfg;
  },
};

export default config;
