/**
 * Integration tests for real-world scenarios
 */

import { describe, expect, test } from "bun:test";
import { encode } from "@taml/encoder";

describe("Integration tests", () => {
  describe("Real-world ANSI escape sequence conversion", () => {
    test("converts Git status output", () => {
      const gitStatus = `On branch \x1b[32mmain\x1b[0m
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
\x1b[31m\tmodified:   src/app.ts\x1b[0m
\x1b[31m\tmodified:   README.md\x1b[0m

Untracked files:
  (use "git add <file>..." to include in what will be committed)
\x1b[31m\tnew-feature.ts\x1b[0m

no changes added to commit (use "git add" and/or "git commit -a")`;

      const expected = `On branch <green>main</green>
Your branch is up to date with 'origin/main'.

Changes not staged for commit:
  (use "git add &lt;file>..." to update what will be committed)
  (use "git restore &lt;file>..." to discard changes in working directory)
<red>\tmodified:   src/app.ts</red>
<red>\tmodified:   README.md</red>

Untracked files:
  (use "git add &lt;file>..." to include in what will be committed)
<red>\tnew-feature.ts</red>

no changes added to commit (use "git add" and/or "git commit -a")`;

      const result = encode(gitStatus);
      expect(result).toBe(expected);
    });

    test("converts npm install output", () => {
      const npmOutput = `\x1b[90mnpm\x1b[0m \x1b[36minfo\x1b[0m using npm@10.2.4
\x1b[90mnpm\x1b[0m \x1b[36minfo\x1b[0m using node@v20.11.0
\x1b[90mnpm\x1b[0m \x1b[36minfo\x1b[0m found 0 vulnerabilities

\x1b[32madded\x1b[0m 245 packages, and \x1b[32maudited\x1b[0m 246 packages in 3s

\x1b[32m✓\x1b[0m All packages installed successfully`;

      const expected = `<brightBlack>npm</brightBlack> <cyan>info</cyan> using npm@10.2.4
<brightBlack>npm</brightBlack> <cyan>info</cyan> using node@v20.11.0
<brightBlack>npm</brightBlack> <cyan>info</cyan> found 0 vulnerabilities

<green>added</green> 245 packages, and <green>audited</green> 246 packages in 3s

<green>✓</green> All packages installed successfully`;

      const result = encode(npmOutput);
      expect(result).toBe(expected);
    });

    test("converts Docker build output", () => {
      const dockerOutput = `\x1b[1m\x1b[34m[1/4] FROM docker.io/library/node:18-alpine\x1b[0m
\x1b[1m\x1b[34m[2/4] WORKDIR /app\x1b[0m
\x1b[1m\x1b[34m[3/4] COPY package*.json ./\x1b[0m
\x1b[1m\x1b[34m[4/4] RUN npm ci --only=production\x1b[0m
\x1b[32m✓\x1b[0m Build completed successfully
\x1b[33m⚠\x1b[0m Image size: 156MB`;

      const expected = `<bold><blue>[1/4] FROM docker.io/library/node:18-alpine</blue></bold>
<bold><blue>[2/4] WORKDIR /app</blue></bold>
<bold><blue>[3/4] COPY package*.json ./</blue></bold>
<bold><blue>[4/4] RUN npm ci --only=production</blue></bold>
<green>✓</green> Build completed successfully
<yellow>⚠</yellow> Image size: 156MB`;

      const result = encode(dockerOutput);
      expect(result).toBe(expected);
    });

    test("converts application log output", () => {
      const logOutput = `\x1b[90m2024-01-15 10:30:15.123\x1b[0m \x1b[32mINFO\x1b[0m  \x1b[1mServer\x1b[0m starting on port \x1b[36m3000\x1b[0m
\x1b[90m2024-01-15 10:30:16.456\x1b[0m \x1b[32mINFO\x1b[0m  Database connected to \x1b[4mmongodb://localhost:27017\x1b[0m
\x1b[90m2024-01-15 10:30:17.789\x1b[0m \x1b[33mWARN\x1b[0m  High memory usage detected: \x1b[1m\x1b[31m85%\x1b[0m
\x1b[90m2024-01-15 10:30:18.012\x1b[0m \x1b[31mERROR\x1b[0m Authentication failed for user \x1b[4muser@example.com\x1b[0m
\x1b[90m2024-01-15 10:30:19.345\x1b[0m \x1b[36mDEBUG\x1b[0m Cache miss for key: \x1b[2muser:123:profile\x1b[0m`;

      const expected = `<brightBlack>2024-01-15 10:30:15.123</brightBlack> <green>INFO</green>  <bold>Server</bold> starting on port <cyan>3000</cyan>
<brightBlack>2024-01-15 10:30:16.456</brightBlack> <green>INFO</green>  Database connected to <underline>mongodb://localhost:27017</underline>
<brightBlack>2024-01-15 10:30:17.789</brightBlack> <yellow>WARN</yellow>  High memory usage detected: <bold><red>85%</red></bold>
<brightBlack>2024-01-15 10:30:18.012</brightBlack> <red>ERROR</red> Authentication failed for user <underline>user@example.com</underline>
<brightBlack>2024-01-15 10:30:19.345</brightBlack> <cyan>DEBUG</cyan> Cache miss for key: <dim>user:123:profile</dim>`;

      const result = encode(logOutput);
      expect(result).toBe(expected);
    });

    test("converts test runner output", () => {
      const testOutput = `\x1b[1m\x1b[32mRunning tests...\x1b[0m

\x1b[1mAuthentication Tests\x1b[0m
  \x1b[32m✓\x1b[0m should login with valid credentials \x1b[90m(15ms)\x1b[0m
  \x1b[32m✓\x1b[0m should reject invalid password \x1b[90m(8ms)\x1b[0m
  \x1b[31m✗\x1b[0m should handle expired tokens \x1b[90m(23ms)\x1b[0m
    \x1b[31mAssertionError:\x1b[0m Expected status 200 but got 500
    \x1b[90m    at /app/test/auth.test.js:45:12\x1b[0m

\x1b[1mAPI Tests\x1b[0m
  \x1b[32m✓\x1b[0m should return user data \x1b[90m(12ms)\x1b[0m
  \x1b[33m⏭\x1b[0m should handle rate limiting \x1b[90m(skipped)\x1b[0m

\x1b[1mResults:\x1b[0m
  \x1b[32m\x1b[1m3 passing\x1b[0m \x1b[90m(58ms)\x1b[0m
  \x1b[31m\x1b[1m1 failing\x1b[0m
  \x1b[33m\x1b[1m1 skipped\x1b[0m`;

      const expected = `<bold><green>Running tests...</green></bold>

<bold>Authentication Tests</bold>
  <green>✓</green> should login with valid credentials <brightBlack>(15ms)</brightBlack>
  <green>✓</green> should reject invalid password <brightBlack>(8ms)</brightBlack>
  <red>✗</red> should handle expired tokens <brightBlack>(23ms)</brightBlack>
    <red>AssertionError:</red> Expected status 200 but got 500
    <brightBlack>    at /app/test/auth.test.js:45:12</brightBlack>

<bold>API Tests</bold>
  <green>✓</green> should return user data <brightBlack>(12ms)</brightBlack>
  <yellow>⏭</yellow> should handle rate limiting <brightBlack>(skipped)</brightBlack>

<bold>Results:</bold>
  <green><bold>3 passing</bold></green> <brightBlack>(58ms)</brightBlack>
  <red><bold>1 failing</bold></red>
  <yellow><bold>1 skipped</bold></yellow>`;

      const result = encode(testOutput);
      expect(result).toBe(expected);
    });
  });

  describe("Complex ANSI sequences", () => {
    test("handles 256-color sequences", () => {
      const input = `\x1b[38;5;196mBright Red (256)\x1b[0m
\x1b[38;5;46mBright Green (256)\x1b[0m
\x1b[38;5;21mBlue (256)\x1b[0m
\x1b[48;5;226mYellow Background (256)\x1b[0m`;

      const expected = `<brightRed>Bright Red (256)</brightRed>
<brightGreen>Bright Green (256)</brightGreen>
<brightBlue>Blue (256)</brightBlue>
<bgBrightYellow>Yellow Background (256)</bgBrightYellow>`;

      const result = encode(input);
      expect(result).toBe(expected);
    });

    test("handles RGB color sequences", () => {
      const input = `\x1b[38;2;255;0;0mRGB Red\x1b[0m
\x1b[38;2;0;255;0mRGB Green\x1b[0m
\x1b[38;2;0;0;255mRGB Blue\x1b[0m
\x1b[48;2;255;255;0mRGB Yellow Background\x1b[0m`;

      const expected = `<brightRed>RGB Red</brightRed>
<brightGreen>RGB Green</brightGreen>
<brightBlue>RGB Blue</brightBlue>
<bgBrightYellow>RGB Yellow Background</bgBrightYellow>`;

      const result = encode(input);
      expect(result).toBe(expected);
    });

    test("handles deeply nested formatting", () => {
      const input =
        "\x1b[1m\x1b[4m\x1b[31m\x1b[43mBold Underlined Red on Yellow\x1b[0m";
      const expected =
        "<bold><underline><red><bgYellow>Bold Underlined Red on Yellow</bgYellow></red></underline></bold>";

      const result = encode(input);
      expect(result).toBe(expected);
    });

    test("handles partial resets", () => {
      const input = "\x1b[1m\x1b[31mBold Red\x1b[39m Still Bold\x1b[0m Normal";
      const expected = "<bold><red>Bold Red</red> Still Bold</bold> Normal";

      const result = encode(input);
      expect(result).toBe(expected);
    });

    test("handles malformed sequences gracefully", () => {
      const input = "Normal text \x1b[XYZ Invalid \x1b[31mRed\x1b[0m More text";
      const expected = "Normal text \x1b[XYZ Invalid <red>Red</red> More text";

      const result = encode(input);
      expect(result).toBe(expected);
    });
  });

  describe("Edge cases and special scenarios", () => {
    test("handles empty sequences", () => {
      const input = "Text \x1b[m Empty sequence \x1b[0m Reset";
      const expected = "Text  Empty sequence  Reset";

      const result = encode(input);
      expect(result).toBe(expected);
    });

    test("handles sequences without parameters", () => {
      const input = "\x1b[0mReset only\x1b[mEmpty\x1b[0m";
      const expected = "Reset onlyEmpty";

      const result = encode(input);
      expect(result).toBe(expected);
    });

    test("handles multiple consecutive resets", () => {
      const input = "\x1b[31mRed\x1b[0m\x1b[0m\x1b[0mText";
      const expected = "<red>Red</red>Text";

      const result = encode(input);
      expect(result).toBe(expected);
    });

    test("handles very long sequences", () => {
      const longText = "A".repeat(1000);
      const input = `\x1b[31m${longText}\x1b[0m`;
      const expected = `<red>${longText}</red>`;

      const result = encode(input);
      expect(result).toBe(expected);
    });

    test("handles mixed line endings", () => {
      const input =
        "Line 1\r\n\x1b[32mLine 2\x1b[0m\nLine 3\r\x1b[31mLine 4\x1b[0m";
      const expected =
        "Line 1\r\n<green>Line 2</green>\nLine 3\r<red>Line 4</red>";

      const result = encode(input);
      expect(result).toBe(expected);
    });

    test("handles Unicode characters", () => {
      const input = "\x1b[31m🎨 Colors\x1b[0m and \x1b[32m✅ Emojis\x1b[0m";
      const expected = "<red>🎨 Colors</red> and <green>✅ Emojis</green>";

      const result = encode(input);
      expect(result).toBe(expected);
    });

    test("handles special XML characters", () => {
      const input = `\x1b[31m5 < 10 & "quotes"\x1b[0m`;
      const expected = `<red>5 &lt; 10 & "quotes"</red>`;

      const result = encode(input);
      expect(result).toBe(expected);
    });
  });

  describe("Complete workflow scenarios", () => {
    test("processes build pipeline output", () => {
      const buildOutput = `\x1b[1m\x1b[34mBuilding application...\x1b[0m

\x1b[32m✓\x1b[0m Linting code
\x1b[32m✓\x1b[0m Type checking
\x1b[32m✓\x1b[0m Running tests
\x1b[33m⚠\x1b[0m 2 warnings found
\x1b[32m✓\x1b[0m Bundling assets
\x1b[32m✓\x1b[0m Optimizing images

\x1b[1mBuild completed!\x1b[0m
\x1b[90mOutput: \x1b[0m\x1b[36mdist/\x1b[0m
\x1b[90mSize: \x1b[0m\x1b[1m2.3 MB\x1b[0m
\x1b[90mTime: \x1b[0m\x1b[1m45.2s\x1b[0m`;

      const expected = `<bold><blue>Building application...</blue></bold>

<green>✓</green> Linting code
<green>✓</green> Type checking
<green>✓</green> Running tests
<yellow>⚠</yellow> 2 warnings found
<green>✓</green> Bundling assets
<green>✓</green> Optimizing images

<bold>Build completed!</bold>
<brightBlack>Output: </brightBlack><cyan>dist/</cyan>
<brightBlack>Size: </brightBlack><bold>2.3 MB</bold>
<brightBlack>Time: </brightBlack><bold>45.2s</bold>`;

      const result = encode(buildOutput);
      expect(result).toBe(expected);
    });

    test("processes deployment logs", () => {
      const deployOutput = `\x1b[1m\x1b[36mDeploying to production...\x1b[0m

\x1b[90m[1/5]\x1b[0m Building Docker image
\x1b[90m[2/5]\x1b[0m Pushing to registry
\x1b[90m[3/5]\x1b[0m Updating Kubernetes deployment
\x1b[90m[4/5]\x1b[0m Waiting for rollout
\x1b[90m[5/5]\x1b[0m Running health checks

\x1b[32m✅ Deployment successful!\x1b[0m
\x1b[36mURL:\x1b[0m https://app.example.com
\x1b[36mVersion:\x1b[0m \x1b[1mv1.2.3\x1b[0m`;

      const expected = `<bold><cyan>Deploying to production...</cyan></bold>

<brightBlack>[1/5]</brightBlack> Building Docker image
<brightBlack>[2/5]</brightBlack> Pushing to registry
<brightBlack>[3/5]</brightBlack> Updating Kubernetes deployment
<brightBlack>[4/5]</brightBlack> Waiting for rollout
<brightBlack>[5/5]</brightBlack> Running health checks

<green>✅ Deployment successful!</green>
<cyan>URL:</cyan> https://app.example.com
<cyan>Version:</cyan> <bold>v1.2.3</bold>`;

      const result = encode(deployOutput);
      expect(result).toBe(expected);
    });

    test("processes monitoring alerts", () => {
      const alertOutput = `\x1b[31m\x1b[1m🚨 CRITICAL ALERT\x1b[0m
\x1b[31mService:\x1b[0m api-server
\x1b[31mMetric:\x1b[0m CPU Usage
\x1b[31mValue:\x1b[0m \x1b[1m95%\x1b[0m
\x1b[31mThreshold:\x1b[0m 80%
\x1b[90mTime:\x1b[0m 2024-01-15 10:30:00 UTC

\x1b[33m\x1b[1m⚠️  WARNING\x1b[0m
\x1b[33mService:\x1b[0m database
\x1b[33mMetric:\x1b[0m Connection Pool
\x1b[33mValue:\x1b[0m \x1b[1m85%\x1b[0m
\x1b[33mThreshold:\x1b[0m 90%`;

      const expected = `<red><bold>🚨 CRITICAL ALERT</bold></red>
<red>Service:</red> api-server
<red>Metric:</red> CPU Usage
<red>Value:</red> <bold>95%</bold>
<red>Threshold:</red> 80%
<brightBlack>Time:</brightBlack> 2024-01-15 10:30:00 UTC

<yellow><bold>⚠️  WARNING</bold></yellow>
<yellow>Service:</yellow> database
<yellow>Metric:</yellow> Connection Pool
<yellow>Value:</yellow> <bold>85%</bold>
<yellow>Threshold:</yellow> 90%`;

      const result = encode(alertOutput);
      expect(result).toBe(expected);
    });
  });

  describe("Performance and stress tests", () => {
    test("handles large input efficiently", () => {
      const largeText = "Sample text ".repeat(1000);
      const input = `\x1b[31m${largeText}\x1b[0m`;
      const expected = `<red>${largeText}</red>`;

      const start = performance.now();
      const result = encode(input);
      const end = performance.now();

      expect(result).toBe(expected);
      expect(end - start).toBeLessThan(100); // Should complete in under 100ms
    });

    test("handles many small sequences efficiently", () => {
      const sequences = Array.from(
        { length: 1000 },
        (_, i) => `\x1b[3${i % 8}m${i}\x1b[0m`,
      ).join(" ");

      const start = performance.now();
      const result = encode(sequences);
      const end = performance.now();

      expect(result).toContain("<black>0</black>");
      expect(result).toContain("<white>7</white>");
      expect(end - start).toBeLessThan(200); // Should complete in under 200ms
    });

    test("handles deeply nested sequences", () => {
      let input = "text";

      // Create 50 levels of nesting
      for (let i = 0; i < 50; i++) {
        const color = 31 + (i % 8); // Cycle through colors
        input = `\x1b[${color}m${input}\x1b[0m`;
      }

      const expected =
        "<green></green><red></red><white></white><cyan></cyan><magenta></magenta><blue></blue><yellow></yellow><green></green><red></red><white></white><cyan></cyan><magenta></magenta><blue></blue><yellow></yellow><green></green><red></red><white></white><cyan></cyan><magenta></magenta><blue></blue><yellow></yellow><green></green><red></red><white></white><cyan></cyan><magenta></magenta><blue></blue><yellow></yellow><green></green><red></red><white></white><cyan></cyan><magenta></magenta><blue></blue><yellow></yellow><green></green><red></red><white></white><cyan></cyan><magenta></magenta><blue></blue><yellow></yellow><green></green><red>text</red>";

      const result = encode(input);
      expect(result).toBe(expected);
    });
  });
});
