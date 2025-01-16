import { EditorContent } from "../../components/Editor/EditorContent";
import "./EditorPage.scss";
import { NavBar } from "./NavBar/NavBar";

export function EditorPage() {
  return (
    <div className="editor-page">
      <NavBar />
      <EditorContent />
    </div>
  );
}
