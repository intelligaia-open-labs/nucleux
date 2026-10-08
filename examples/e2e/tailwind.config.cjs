// Per MCP get_setup(framework:"html"): Tailwind preset + tokens, scanning the e2e pages.
const tokens = require("@nucleux/tokens/preset");
module.exports = {
  presets: [tokens.default ?? tokens],
  content: ["examples/e2e/*.html"],
};
