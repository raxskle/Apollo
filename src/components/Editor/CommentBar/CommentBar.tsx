import { useSelector } from "react-redux";
import "./CommentBar.scss";
import { RootState } from "../../../store";
import { useEffect, useRef } from "react";

type CommentBarProps = {
  offsetTop: number;
};

export function CommentBar(props: CommentBarProps) {
  const { showCommentBar } = useSelector((state: RootState) => state.view);
  const { offsetTop } = props;
  const barRef = useRef<HTMLDivElement>(null);

  // 禁止commentBar自己滚动
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
    };
    const ref = barRef.current;
    if (ref) {
      barRef.current.addEventListener("scroll", handler, { passive: false });
      barRef.current.scrollTop = offsetTop;
    }

    return () => {
      if (ref) {
        ref.removeEventListener("scroll", handler);
      }
    };
  });

  return (
    <div
      className="comment-bar"
      style={{
        width: showCommentBar ? "280px" : "0px",
        borderLeft: showCommentBar
          ? "1px solid rgba(192, 192, 192, 0.5)"
          : "1px solid transparent",
      }}
      ref={barRef}
    >
      <div>
        <div className="comment-bar-content" style={{ height: "500px" }}>
          aaa
          {offsetTop}
        </div>
        <div className="comment-bar-content" style={{ height: "500px" }}>
          aaa{offsetTop}
        </div>
        <div className="comment-bar-content" style={{ height: "500px" }}>
          aaa{offsetTop}
        </div>
        <div className="comment-bar-content" style={{ height: "500px" }}>
          aaa{offsetTop}
        </div>
        <div className="comment-bar-content" style={{ height: "500px" }}>
          aaa{offsetTop}
        </div>
        <div className="comment-bar-content" style={{ height: "500px" }}>
          aaa{offsetTop}
        </div>
      </div>
    </div>
  );
}
