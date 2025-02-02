import { RenderElementProps } from "slate-react";

export const BulletedListElement = (props: RenderElementProps) => {
  const { element, attributes, children } = props;

  if (element.type !== "bulleted-list") {
    return <div>类型出错</div>;
  }
  return (
    <ul
      {...attributes}
      style={{
        paddingLeft: "20px",
        margin: "0px",
        marginTop: "10px",
        marginBottom: "10px",
        position: "relative",
      }}
    >
      {children}
    </ul>
  );
};
