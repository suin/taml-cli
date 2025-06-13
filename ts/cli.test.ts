/**
 * Tests for CLI functionality
 */

import { describe, expect, mock, spyOn, test } from "bun:test";

// Mock the encoder module
mock.module("@taml/encoder", () => ({
  encode: mock(() => "mocked-output"),
}));

describe("CLI functionality", () => {
  describe("readStdin function", () => {
    test("reads input from stdin correctly", async () => {
      // Mock process.stdin
      const mockChunks = [Buffer.from("Hello "), Buffer.from("World")];
      const mockStdin = {
        [Symbol.asyncIterator]: async function* () {
          for (const chunk of mockChunks) {
            yield chunk;
          }
        },
      };

      // Import the module to get access to readStdin
      const originalStdin = process.stdin;
      Object.defineProperty(process, "stdin", {
        value: mockStdin,
        configurable: true,
      });

      // Dynamically import to get fresh module
      const { readStdin } = await import("./index.js");
      const result = await readStdin();

      expect(result).toBe("Hello World");

      // Restore original stdin
      Object.defineProperty(process, "stdin", {
        value: originalStdin,
        configurable: true,
      });
    });

    test("handles empty stdin", async () => {
      const mockStdin = {
        [Symbol.asyncIterator]: async function* () {
          // No chunks yielded
        },
      };

      const originalStdin = process.stdin;
      Object.defineProperty(process, "stdin", {
        value: mockStdin,
        configurable: true,
      });

      const { readStdin } = await import("./index.js");
      const result = await readStdin();

      expect(result).toBe("");

      Object.defineProperty(process, "stdin", {
        value: originalStdin,
        configurable: true,
      });
    });

    test("handles UTF-8 encoding correctly", async () => {
      const mockChunks = [Buffer.from("🎨 "), Buffer.from("Colors")];
      const mockStdin = {
        [Symbol.asyncIterator]: async function* () {
          for (const chunk of mockChunks) {
            yield chunk;
          }
        },
      };

      const originalStdin = process.stdin;
      Object.defineProperty(process, "stdin", {
        value: mockStdin,
        configurable: true,
      });

      const { readStdin } = await import("./index.js");
      const result = await readStdin();

      expect(result).toBe("🎨 Colors");

      Object.defineProperty(process, "stdin", {
        value: originalStdin,
        configurable: true,
      });
    });
  });

  describe("main function", () => {
    test("processes ANSI input and outputs TAML", async () => {
      const mockEncode = mock(() => "<red>Error</red>");
      mock.module("@taml/encoder", () => ({
        encode: mockEncode,
      }));

      const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
      const exitSpy = spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      const mockStdin = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from("\x1b[31mError\x1b[0m");
        },
      };

      const originalStdin = process.stdin;
      Object.defineProperty(process, "stdin", {
        value: mockStdin,
        configurable: true,
      });

      try {
        const { main } = await import("./index.js");
        await main();
      } catch (error) {
        // Expected due to mocked process.exit
      }

      expect(mockEncode).toHaveBeenCalledWith("\x1b[31mError\x1b[0m");
      expect(consoleSpy).toHaveBeenCalledWith("<red>Error</red>");

      consoleSpy.mockRestore();
      exitSpy.mockRestore();
      Object.defineProperty(process, "stdin", {
        value: originalStdin,
        configurable: true,
      });
    });

    test("shows error message when no input provided", async () => {
      const consoleErrorSpy = spyOn(console, "error").mockImplementation(
        () => {},
      );
      const exitSpy = spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      const mockStdin = {
        [Symbol.asyncIterator]: async function* () {
          // No input
        },
      };

      const originalStdin = process.stdin;
      Object.defineProperty(process, "stdin", {
        value: mockStdin,
        configurable: true,
      });

      try {
        const { main } = await import("./index.js");
        await main();
      } catch (error) {
        // Expected due to mocked process.exit
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error: No input provided. Please pipe ANSI text to this command.",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Usage: cat file.txt | taml-cli",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '       echo -e "\\e[31mRed text\\e[0m" | taml-cli',
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      consoleErrorSpy.mockRestore();
      exitSpy.mockRestore();
      Object.defineProperty(process, "stdin", {
        value: originalStdin,
        configurable: true,
      });
    });

    test("handles encoder errors gracefully", async () => {
      const mockEncode = mock(() => {
        throw new Error("Encoding failed");
      });
      mock.module("@taml/encoder", () => ({
        encode: mockEncode,
      }));

      const consoleErrorSpy = spyOn(console, "error").mockImplementation(
        () => {},
      );
      const exitSpy = spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      const mockStdin = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from("some input");
        },
      };

      const originalStdin = process.stdin;
      Object.defineProperty(process, "stdin", {
        value: mockStdin,
        configurable: true,
      });

      try {
        const { main } = await import("./index.js");
        await main();
      } catch (error) {
        // Expected due to mocked process.exit
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error processing ANSI text:",
        expect.any(Error),
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      consoleErrorSpy.mockRestore();
      exitSpy.mockRestore();
      Object.defineProperty(process, "stdin", {
        value: originalStdin,
        configurable: true,
      });
    });
  });

  describe("ANSI to TAML conversion scenarios", () => {
    test("converts basic color codes", async () => {
      const mockEncode = mock((input: string) => {
        if (input === "\x1b[31mRed\x1b[0m") return "<red>Red</red>";
        if (input === "\x1b[32mGreen\x1b[0m") return "<green>Green</green>";
        return input;
      });
      mock.module("@taml/encoder", () => ({
        encode: mockEncode,
      }));

      const consoleSpy = spyOn(console, "log").mockImplementation(() => {});

      // Test red color
      const mockStdinRed = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from("\x1b[31mRed\x1b[0m");
        },
      };

      const originalStdin = process.stdin;
      Object.defineProperty(process, "stdin", {
        value: mockStdinRed,
        configurable: true,
      });

      try {
        const { main } = await import("./index.js");
        await main();
      } catch (error) {
        // Expected due to process.exit in main
      }

      expect(mockEncode).toHaveBeenCalledWith("\x1b[31mRed\x1b[0m");
      expect(consoleSpy).toHaveBeenCalledWith("<red>Red</red>");

      consoleSpy.mockRestore();
      Object.defineProperty(process, "stdin", {
        value: originalStdin,
        configurable: true,
      });
    });

    test("converts nested formatting", async () => {
      const mockEncode = mock((input: string) => {
        if (input === "\x1b[1m\x1b[31mBold Red\x1b[0m") {
          return "<bold><red>Bold Red</red></bold>";
        }
        return input;
      });
      mock.module("@taml/encoder", () => ({
        encode: mockEncode,
      }));

      const consoleSpy = spyOn(console, "log").mockImplementation(() => {});

      const mockStdin = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from("\x1b[1m\x1b[31mBold Red\x1b[0m");
        },
      };

      const originalStdin = process.stdin;
      Object.defineProperty(process, "stdin", {
        value: mockStdin,
        configurable: true,
      });

      try {
        const { main } = await import("./index.js");
        await main();
      } catch (error) {
        // Expected due to process.exit in main
      }

      expect(mockEncode).toHaveBeenCalledWith("\x1b[1m\x1b[31mBold Red\x1b[0m");
      expect(consoleSpy).toHaveBeenCalledWith(
        "<bold><red>Bold Red</red></bold>",
      );

      consoleSpy.mockRestore();
      Object.defineProperty(process, "stdin", {
        value: originalStdin,
        configurable: true,
      });
    });

    test("handles complex multi-line input", async () => {
      const complexInput =
        "Line 1\n\x1b[31mError:\x1b[0m Something failed\n\x1b[32mSuccess\x1b[0m";
      const expectedOutput =
        "Line 1\n<red>Error:</red> Something failed\n<green>Success</green>";

      const mockEncode = mock(() => expectedOutput);
      mock.module("@taml/encoder", () => ({
        encode: mockEncode,
      }));

      const consoleSpy = spyOn(console, "log").mockImplementation(() => {});

      const mockStdin = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from(complexInput);
        },
      };

      const originalStdin = process.stdin;
      Object.defineProperty(process, "stdin", {
        value: mockStdin,
        configurable: true,
      });

      try {
        const { main } = await import("./index.js");
        await main();
      } catch (error) {
        // Expected due to process.exit in main
      }

      expect(mockEncode).toHaveBeenCalledWith(complexInput);
      expect(consoleSpy).toHaveBeenCalledWith(expectedOutput);

      consoleSpy.mockRestore();
      Object.defineProperty(process, "stdin", {
        value: originalStdin,
        configurable: true,
      });
    });
  });

  describe("error cases", () => {
    test("handles stdin read errors", async () => {
      const mockStdin = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from(""); // Yield empty buffer before error
          throw new Error("Stdin read error");
        },
      };

      const consoleErrorSpy = spyOn(console, "error").mockImplementation(
        () => {},
      );
      const exitSpy = spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      const originalStdin = process.stdin;
      Object.defineProperty(process, "stdin", {
        value: mockStdin,
        configurable: true,
      });

      try {
        const { main } = await import("./index.js");
        await main();
      } catch (error) {
        // Expected due to mocked process.exit or stdin error
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(exitSpy).toHaveBeenCalledWith(1);

      consoleErrorSpy.mockRestore();
      exitSpy.mockRestore();
      Object.defineProperty(process, "stdin", {
        value: originalStdin,
        configurable: true,
      });
    });

    test("handles whitespace-only input as empty", async () => {
      const consoleErrorSpy = spyOn(console, "error").mockImplementation(
        () => {},
      );
      const exitSpy = spyOn(process, "exit").mockImplementation(() => {
        throw new Error("process.exit called");
      });

      const mockStdin = {
        [Symbol.asyncIterator]: async function* () {
          yield Buffer.from("   \n\t  \n  ");
        },
      };

      const originalStdin = process.stdin;
      Object.defineProperty(process, "stdin", {
        value: mockStdin,
        configurable: true,
      });

      try {
        const { main } = await import("./index.js");
        await main();
      } catch (error) {
        // Expected due to mocked process.exit
      }

      // Should treat whitespace-only input as no input
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error: No input provided. Please pipe ANSI text to this command.",
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      consoleErrorSpy.mockRestore();
      exitSpy.mockRestore();
      Object.defineProperty(process, "stdin", {
        value: originalStdin,
        configurable: true,
      });
    });
  });

  describe("CLI binary execution", () => {
    test("exports main function for CLI execution", async () => {
      const module = await import("./index.js");
      expect(typeof module.main).toBe("function");
    });

    test("exports readStdin function for testing", async () => {
      const module = await import("./index.js");
      expect(typeof module.readStdin).toBe("function");
    });
  });
});
