import { useSelector } from "react-redux";
import "./LeftSideBar.scss";
import { RootState } from "../../../store";
import { CustomElement, HeadingElement } from "../../../types/editor";
import { Descendant } from "slate";

const isHeadingElement = (
  item: CustomElement | Descendant
): item is HeadingElement => {
  return item.type
    ? ["heading-one", "heading-two", "heading-three"].includes(item.type)
    : false;
};

const isHeadingElementList = (list: Descendant[]): list is HeadingElement[] => {
  return list.every((item) => {
    return isHeadingElement(item);
  });
};
export function LeftSideBar() {
  const { content } = useSelector((state: RootState) => state.document);

  const headings = content.filter((item) => {
    return isHeadingElement(item);
  });

  return (
    <div className="left-sidebar-container">
      <div className="left-sidebar">
        {headings.slice(0, 30).map((item, index) => {
          return (
            <div className={`catalogue-item-${item.type}`} key={index}></div>
          );
        })}
        <div className="detail-bar">
          {isHeadingElementList(headings) &&
            headings.map((heading, index) => {
              return (
                <div
                  className="detail-item"
                  key={index}
                  style={{
                    marginLeft:
                      heading.type === "heading-two"
                        ? "16px"
                        : heading.type === "heading-three"
                          ? "32px"
                          : "0px",
                  }}
                >
                  {heading.children[0].text}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
