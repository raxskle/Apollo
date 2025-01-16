import { RenderElementProps } from "slate-react";

export const CodeElement = (props: RenderElementProps) => {
  if (props.element.type !== "code") {
    return <div>类型出错</div>;
  }
  return (
    <pre
      {...props.attributes}
      style={{
        background: "rgba(9, 28, 65, 0.05)",
        fontSize: "16px",
        textWrap: "wrap",
        margin: "0px 0px",
        padding: "2px 4px",
        fontFamily: "cursive",
      }}
    >
      <code className="language-javascript">{props.children}</code>
    </pre>
  );
};
