import { render } from "ink";
import App from "./tui/App";
import { loadConfig } from "./services/config";

export default async function startTUI() {
    const initialConfig = await loadConfig();
    
    render(
      <App initialConfig={initialConfig} />,
    );
}
