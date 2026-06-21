import { useInput, Box, Text } from "ink";
import { useState } from "react";
import type { ScreenProps } from "../../types";

export default function Menu({ setScreen }: ScreenProps) {
  const menu = ["Download", "Setting", "Exit"];
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
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

    if (input === "q") {
      process.exit(1);
    }

    if (key.return) {
      switch (menu[selected]) {
        case "Download":
          setScreen("download");
          break;
        case "Exit":
          process.exit(1);
        case "Setting":
          setScreen("setting");
      }
    }
  });
  return (
    <Box flexDirection="column">
      <Box paddingBottom={1}>
        <Text>Stchar-cli</Text>
      </Box>
      {menu.map((str, index) => {
        return (
          <Text key={str}>
            {selected === index ? ">" : ""} {str}
          </Text>
        );
      })}
    </Box>
  );
}