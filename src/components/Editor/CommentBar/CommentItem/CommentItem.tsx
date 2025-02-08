import { Comment } from "../../../../store/docSlice";
import "./CommentItem.scss";
import { getRelativeTime } from "../../../../utils";
import Avatar from "@mui/material/Avatar";

type CommentItemProps = {
  comment: Comment;
};

export function CommentItem(props: CommentItemProps) {
  const { comment } = props;

  return (
    <div className="comment-bar-item">
      {comment.ref && <div className="comment-bar-item-ref">{comment.ref}</div>}
      <div className="comment-bar-item-card">
        <div className="comment-bar-item-info">
          <Avatar
            alt={comment.author.name}
            style={{
              width: "24px",
              height: "24px",
              fontSize: "10px",
              marginRight: "8px",
              background: comment.author.displayColor,
            }}
          >
            {comment.author.name.slice(0, 4)}
          </Avatar>
          <div className="comment-bar-item-author">{comment.author.name}</div>
          <div className="comment-bar-item-date">
            {getRelativeTime(comment.time)}
          </div>
        </div>
        <div className="comment-bar-item-content">{comment.content}</div>
      </div>
    </div>
  );
}
