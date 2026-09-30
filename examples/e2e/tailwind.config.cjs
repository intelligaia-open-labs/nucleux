// Per MCP get_setup(framework:"html"): Tailwind preset + tokens, scanning the page.
const tokens = require("@nucleux/tokens/preset");
module.exports = {
  presets: [tokens.default ?? tokens],
  content: ["examples/e2e/agent-console.html"],
};
