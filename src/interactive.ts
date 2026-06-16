import { text, confirm, select, isCancel } from "@clack/prompts";

type interactiveInput = {
  url: string;
  saveJson: boolean;
  saveImage: boolean;
  locale: string;
};

export async function interactiveOption(): Promise<interactiveInput> {
  const url = await text({
    message: "Enter character URL",
  });
  if (isCancel(url)) process.exit(0);

  const saveJson = await confirm({
    message: "Save JSON?",
  });
  if (isCancel(saveJson)) process.exit(0);

  const saveImage = await confirm({
    message: "Save Image?",
  });
  if (isCancel(saveImage)) process.exit(0);

  const locale = await select({
    message: "Select locale",
    options: [
      {
        value: "th",
        label: "Thai",
      },
      {
        value: "en",
        label: "English",
      },
    ],
  });

  if (isCancel(locale)) process.exit(0);

  return {
    url,
    saveImage,
    saveJson,
    locale,
  };
}
