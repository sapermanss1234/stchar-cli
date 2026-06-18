import { select } from "@clack/prompts";

export async function showMainMenu() {
  return await select({
    message: "What do you want to do?",
    options: [
      {
        value: "download",
        label: "Download Character",
      },
      {
        value: "exit",
        label: "Exit",
      },
    ],
  });
}

export async function showRepeat() {
  return await select({
    message: "✓ Download Complete",
    options: [
      {
        value: "back",
        label: "Back to menu",
      },
      {
        value: "exit",
        label: "Exit",
      },
    ],
  });
}