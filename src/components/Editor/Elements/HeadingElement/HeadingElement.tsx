import { RenderElementProps } from "slate-react";

const HeadingElementContent = (props: RenderElementProps) => {
  const { element, children } = props;
  if (
    element.type !== "heading-one" &&
    element.type !== "heading-two" &&
    element.type !== "heading-three"
  ) {
    return <div>类型出错</div>;
  }
  const empty =
    element.children.length === 0 ||
    (element.children.length === 1 && element.children[0].text.length === 0);

  return (
    <>
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
            fontWeight: "normal",
            color: "rgba(180, 180, 180, 0.6)",
          }}
        >
          {element.type === "heading-one" && "Heading1"}
          {element.type === "heading-two" && "Heading2"}
          {element.type === "heading-three" && "Heading3"}
        </span>
      )}
    </>
  );
};

export const HeadingElement = (props: RenderElementProps) => {
  const { attributes, element } = props;

  switch (element.type) {
    case "heading-one":
      return (
        <h1
          {...attributes}
          style={{
            position: "relative",
            textAlign: element.align,
          }}
        >
          <HeadingElementContent {...props} />
        </h1>
      );
    case "heading-two":
      return (
        <h2
          {...attributes}
          style={{
            position: "relative",
            textAlign: element.align,
          }}
        >
          <HeadingElementContent {...props} />
        </h2>
      );
    case "heading-three":
      return (
        <h3
          {...attributes}
          style={{
            position: "relative",
            textAlign: element.align,
          }}
        >
          <HeadingElementContent {...props} />
        </h3>
      );
    default:
      return <></>;
  }
};
