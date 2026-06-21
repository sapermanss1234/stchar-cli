import { useState } from "react";
import type { Screen, Config } from "../types";
import Menu from "./components/Menu";
import Download from "./components/Download";
import Setting from "./components/Setting";

export default function App({ initialConfig }: { initialConfig: Config }) {
  const [currentScreen, setScreen] = useState<Screen>("menu");
  const [config, setConfig] = useState<Config>(initialConfig);

  if (currentScreen === "menu") {
    return <Menu setScreen={setScreen} />;
  } else if (currentScreen === "download") {
    return (
      <Download
        setScreen={setScreen}
        config={config}
      />
    );
  } else if (currentScreen === "setting") {
    return (
      <Setting
        setScreen={setScreen}
        config={config}
        setConfig={setConfig}
      />
    );
  }

  return;
}
