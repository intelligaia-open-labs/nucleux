import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import * as p_agent_avatar from "@nucleux/agent-avatar";
import * as m_agent_avatar from "@nucleux/md3-agent-avatar";
import * as p_ai_icons from "@nucleux/ai-icons";
import * as m_ai_icons from "@nucleux/md3-ai-icons";
import * as p_attachments from "@nucleux/attachments";
import * as m_attachments from "@nucleux/md3-attachments";
import * as p_autocomplete from "@nucleux/autocomplete";
import * as m_autocomplete from "@nucleux/md3-autocomplete";
import * as p_caveat from "@nucleux/caveat";
import * as m_caveat from "@nucleux/md3-caveat";
import * as p_color from "@nucleux/color";
import * as m_color from "@nucleux/md3-color";
import * as p_connectors from "@nucleux/connectors";
import * as m_connectors from "@nucleux/md3-connectors";
import * as p_consent from "@nucleux/consent";
import * as m_consent from "@nucleux/md3-consent";
import * as p_disclaimer from "@nucleux/disclaimer";
import * as m_disclaimer from "@nucleux/md3-disclaimer";
import * as p_disclosure from "@nucleux/disclosure";
import * as m_disclosure from "@nucleux/md3-disclosure";
import * as p_example_gallery from "@nucleux/example-gallery";
import * as m_example_gallery from "@nucleux/md3-example-gallery";
import * as p_gesture from "@nucleux/gesture";
import * as m_gesture from "@nucleux/md3-gesture";
import * as p_handwriting from "@nucleux/handwriting";
import * as m_handwriting from "@nucleux/md3-handwriting";
import * as p_iconography from "@nucleux/iconography";
import * as m_iconography from "@nucleux/md3-iconography";
import * as p_initial_cta from "@nucleux/initial-cta";
import * as m_initial_cta from "@nucleux/md3-initial-cta";
import * as p_knowledge_base from "@nucleux/knowledge-base";
import * as m_knowledge_base from "@nucleux/md3-knowledge-base";
import * as p_mcp_connection from "@nucleux/mcp-connection";
import * as m_mcp_connection from "@nucleux/md3-mcp-connection";
import * as p_model_selection from "@nucleux/model-selection";
import * as m_model_selection from "@nucleux/md3-model-selection";
import * as p_name from "@nucleux/name";
import * as m_name from "@nucleux/md3-name";
import * as p_nudges from "@nucleux/nudges";
import * as m_nudges from "@nucleux/md3-nudges";
import * as p_open_input from "@nucleux/open-input";
import * as m_open_input from "@nucleux/md3-open-input";
import * as p_personality from "@nucleux/personality";
import * as m_personality from "@nucleux/md3-personality";
import * as p_proactive from "@nucleux/proactive";
import * as m_proactive from "@nucleux/md3-proactive";
import * as p_randomize from "@nucleux/randomize";
import * as m_randomize from "@nucleux/md3-randomize";
import * as p_structured_input from "@nucleux/structured-input";
import * as m_structured_input from "@nucleux/md3-structured-input";
import * as p_suggested_prompts from "@nucleux/suggested-prompts";
import * as m_suggested_prompts from "@nucleux/md3-suggested-prompts";
import * as p_templates from "@nucleux/templates";
import * as m_templates from "@nucleux/md3-templates";
import * as p_visual_input from "@nucleux/visual-input";
import * as m_visual_input from "@nucleux/md3-visual-input";
import * as p_voice_input from "@nucleux/voice-input";
import * as m_voice_input from "@nucleux/md3-voice-input";
import * as p_madlibs from "@nucleux/madlibs";
import * as m_madlibs from "@nucleux/md3-madlibs";
import * as p_modes from "@nucleux/modes";
import * as m_modes from "@nucleux/md3-modes";
import * as p_preset_styles from "@nucleux/preset-styles";
import * as m_preset_styles from "@nucleux/md3-preset-styles";
import * as p_prompt_enhancer from "@nucleux/prompt-enhancer";
import * as m_prompt_enhancer from "@nucleux/md3-prompt-enhancer";
import * as p_suggestions from "@nucleux/suggestions";
import * as m_suggestions from "@nucleux/md3-suggestions";
import * as p_voice_tone from "@nucleux/voice-tone";
import * as m_voice_tone from "@nucleux/md3-voice-tone";

// Each agentic pattern ships twice — @nucleux/<name> (shadcn) and @nucleux/md3-<name>
// (Material 3) — with one API, so switching families is an import change.
const PAIRS: Array<[string, Record<string, unknown>, Record<string, unknown>]> = [
  ["agent-avatar", p_agent_avatar, m_agent_avatar],
  ["ai-icons", p_ai_icons, m_ai_icons],
  ["attachments", p_attachments, m_attachments],
  ["autocomplete", p_autocomplete, m_autocomplete],
  ["caveat", p_caveat, m_caveat],
  ["color", p_color, m_color],
  ["connectors", p_connectors, m_connectors],
  ["consent", p_consent, m_consent],
  ["disclaimer", p_disclaimer, m_disclaimer],
  ["disclosure", p_disclosure, m_disclosure],
  ["example-gallery", p_example_gallery, m_example_gallery],
  ["gesture", p_gesture, m_gesture],
  ["handwriting", p_handwriting, m_handwriting],
  ["iconography", p_iconography, m_iconography],
  ["initial-cta", p_initial_cta, m_initial_cta],
  ["knowledge-base", p_knowledge_base, m_knowledge_base],
  ["mcp-connection", p_mcp_connection, m_mcp_connection],
  ["model-selection", p_model_selection, m_model_selection],
  ["name", p_name, m_name],
  ["nudges", p_nudges, m_nudges],
  ["open-input", p_open_input, m_open_input],
  ["personality", p_personality, m_personality],
  ["proactive", p_proactive, m_proactive],
  ["randomize", p_randomize, m_randomize],
  ["structured-input", p_structured_input, m_structured_input],
  ["suggested-prompts", p_suggested_prompts, m_suggested_prompts],
  ["templates", p_templates, m_templates],
  ["visual-input", p_visual_input, m_visual_input],
  ["voice-input", p_voice_input, m_voice_input],
  ["madlibs", p_madlibs, m_madlibs],
  ["modes", p_modes, m_modes],
  ["preset-styles", p_preset_styles, m_preset_styles],
  ["prompt-enhancer", p_prompt_enhancer, m_prompt_enhancer],
  ["suggestions", p_suggestions, m_suggestions],
  ["voice-tone", p_voice_tone, m_voice_tone],
];

const isComponent = (v: unknown) =>
  typeof v === "function" || (typeof v === "object" && v !== null && "$$typeof" in (v as object));

describe("shadcn ↔ Material 3 twin parity", () => {
  it.each(PAIRS)("%s: every component has an Md3 twin", (_name, twin, md3) => {
    const components = Object.keys(twin).filter((k) => /^[A-Z]/.test(k) && isComponent(twin[k]));
    expect(components.length).toBeGreaterThan(0);
    expect(components.filter((k) => !(`Md3${k}` in md3))).toEqual([]);
  });

  it.each(PAIRS)("%s: Md3 props types are the twin's own types, never redeclared", (name) => {
    const src = readFileSync(resolve(__dirname, `../../../packages/md3-${name}/src/index.tsx`), "utf8");
    expect(src).not.toMatch(/export\s+interface\s+Md3\w*Props\b/);
    const aliases = [...src.matchAll(/export\s+type\s+Md3(\w*Props)\s*=\s*([\w.]+)\s*;/g)];
    expect(aliases.length).toBeGreaterThan(0);
    for (const [, local, target] of aliases) expect(target.endsWith(local)).toBe(true);
    expect(src).toMatch(new RegExp(`from "@nucleux/${name}"`));
  });
});
