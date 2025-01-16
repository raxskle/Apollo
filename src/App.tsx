import "./App.css";
import { Client, Operation } from "./lib/ot";

import { EditorPage } from "./pages/EditorPage/EditorPage";

const client = new Client();
setTimeout(() => {
  client.applyClient(new Operation({ test: 1 }));
}, 1000);

function App() {
  return <EditorPage></EditorPage>;
}

export default App;
