import { PresetStyles, type PresetStyle } from "./index";

/** Output presets for image generation; swatches use theme tones, no raw colours. */
const STYLES: PresetStyle[] = [
  { id: "photo", name: "Photo", swatch: "destructive", description: "Photographic, natural light." },
  { id: "illustration", name: "Illustration", swatch: "info", description: "Flat, drawn shapes." },
  { id: "isometric", name: "Isometric", swatch: "success", description: "3D at a fixed angle." },
  { id: "sketch", name: "Sketch", swatch: "warning", description: "Loose pencil lines." },
];

/** PresetStyles as nucleux.in's live preview shows it: Photo chosen, a reference-image drop, and the style locked for the project. */
export function SitePreview() {
  return (
    <PresetStyles
      variant="grid"
      styles={STYLES}
      defaultValue="photo"
      allowReference
      lockable
      defaultLocked
      className="w-[30rem] max-w-full"
    />
  );
}
