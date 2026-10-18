import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { printBlueprintBanner } from "./lib/blueprintBanner";

printBlueprintBanner();

createRoot(document.getElementById("root")!).render(<App />);
