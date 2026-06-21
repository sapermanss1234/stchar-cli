import { useInput, Box, Text } from "ink";
import { useState } from "react";
import { handleDownload } from "../../services/download";
import type { Config, DownloadProps, ScreenProps } from "../../types";



export default function Download({
  setScreen,
  config
}: DownloadProps) {
  const [url, setUrl] = useState("");
  const [json, setJson] = useState(config.saveJson);
  const [image, setImage] = useState(config.saveImage);
  const [locale, setLocale] = useState(config.locale);
  const [selected, setSelected] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const menu = ["json", "image", "locale", "download"];

  useInput(async (input, key) => {
    if (key.escape) {
      setScreen("menu");
      return;
    }

    if (loading) {
      return;
    }

    if (!key.upArrow && !key.downArrow && !key.return && !key.backspace) {
      setUrl(url + input);
    }

    if (key.backspace) {
      setUrl(url.slice(0, url.length - 1));
    }

    if (key.upArrow) {
      if (selected <= 0) {
        setSelected(0);
      } else {
        setSelected(selected - 1);
      }
    }

    if (key.downArrow) {
      if (selected >= menu.length - 1) {
        setSelected(menu.length - 1);
      } else {
        setSelected(selected + 1);
      }
    }

    if (key.return) {
      if (menu[selected] === "json") {
        setJson(!json);
      }

      if (menu[selected] === "image") {
        setImage(!image);
      }

      if (menu[selected] === "locale") {
        setLocale(locale === "th" ? "en" : "th");
      }

      if (menu[selected] === "download") {
        setLoading(true);
        setStatus("Downloading...");
        try {
          await handleDownload(url, json, image, locale);
          setStatus("Download Finished");
        } catch {
          setStatus("Download Failed");
        } finally {
          setLoading(false);
        }
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box paddingBottom={1}>
        <Text>Download Character</Text>
      </Box>
      <Box paddingBottom={1} flexDirection="column">
        <Text>Url: {url}</Text>
        <Text>
          {menu[selected] === "json" ? ">" : ""}
          {json ? "[x]" : "[]"} Save Json
        </Text>
        <Text>
          {menu[selected] === "image" ? ">" : ""}
          {image ? "[x]" : "[]"} Save Image
        </Text>
        <Text>
          {menu[selected] === "locale" ? ">" : ""}
          Locale: {locale}
        </Text>
      </Box>

      <Box paddingBottom={1} flexDirection="column">
        <Text>{menu[selected] === "download" ? ">" : ""}Download</Text>
        <Text>{status}</Text>
      </Box>
      <Box flexDirection="column">
        <Text>ESC = Back</Text>
        <Text>Enter = Download</Text>
      </Box>
    </Box>
  );
}