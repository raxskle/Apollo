import { useSelector } from "react-redux";
import "./CommentBar.scss";
import { RootState } from "../../../store";
import { useRef } from "react";

import { CommentItem } from "./CommentItem/CommentItem";

export function CommentBar() {
  const { showCommentBar } = useSelector((state: RootState) => state.view);

  const barRef = useRef<HTMLDivElement>(null);

  const comments = useSelector(
    (state: RootState) => state.doc.document.comments
  );
  // const elements = editor.children.filter((node) => {
  //   return (
  //     Element.isElement(node) &&
  //     isCustomElement(node) &&
  //     node.comments &&
  //     node.comments.length > 0
  //   );
  // });

  return (
    <div
      className="comment-bar"
      style={{
        width: "280px",
        transform: showCommentBar ? "translateX(0px)" : "translateX(280px)",
        visibility: showCommentBar ? "visible" : "hidden",
        borderLeft: showCommentBar
          ? "1px solid rgba(192, 192, 192, 0.5)"
          : "1px solid transparent",
      }}
      ref={barRef}
    >
      <div className="comment-bar-title">Comments & Suggestions</div>
      <div className="comment-bar-content">
        {comments.map((cm) => {
          return <CommentItem comment={cm} />;
        })}
      </div>
    </div>
  );
}
