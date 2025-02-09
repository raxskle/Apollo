import { useEffect, useRef } from "react";
import { css } from "@emotion/css";
import "./HoveringToolbar.scss";
import { Editor, Range, Element } from "slate";
import { useSlate, useFocused } from "slate-react";

import { Portal } from "../../index";

import { Bold } from "../../../assets/icons/Bold";
import { Menu } from "./Menu/Menu";
import { Italic } from "../../../assets/icons/Italic";
import { Underlined } from "../../../assets/icons/Underlined";
import { CommentIcon } from "../../../assets/icons/Comment";
import { Code } from "../../../assets/icons/Code";
import { ToggleButton } from "./Menu/ToggleButton/ToggleButton";
import { SelectButton } from "./Menu/SelectButton/SelectButton";
import { ExpandDown } from "../../../assets/icons/ExpandDown";
import { AlignType, CustomElement } from "../../../types/editor";
import { AlignLeft } from "../../../assets/icons/AlignLeft";
import { AlignCenter } from "../../../assets/icons/AlignCenter";
import { AlignRight } from "../../../assets/icons/AlignRight";
import { NormalButton } from "./Menu/NormalButton/NormalButton";
import { useDispatch, useSelector } from "react-redux";
import {
  setInputCommentRef,
  switchShowCommentBar,
} from "../../../store/viewSlice";
import { RootState } from "../../../store";

// 可以设置align的元素
const isAlignElement = (
  element: CustomElement | null
): element is CustomElement & { align: AlignType } => {
  return element
    ? ["heading-one", "heading-two", "heading-three", "paragraph"].includes(
        element.type
      )
    : false;
};

export const HoveringToolbar = () => {
  const ref = useRef<HTMLDivElement>();
  const editor = useSlate();
  const inFocus = useFocused();

  useEffect(() => {
    const el = ref.current; // menu
    const { selection } = editor;
    const domSelection = window.getSelection();

    if (!el) {
      return;
    }

    if (
      !selection ||
      !inFocus ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === "" ||
      !domSelection
    ) {
      el.removeAttribute("style");
      return;
    }

    // 计算位置 显示在光标位置的上方
    const rangeCount = domSelection.rangeCount;
    const domRange = rangeCount > 0 ? domSelection.getRangeAt(0) : null;
    if (!domRange) {
      el.removeAttribute("style");
      return;
    }

    const rect = domRange.getBoundingClientRect();
    el.style.opacity = "1";
    el.style.top = `${rect.top + window.scrollY - el.offsetHeight}px`;
    // tooltip左右距离边界至少10px
    const leftBounding = Math.max(
      rect.left + window.scrollX - el.offsetWidth / 2 + rect.width / 2,
      10
    );
    const rightBounding = Math.min(
      leftBounding,
      window.innerWidth - el.offsetWidth - 10
    );
    el.style.left = `${rightBounding}px`;
  });

  // 获取当前选中的节点
  const [currentNode] = Editor.nodes(editor, {
    match: (n) => Element.isElement(n) && Editor.isBlock(editor, n),
  });
  const element =
    currentNode && Element.isElement(currentNode[0]) ? currentNode[0] : null;

  const dispatch = useDispatch();
  const showCommentBar = useSelector(
    (state: RootState) => state.view.showCommentBar
  );

  const handleCommentRef = () => {
    if (editor.selection) {
      // 获取选中的文本内容
      const refText = Editor.string(editor, editor.selection);
      dispatch(setInputCommentRef(refText));
      if (!showCommentBar) {
        dispatch(switchShowCommentBar());
      }
    }
  };

  return (
    <Portal>
      <Menu
        ref={ref}
        className={css`
          padding: 8px 12px;
          position: absolute;
          z-index: 1000;
          top: -10000px;
          left: -10000px;
          margin-top: -10px;
          opacity: 0;
          background-color: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0px 2px 6px 2px rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          transition: opacity 0.5s ease;
        `}
        onMouseDown={(e: { preventDefault: () => void }) => {
          // prevent toolbar from taking focus away from editor
          e.preventDefault();
        }}
      >
        <SelectButton format="content-type">
          <ExpandDown
            style={{
              width: "1.2em",
              height: "1.2em",
              fill: "rgb(180, 180, 180)",
            }}
          />
        </SelectButton>
        <ToggleButton format="bold" icon={"bold"}>
          <Bold />
        </ToggleButton>
        <ToggleButton format="italic" icon={"italic"}>
          <Italic />
        </ToggleButton>
        <ToggleButton format="underlined" icon={"underlined"}>
          <Underlined />
        </ToggleButton>
        <ToggleButton format="code" icon={"code"}>
          <Code />
        </ToggleButton>
        <SelectButton format="text-color">
          <ExpandDown
            style={{
              width: "1.2em",
              height: "1.2em",
              fill: "rgb(180, 180, 180)",
            }}
          />
        </SelectButton>
        <SelectButton format="text-bg-color">
          <ExpandDown
            style={{
              width: "1.2em",
              height: "1.2em",
              fill: "rgb(180, 180, 180)",
            }}
          />
        </SelectButton>
        {isAlignElement(element) && (
          <>
            <ToggleButton format="align" icon={"align"} value={AlignType.Left}>
              <AlignLeft
                width={"1.2em"}
                height={"1.2em"}
                color={"rgb(180, 180, 180)"}
              />
            </ToggleButton>
            <ToggleButton
              format="align"
              icon={"align"}
              value={AlignType.Center}
            >
              <AlignCenter
                width={"1.2em"}
                height={"1.2em"}
                color={"rgb(180, 180, 180)"}
              />
            </ToggleButton>
            <ToggleButton format="align" icon={"align"} value={AlignType.Right}>
              <AlignRight
                width={"1.2em"}
                height={"1.2em"}
                color={"rgb(180, 180, 180)"}
              />
            </ToggleButton>
          </>
        )}
        <NormalButton onClick={handleCommentRef}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginLeft: "4px",
              marginRight: "4px",
            }}
          >
            <CommentIcon />
            <div style={{ marginLeft: "4px", fontSize: "14px" }}>Comment</div>
          </div>
        </NormalButton>
      </Menu>
    </Portal>
  );
};
