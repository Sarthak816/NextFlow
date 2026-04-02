import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_seipkhltguwpruvozzoi",
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  // Ensure this points to the folder where our tasks are
  dirs: ["./src/trigger"],
});
