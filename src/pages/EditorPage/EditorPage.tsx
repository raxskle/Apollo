import { useSelector } from "react-redux";
import { EditorContent } from "../../components/Editor/EditorContent";
import "./EditorPage.scss";
import { NavBar } from "./NavBar/NavBar";
import { RootState } from "../../store";
import { useEffect } from "react";

function EditorPage() {
  const docTitle = useSelector((state: RootState) => state.doc.document.title);

  useEffect(() => {
    window.document.title = docTitle;
  }, [docTitle]);

  return (
    <div className="editor-page">
      <NavBar />
      <EditorContent />
    </div>
  );
}
export default EditorPage;
