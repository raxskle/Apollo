/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC, ReactNode, Ref, useEffect, useState } from "react";
import { cx, css } from "@emotion/css";
import "./SelectButton.scss";
import { useSlate } from "slate-react";
import { Editor, Element, Transforms } from "slate";
import { Select } from "../../../../../assets/icons/Select";
import { SketchPicker } from "react-color";
import { ElementDataList } from "../../../ElementDataList";
import { CustomElement } from "../../../../../types/editor";

export const Button = React.forwardRef(
  ({ className, reversed, ...props }: any, ref: Ref<HTMLSpanElement>) => (
    <div
      {...props}
      ref={ref}
      className={cx(
        className,
        css`
          cursor: pointer;
          padding: 4px;
          box-sizing: border-box;
          border-radius: 4px;
          &:hover {
            background-color: rgb(230, 230, 230);
          }
          color: ${reversed ? "black" : "black"};
          height: 26px;
          font-size: 14px;
          display: flex;
          align-items: center;

          svg,
          path {
            fill: ${reversed ? "rgb(180, 180, 180)" : "rgb(180, 180, 180)"};
          }
        `
      )}
    />
  )
);

type SelectType = "content-type" | "text-color" | "text-bg-color";

export const SelectButton: FC<{
  format: SelectType;
  children?: ReactNode;
}> = ({ format, children }) => {
  const editor = useSlate();

  const getCurrentNodeType = () => {
    // 获取当前选中的节点
    const [currentNode] = Editor.nodes(editor, {
      match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
    });

    const currentNodeType =
      currentNode && Element.isElement(currentNode[0])
        ? currentNode[0]?.type
        : "unknown";

    const transformText = (text: string) => {
      switch (text) {
        case "heading-one":
          return "Heading 1";
        case "heading-two":
          return "Heading 2";
        case "heading-three":
          return "Heading 3";
        case "paragraph":
          return "Text";
        case "block-quote":
          return "Quote";
        case "code":
          return "Code";
        case "check-list-item":
          return "Check List";
        case "numbered-list":
          return "Numbered List";
        case "bulleted-list":
          return "Bulleted List";
        default:
          return text;
      }
    };

    return transformText(currentNodeType);
  };

  const getTextColor = () => {
    // 获取当前文字的颜色
    if (!editor.selection) {
      return "black";
    }

    let marks;
    try {
      marks = Editor.marks(editor);
    } catch {
      Transforms.select(editor, {
        anchor: { path: editor.selection.anchor.path.concat([0]), offset: 0 },
        focus: { path: editor.selection.focus.path.concat([0]), offset: 0 },
      });
      marks = Editor.marks(editor);
    }

    return marks?.color;
  };

  const getTextBgColor = () => {
    // 获取当前文字的背景颜色
    if (!editor.selection) {
      return "black";
    }

    let marks;
    try {
      marks = Editor.marks(editor);
    } catch {
      Transforms.select(editor, {
        anchor: { path: editor.selection.anchor.path.concat([0]), offset: 0 },
        focus: { path: editor.selection.focus.path.concat([0]), offset: 0 },
      });
      marks = Editor.marks(editor);
    }

    return marks?.backgroundColor;
  };

  const getDisplayText = () => {
    switch (format) {
      case "content-type":
        return getCurrentNodeType();
      case "text-color":
        return <div style={{ color: getTextColor(), fontSize: "18px" }}>A</div>;
      case "text-bg-color":
        return (
          <div
            style={{
              background: getTextBgColor(),
              fontSize: "14px",
              borderRadius: "4px",
              border: "1px solid rgb(180, 180, 180)",
              width: "18px",
              height: "18px",
            }}
          ></div>
        );
      default:
        return "unknown";
    }
  };

  const [open, setOpen] = useState(false);

  useEffect(() => {
    // 监听点击事件，判断是否点击在按钮上
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      let c = target;
      while (c) {
        // 点击了修改元素类型面板，关闭菜单
        if (
          format === "content-type" &&
          c?.className === `select-btn-menu-${format}`
        ) {
          setOpen(false);
          return;
        }
        // 点击了按钮，打开菜单
        if (c?.className === `select-btn-container-${format}`) {
          setOpen(true);
          return;
        }
        c = c?.parentNode as HTMLElement;
      }
      // 点击到按钮以外的元素
      setOpen(false);
    };
    document.addEventListener("click", handler);

    return () => {
      document.removeEventListener("click", handler);
    };
  }, [format]);

  return (
    <div
      className={`select-btn-container-${format}`}
      style={{ position: "relative" }}
    >
      <Button>
        <div style={{ paddingLeft: "4px", paddingRight: "4px" }}>
          {getDisplayText()}
        </div>
        {children}
      </Button>
      <div
        className="select-btn-menu"
        style={{
          display: open ? "flex" : "none",
          cursor: "default",
          position: "absolute",
          top: "32px",
          left: "0px",
          background: "white",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          boxShadow: "0px 2px 6px 2px rgba(0, 0, 0, 0.1)",
          borderRadius: "4px",
          transition: "opacity 0.5s ease",
        }}
      >
        {format === "content-type" && <ContentTypeMenu />}
        {format === "text-color" && <TextColorMenu />}
        {format === "text-bg-color" && <TextBgColorMenu />}
      </div>
    </div>
  );
};

const ContentTypeMenu = () => {
  const editor = useSlate();
  const [currentNode] = Editor.nodes(editor, {
    match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
  });

  const currentNodeType =
    currentNode && Element.isElement(currentNode[0])
      ? currentNode[0]?.type
      : "unknown";

  const handleClick = (props: {
    type: string;
    [key: string]: string | boolean | number | CustomElement[];
  }) => {
    // 检查当前节点是否存在并且是一个元素节点
    // 将其转换为type
    if (currentNode && Element.isElement(currentNode[0])) {
      const nodeType = currentNode[0].type;
      if (nodeType !== props.type) {
        Transforms.setNodes(
          editor,
          { ...props },
          { match: (n) => n === currentNode[0] }
        );
      }
    }
  };

  return (
    <div className="select-btn-menu-content-type">
      <div className="select-btn-menu-content-title">转换为</div>
      {ElementDataList.map((el) => {
        return (
          <div
            className={`select-btn-menu-item ${currentNodeType === el.type ? "active" : ""}`}
            onClick={() => handleClick({ ...el.defaultData })}
          >
            {currentNodeType === el.type && <SelectIcon />}
            {el.displayName}
          </div>
        );
      })}
    </div>
  );
};

const SelectIcon = () => {
  return (
    <div
      style={{
        position: "absolute",
        left: "4px",
        top: "50%",
        height: "16px",
        transform: "translateX(0px) translateY(-50%)",
      }}
    >
      <Select style={{ fill: "rgb(180, 180, 180)" }} />
    </div>
  );
};

const TextColorMenu = () => {
  const editor = useSlate();
  const marks = Editor.marks(editor);

  if (!marks) {
    return <></>;
  }

  return (
    <div className="select-btn-menu-text-color" style={{ userSelect: "all" }}>
      <div className="select-btn-menu-content-title">字体颜色</div>
      <SketchPicker
        color={marks["color"] ?? "black"}
        onChange={({ rgb }) => {
          const newColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
          Editor.addMark(editor, "color", newColor);
        }}
      />
    </div>
  );
};

const TextBgColorMenu = () => {
  const editor = useSlate();
  const marks = Editor.marks(editor);

  if (!marks) {
    return <></>;
  }

  return (
    <div
      className="select-btn-menu-text-bg-color"
      style={{ userSelect: "all" }}
    >
      <div className="select-btn-menu-content-title">背景颜色</div>
      <SketchPicker
        color={marks["backgroundColor"] ?? "black"}
        onChange={({ rgb }) => {
          const newColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;
          Editor.addMark(editor, "backgroundColor", newColor);
        }}
      />
    </div>
  );
};
