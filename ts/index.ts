#!/usr/bin/env node
import { encode } from "@taml/encoder";

/**
 * Read all input from STDIN
 */
export async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];

  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

/**
 * CLI entry point for taml-cli converter
 */
export async function main() {
  try {
    // Read from STDIN
    const input = await readStdin();

    if (!input || !input.trim()) {
      console.error(
        "Error: No input provided. Please pipe ANSI text to this command.",
      );
      console.error("Usage: cat file.txt | taml-cli");
      console.error('       echo -e "\\e[31mRed text\\e[0m" | taml-cli');
      process.exit(1);
    }

    // Convert ANSI to TAML
    const output = encode(input);

    // Write to STDOUT
    console.log(output);
  } catch (error) {
    console.error("Error processing ANSI text:", error);
    process.exit(1);
  }
}

// Run main function if this file is executed directly
if (process.argv[1] === import.meta.url.replace("file://", "")) {
  main();
}
