import { RenderElementProps } from "slate-react";

export const ParagraphElement = (props: RenderElementProps) => {
  const { attributes, element, children } = props;
  if (element.type !== "paragraph") {
    return <div>类型出错</div>;
  }

  const empty =
    element.children.length === 0 ||
    (element.children.length === 1 && element.children[0].text.length === 0);

  return (
    <p
      {...attributes}
      style={{
        position: "relative",
        fontSize: "16px",
        padding: "4px 0px",
        margin: "0px",
        textAlign: element.align,
      }}
    >
      {children}
      {empty && (
        <span
          className="empty-placeholder"
          contentEditable="false"
          style={{
            userSelect: "none",
            pointerEvents: "none",
            position: "absolute",
            top: "0px",
            left: "0px",
            fontSize: "16px",
            padding: "4px 0px",
            margin: "0px",
            color: "rgba(180, 180, 180, 0.6)",
          }}
        >
          Enter text...
        </span>
      )}
    </p>
  );
};
