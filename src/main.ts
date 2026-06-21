import { interactiveOption } from "./interactive";
import { showMainMenu, showRepeat } from "./menu";
import { help } from "./utils";
import { handleDownload } from "./services/download";
import startTUI from "./tui";

const args = process.argv.slice(2);
const command = args[0];
const url = args[1];
const saveJson = args.includes("--json");
const saveImage = args.includes("--image");
const locale = args.filter((item) => {
  return item.startsWith("--locale");
})[0];

async function main() {
  if (args.length === 0) {
    await startTUI()
    return;
  } else {
    if (command === "download") {
      const newlocale = locale?.split("=")[1];
      await handleDownload(url, saveJson, saveImage, newlocale);
      return;
    }

    console.log("Unknown command");
    help();
  }
}



await main();
