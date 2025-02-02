import { RenderElementProps } from "slate-react";
import { AddBar } from "./AddBar/AddBar";
import "./ElementWithAddBar.scss";
import { useState } from "react";
import { Element } from "../Elements";

type ElementWithAddBarType = {
  elementProps: RenderElementProps;
};

// 悬浮左侧添加元素bar
export const ElementWithAddBar = (props: ElementWithAddBarType) => {
  const { elementProps } = props;
  const [showAddBar, setShowAddBar] = useState(false);

  if (elementProps.element.type === "list-item") {
    return <Element {...elementProps} />;
  }

  return (
    <div
      className="element-add-bar-container"
      onMouseOver={() => {
        setShowAddBar(true);
      }}
      onMouseLeave={() => {
        setShowAddBar(false);
      }}
    >
      <AddBar element={elementProps.element} showAddBar={showAddBar} />
      <Element {...elementProps} />
    </div>
  );
};
