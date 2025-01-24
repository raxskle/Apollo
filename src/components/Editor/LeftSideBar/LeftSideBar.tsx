import "./LeftSideBar.scss";
import { CustomElement, HeadingElement } from "../../../types/editor";
import { Descendant, Element } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";

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
  const editor = useSlateStatic();
  const content = editor.children.filter((node) => Element.isElement(node));

  const headings = content.filter((item) => {
    return (
      isHeadingElement(item) &&
      item.children.length > 0 &&
      item.children[0].text.length > 0
    );
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
              const scrollToElement = () => {
                const domNode = ReactEditor.toDOMNode(editor, heading);
                if (domNode) {
                  domNode.scrollIntoView({ behavior: "smooth" });
                }
              };

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
                  onClick={scrollToElement}
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
