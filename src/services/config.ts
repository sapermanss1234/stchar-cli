import { readFile, writeFile } from "fs/promises";
import type { Config } from "../types";

export async function saveConfig(config: Config) {

  await writeFile("config.json", JSON.stringify(config, null, 2), "utf-8");
}

export async function loadConfig() {
  try {
    const data = await readFile("config.json", "utf-8");

    return JSON.parse(data);
  } catch {
    return {
      saveJson: true,
      saveImage: true,
      locale: "en",
    };
  }
}