import "./NumberedListElement.scss";

import { RenderElementProps } from "slate-react";

export const NumberedListElement = (props: RenderElementProps) => {
  const { element, attributes, children } = props;

  if (element.type !== "numbered-list") {
    return <div>类型出错</div>;
  }
  return (
    <ol
      {...attributes}
      style={{
        paddingLeft: "20px",
        margin: "0px",
        marginTop: "8px",
        marginBottom: "8px",
        position: "relative",
      }}
    >
      {children}
    </ol>
  );
};
