import { describe, expect, test } from "bun:test";
import { spawn } from "bun";

describe("CLI E2E Tests", () => {
  test("converts ANSI to TAML via npx", async () => {
    // Spawn the CLI process using npx
    const proc = spawn({
      cmd: ["npx", "."],
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });

    // Write ANSI input to stdin
    const ansiInput = "\x1b[31mError\x1b[0m: Something failed";
    proc.stdin.write(ansiInput);
    proc.stdin.end();

    // Wait for the process to complete and collect output
    const result = await proc.exited;
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();

    // Verify the process exits with code 0
    expect(result).toBe(0);

    // Verify the TAML output
    expect(stdout.trim()).toBe("<red>Error</red>: Something failed");

    // Ensure no errors were written to stderr
    expect(stderr).toBe("");
  });
});
