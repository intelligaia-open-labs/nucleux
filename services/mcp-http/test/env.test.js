import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadEnvFile, parseEnv } from "../src/env.js";

test("parses KEY=VALUE lines, comments, export and quotes", () => {
  assert.deepEqual(
    parseEnv('# secrets\n\nA=1\nexport B = two\nC="quoted value"\nD=\'x=y\'\nnot a line\nE=\n'),
    { A: "1", B: "two", C: "quoted value", D: "x=y", E: "" }
  );
});

test("loads the file without overriding what is already set", () => {
  const dir = mkdtempSync(join(tmpdir(), "nx-env-"));
  const file = join(dir, ".env");
  writeFileSync(file, "GOOGLE_CLIENT_ID=from-file\nNUCLEUX_AUTH=required\n");
  const env = { NUCLEUX_AUTH: "optional" };
  assert.deepEqual(loadEnvFile(file, env), ["GOOGLE_CLIENT_ID"]);
  assert.equal(env.GOOGLE_CLIENT_ID, "from-file");
  assert.equal(env.NUCLEUX_AUTH, "optional");
  assert.deepEqual(loadEnvFile(join(dir, "missing.env"), env), []);
});
