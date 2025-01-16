import { RenderElementProps } from "slate-react";

export const BlockQuoteElement = (props: RenderElementProps) => {
  if (props.element.type !== "block-quote") {
    return <div>类型出错</div>;
  }
  return (
    <blockquote
      {...props.attributes}
      style={{
        textWrap: "wrap",
        fontStyle: "italic",
        color: "rgb(180, 180, 180)",
        borderLeft: "4px solid rgb(180, 180, 180)",
        padding: "6px",
        margin: "10px 0px",
      }}
    >
      {props.children}
    </blockquote>
  );
};
