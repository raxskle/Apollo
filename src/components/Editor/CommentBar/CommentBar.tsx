import { useDispatch, useSelector } from "react-redux";
import "./CommentBar.scss";
import { RootState } from "../../../store";
import { useRef, useState } from "react";
import { Input } from "antd";
import { CommentItem } from "./CommentItem/CommentItem";
import { BootstrapIconButton } from "../../../pages/EditorPage/NavBar/NavBar";
const { TextArea } = Input;
import sendIcon from "../../../assets/icons/sendIcon.svg";
import deleteIcon from "../../../assets/icons/deleteIcon.svg";
import { setInputCommentRef } from "../../../store/viewSlice";
import { getSocket } from "../../../network";
import { generateRandomString } from "../../../utils";

export function CommentBar() {
  const { showCommentBar } = useSelector((state: RootState) => state.view);

  const barRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();

  const comments = useSelector(
    (state: RootState) => state.doc.document.comments
  );

  const inputCommentRef = useSelector(
    (state: RootState) => state.view.inputCommentRef
  );

  const [inputCommentText, setInputCommentText] = useState("");

  const currentUser = useSelector((state: RootState) => state.doc.user);

  const handleSendComment = () => {
    const socket = getSocket();
    if (inputCommentText) {
      socket.emit("sendComment", {
        ref: inputCommentRef || undefined,
        content: inputCommentText,
        time: Date.now(),
        author: currentUser,
        id: generateRandomString(12),
      });
    }
  };

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
      <div className="comment-bar-title">
        <div className="title-bar-content">
          <div className="title-bar-content-text">评论 Comments</div>
          <BootstrapIconButton className="expand-icon">
            <img
              src={sendIcon}
              width="16px"
              height="16px"
              style={{ margin: "2px" }}
              onClick={handleSendComment}
            />
          </BootstrapIconButton>
        </div>
        {inputCommentRef && (
          <div className="comment-bar-ref">
            {inputCommentRef}
            <img
              className="send-icon"
              src={deleteIcon}
              width="16px"
              height="16px"
              onClick={() => {
                dispatch(setInputCommentRef(""));
              }}
            />
          </div>
        )}
        <TextArea
          className="comment-input"
          placeholder="输入评论"
          autoSize
          autoFocus
          value={inputCommentText}
          onChange={(e) => {
            setInputCommentText(e.target.value);
          }}
        />
      </div>
      <div className="comment-bar-content">
        {[...comments]
          .sort((a, b) => {
            return b.time - a.time;
          })
          .map((cm) => {
            return <CommentItem comment={cm} />;
          })}
      </div>
    </div>
  );
}
