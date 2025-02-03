import { useNavigate } from "react-router";
import "./DocItem.scss";
import { getRelativeTime } from "../../../utils";

type DocItemProps = {
  doc: {
    title: string;
    lastModified: number;
    docId: string;
  };
};

function DocItem(props: DocItemProps) {
  const { doc } = props;
  const navigate = useNavigate();
  return (
    <div
      className="doc-item"
      onClick={() => {
        navigate(`/doc?id=${doc.docId}`);
      }}
    >
      <div className="doc-item-wrap">
        <div className="doc-item-title">{doc.title}</div>
        <div className="doc-item-last-modified">
          最近修改：{getRelativeTime(doc.lastModified)}
        </div>
      </div>
    </div>
  );
}

export default DocItem;
