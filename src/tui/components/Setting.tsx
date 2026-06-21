import { useInput, Box, Text } from "ink";
import { useState } from "react";
import { saveConfig } from "../../services/config";
import type { SettingProps } from "../../types";


export default function Setting({
  setScreen,
  setConfig,
  config,
}: SettingProps) {
  const [selected, setSelected] = useState(0);
  const menu = ["saveJson", "saveImage", "locale"];

  useInput(async (input, key) => {
    if (key.escape) {
      setScreen("menu");
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
      if (menu[selected] === "saveJson") {
        const newvalue = !config.saveJson;
        setConfig({...config,saveJson:newvalue})
        await saveConfig({...config,saveJson:newvalue});
      } else if (menu[selected] === "saveImage") {
        const newvalue = !config.saveImage;
        setConfig({...config,saveImage:newvalue})
        await saveConfig({...config,saveImage:newvalue});
      } else if (menu[selected] === "locale") {
        const newvalue = config.locale === "th" ? "en" : "th";
        setConfig({...config,locale:newvalue})
        await saveConfig({...config,locale:newvalue});
      }
    }
  });
  return (
    <Box flexDirection="column">
      <Box paddingBottom={1}>
        <Text>Setting</Text>
      </Box>

      <Box flexDirection="column">
        <Text>
          {menu[selected] === "saveJson" ? ">" : ""}
          {config.saveJson ? "[x]" : "[]"} Save Json
        </Text>
        <Text>
          {menu[selected] === "saveImage" ? ">" : ""}
          {config.saveImage ? "[x]" : "[]"} Save Image
        </Text>
        <Text>
          {menu[selected] === "locale" ? ">" : ""}
          Default Locale: {config.locale}
        </Text>
      </Box>
    </Box>
  );
}