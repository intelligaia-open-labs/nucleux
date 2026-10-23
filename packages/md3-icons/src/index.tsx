import * as React from "react";
import { cn } from "@nucleux/utils";
import { msIconPaths, type MsIconName } from "./paths";

export { msIconPaths, msIconNames, type MsIconName } from "./paths";

/** Props shared by every Material Symbol icon. */
export interface MsIconProps extends React.SVGProps<SVGSVGElement> {
  /**
   * Accessible name. Icons are decorative (`aria-hidden`) by default — the
   * control around an icon carries the label. Pass `title` only where the
   * glyph is the only thing there is to read; it then renders as `role="img"`.
   */
  title?: string;
}

/** Props of the generic {@link MsIcon}. */
export interface MsIconByNameProps extends MsIconProps {
  /** Material Symbol name, e.g. `"arrow_upward"`, `"tune"`, `"star_shine_filled"`. */
  name: MsIconName;
}

function renderIcon(
  d: string,
  { title, className, ...props }: MsIconProps,
  ref: React.ForwardedRef<SVGSVGElement>,
) {
  return (
    <svg
      ref={ref}
      viewBox="0 -960 960 960"
      fill="currentColor"
      className={cn("size-6 shrink-0", className)}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true, focusable: false })}
      {...props}
    >
      <path d={d} />
    </svg>
  );
}

/**
 * Any Material Symbol (Outlined, weight 400) this package ships, by name — the
 * glyphs nucleux.in's Material 3 previews draw. Filled shapes on the 960 grid:
 * colour with `text-*`, size with `size-*` (default `size-6`, 24px).
 */
export const MsIcon = React.forwardRef<SVGSVGElement, MsIconByNameProps>(({ name, ...props }, ref) =>
  renderIcon(msIconPaths[name], props, ref),
);
MsIcon.displayName = "MsIcon";

function make(name: MsIconName, displayName: string) {
  const Icon = React.forwardRef<SVGSVGElement, MsIconProps>((props, ref) =>
    renderIcon(msIconPaths[name], props, ref),
  );
  Icon.displayName = displayName;
  return Icon;
}

/** Material Symbol `add` — Add context. */
export const MsAdd = make("add", "MsAdd");
/** Material Symbol `arrow_back` — Back. */
export const MsArrowBack = make("arrow_back", "MsArrowBack");
/** Material Symbol `arrow_forward` — Forward. */
export const MsArrowForward = make("arrow_forward", "MsArrowForward");
/** Material Symbol `arrow_upward` — Send. */
export const MsArrowUpward = make("arrow_upward", "MsArrowUpward");
/** Material Symbol `attach_file` — Attach. */
export const MsAttachFile = make("attach_file", "MsAttachFile");
/** Material Symbol `audio_file` — Audio. */
export const MsAudioFile = make("audio_file", "MsAudioFile");
/** Material Symbol `block` — Blocked. */
export const MsBlock = make("block", "MsBlock");
/** Material Symbol `bolt` — Fast. */
export const MsBolt = make("bolt", "MsBolt");
/** Material Symbol `build` — A tool. */
export const MsBuild = make("build", "MsBuild");
/** Material Symbol `build_filled` — The agent used a tool, filled. */
export const MsBuildFilled = make("build_filled", "MsBuildFilled");
/** Material Symbol `cancel` — Cancel. */
export const MsCancel = make("cancel", "MsCancel");
/** Material Symbol `casino` — A random pick. */
export const MsCasino = make("casino", "MsCasino");
/** Material Symbol `chat_bubble` — A prompt. */
export const MsChatBubble = make("chat_bubble", "MsChatBubble");
/** Material Symbol `chat_info` — Generated with AI. */
export const MsChatInfo = make("chat_info", "MsChatInfo");
/** Material Symbol `chat_info_filled` — Generated with AI, filled. */
export const MsChatInfoFilled = make("chat_info_filled", "MsChatInfoFilled");
/** Material Symbol `check` — Selected. */
export const MsCheck = make("check", "MsCheck");
/** Material Symbol `check_circle` — Done. */
export const MsCheckCircle = make("check_circle", "MsCheckCircle");
/** Material Symbol `close` — Remove or dismiss. */
export const MsClose = make("close", "MsClose");
/** Material Symbol `cloud` — A connected service. */
export const MsCloud = make("cloud", "MsCloud");
/** Material Symbol `code` — The markup behind what is on screen. */
export const MsCode = make("code", "MsCode");
/** Material Symbol `content_copy` — Copy. */
export const MsContentCopy = make("content_copy", "MsContentCopy");
/** Material Symbol `content_paste` — Paste. */
export const MsContentPaste = make("content_paste", "MsContentPaste");
/** Material Symbol `database` — A data source. */
export const MsDatabase = make("database", "MsDatabase");
/** Material Symbol `dataset` — A resource. */
export const MsDataset = make("dataset", "MsDataset");
/** Material Symbol `delete` — Delete. */
export const MsDelete = make("delete", "MsDelete");
/** Material Symbol `description` — A document. */
export const MsDescription = make("description", "MsDescription");
/** Material Symbol `draw` — Handwriting. */
export const MsDraw = make("draw", "MsDraw");
/** Material Symbol `edit` — Edit. */
export const MsEdit = make("edit", "MsEdit");
/** Material Symbol `edit_note` — Edit. */
export const MsEditNote = make("edit_note", "MsEditNote");
/** Material Symbol `error` — Failed. */
export const MsError = make("error", "MsError");
/** Material Symbol `event` — A date. */
export const MsEvent = make("event", "MsEvent");
/** Material Symbol `flag` — Priority. */
export const MsFlag = make("flag", "MsFlag");
/** Material Symbol `folder_open` — A folder. */
export const MsFolderOpen = make("folder_open", "MsFolderOpen");
/** Material Symbol `forum` — A conversation. */
export const MsForum = make("forum", "MsForum");
/** Material Symbol `gesture` — A gesture. */
export const MsGesture = make("gesture", "MsGesture");
/** Material Symbol `graphic_eq` — Sound. */
export const MsGraphicEq = make("graphic_eq", "MsGraphicEq");
/** Material Symbol `group` — People. */
export const MsGroup = make("group", "MsGroup");
/** Material Symbol `handyman` — The agent used a tool (approved alternative). */
export const MsHandyman = make("handyman", "MsHandyman");
/** Material Symbol `handyman_filled` — The agent used a tool (approved alternative), filled. */
export const MsHandymanFilled = make("handyman_filled", "MsHandymanFilled");
/** Material Symbol `help` — Help. */
export const MsHelp = make("help", "MsHelp");
/** Material Symbol `highlight` — Highlight. */
export const MsHighlight = make("highlight", "MsHighlight");
/** Material Symbol `history` — What happened before. */
export const MsHistory = make("history", "MsHistory");
/** Material Symbol `image` — An image. */
export const MsImage = make("image", "MsImage");
/** Material Symbol `import_spark` — Generated with AI (approved alternative). */
export const MsImportSpark = make("import_spark", "MsImportSpark");
/** Material Symbol `import_spark_filled` — Generated with AI (approved alternative), filled. */
export const MsImportSparkFilled = make("import_spark_filled", "MsImportSparkFilled");
/** Material Symbol `info` — Explanation. */
export const MsInfo = make("info", "MsInfo");
/** Material Symbol `ink_eraser` — Erase. */
export const MsInkEraser = make("ink_eraser", "MsInkEraser");
/** Material Symbol `key` — Access. */
export const MsKey = make("key", "MsKey");
/** Material Symbol `keyboard_arrow_down` — Open a menu. */
export const MsKeyboardArrowDown = make("keyboard_arrow_down", "MsKeyboardArrowDown");
/** Material Symbol `keyboard_arrow_left` — Go back a level. */
export const MsKeyboardArrowLeft = make("keyboard_arrow_left", "MsKeyboardArrowLeft");
/** Material Symbol `keyboard_arrow_right` — Go deeper. */
export const MsKeyboardArrowRight = make("keyboard_arrow_right", "MsKeyboardArrowRight");
/** Material Symbol `lasso_select` — Circle to select. */
export const MsLassoSelect = make("lasso_select", "MsLassoSelect");
/** Material Symbol `lightbulb` — A suggestion. */
export const MsLightbulb = make("lightbulb", "MsLightbulb");
/** Material Symbol `link` — A link. */
export const MsLink = make("link", "MsLink");
/** Material Symbol `lock` — Requires permission. */
export const MsLock = make("lock", "MsLock");
/** Material Symbol `mic` — Speak. */
export const MsMic = make("mic", "MsMic");
/** Material Symbol `mic_off` — Microphone muted. */
export const MsMicOff = make("mic_off", "MsMicOff");
/** Material Symbol `more_horiz` — More. */
export const MsMoreHoriz = make("more_horiz", "MsMoreHoriz");
/** Material Symbol `open_in_new` — Opens elsewhere. */
export const MsOpenInNew = make("open_in_new", "MsOpenInNew");
/** Material Symbol `pause` — Pause. */
export const MsPause = make("pause", "MsPause");
/** Material Symbol `pending` — Waiting. */
export const MsPending = make("pending", "MsPending");
/** Material Symbol `person` — A person. */
export const MsPerson = make("person", "MsPerson");
/** Material Symbol `person_search` — A person. */
export const MsPersonSearch = make("person_search", "MsPersonSearch");
/** Material Symbol `photo_camera` — The camera. */
export const MsPhotoCamera = make("photo_camera", "MsPhotoCamera");
/** Material Symbol `play_arrow` — Resume. */
export const MsPlayArrow = make("play_arrow", "MsPlayArrow");
/** Material Symbol `progress_activity` — The agent is working. */
export const MsProgressActivity = make("progress_activity", "MsProgressActivity");
/** Material Symbol `redo` — Redo. */
export const MsRedo = make("redo", "MsRedo");
/** Material Symbol `refresh` — Retry. */
export const MsRefresh = make("refresh", "MsRefresh");
/** Material Symbol `schedule` — Scheduled. */
export const MsSchedule = make("schedule", "MsSchedule");
/** Material Symbol `screen_share` — Share a screen or window. */
export const MsScreenShare = make("screen_share", "MsScreenShare");
/** Material Symbol `search` — Search. */
export const MsSearch = make("search", "MsSearch");
/** Material Symbol `select` — Select a region. */
export const MsSelect = make("select", "MsSelect");
/** Material Symbol `select_window` — A window. */
export const MsSelectWindow = make("select_window", "MsSelectWindow");
/** Material Symbol `settings_backup_restore` — Reset one setting to its default. */
export const MsSettingsBackupRestore = make("settings_backup_restore", "MsSettingsBackupRestore");
/** Material Symbol `shield` — Protected. */
export const MsShield = make("shield", "MsShield");
/** Material Symbol `shuffle` — Another variation. */
export const MsShuffle = make("shuffle", "MsShuffle");
/** Material Symbol `smart_toy` — The agent. */
export const MsSmartToy = make("smart_toy", "MsSmartToy");
/** Material Symbol `star_shine` — AI is involved. */
export const MsStarShine = make("star_shine", "MsStarShine");
/** Material Symbol `star_shine_filled` — AI action, filled style. */
export const MsStarShineFilled = make("star_shine_filled", "MsStarShineFilled");
/** Material Symbol `sticky_note_2` — A note. */
export const MsStickyNote2 = make("sticky_note_2", "MsStickyNote2");
/** Material Symbol `stop` — Stop. */
export const MsStop = make("stop", "MsStop");
/** Material Symbol `stop_screen_share` — Stop sharing. */
export const MsStopScreenShare = make("stop_screen_share", "MsStopScreenShare");
/** Material Symbol `stylus` — A stylus. */
export const MsStylus = make("stylus", "MsStylus");
/** Material Symbol `sync` — Refreshing. */
export const MsSync = make("sync", "MsSync");
/** Material Symbol `sync_problem` — Out of sync. */
export const MsSyncProblem = make("sync_problem", "MsSyncProblem");
/** Material Symbol `table` — A spreadsheet. */
export const MsTable = make("table", "MsTable");
/** Material Symbol `touch_app` — Tap to select. */
export const MsTouchApp = make("touch_app", "MsTouchApp");
/** Material Symbol `tune` — Settings. */
export const MsTune = make("tune", "MsTune");
/** Material Symbol `undo` — Undo. */
export const MsUndo = make("undo", "MsUndo");
/** Material Symbol `upload` — Upload. */
export const MsUpload = make("upload", "MsUpload");
/** Material Symbol `verified` — Verified. */
export const MsVerified = make("verified", "MsVerified");
/** Material Symbol `visibility` — See. */
export const MsVisibility = make("visibility", "MsVisibility");
/** Material Symbol `volume_up` — Speaking. */
export const MsVolumeUp = make("volume_up", "MsVolumeUp");
/** Material Symbol `wand_shine` — AI action (approved alternative). */
export const MsWandShine = make("wand_shine", "MsWandShine");
/** Material Symbol `wand_shine_filled` — AI action (approved alternative), filled. */
export const MsWandShineFilled = make("wand_shine_filled", "MsWandShineFilled");
/** Material Symbol `warning` — Needs attention. */
export const MsWarning = make("warning", "MsWarning");
