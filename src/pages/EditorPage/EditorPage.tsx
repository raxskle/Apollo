import { useState } from "react";
import { EditorContent } from "../../components/Editor/EditorContent";
import "./EditorPage.scss";
import { NavBar } from "./NavBar/NavBar";
import { CommentBar } from "./CommentBar/CommentBar";

export function EditorPage() {
  const [showCommentBar, setShowCommentBar] = useState(false);
  return (
    <div className="editor-page">
      <NavBar setShowCommentBar={setShowCommentBar} />
      <EditorContent />
      {showCommentBar && <CommentBar />}
    </div>
  );
}
