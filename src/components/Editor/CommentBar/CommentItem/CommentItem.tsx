import { useSlateStatic } from "slate-react";
import { Comment } from "../../../../store/docSlice";
import "./CommentItem.scss";
import { getRelativeTime } from "../../../../utils";

type CommentItemProps = {
  comment: Comment;
};

export function CommentItem(props: CommentItemProps) {
  const { comment } = props;

  const editor = useSlateStatic();
  console.log(">>>>>>>>>>", editor.children[0]);

  return (
    <div className="comment-bar-item">
      <div className="comment-bar-item-ref">
        {comment.ref?.children[0].text}
      </div>
      <div className="comment-bar-item-card">
        <div className="comment-bar-item-info">
          <div className="comment-bar-item-avator"></div>
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
