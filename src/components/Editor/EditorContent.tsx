import { useCallback, useEffect, useMemo } from "react";
import "./EditorContent.scss";

import {
  createEditor,
  Text,
  Editor,
  Transforms,
  Element as SlateElement,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import { withHistory } from "slate-history";
import { CustomEditorType } from "../../types/editor";
import { HoveringToolbar } from "./HoveringToolbar/HoveringToolbar";
import { LeftSideBar } from "./LeftSideBar/LeftSideBar";
import { ElementWithAddBar } from "./ElementWithAddBar/ElementWithAddBar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../store";
import { changeDocumentContent } from "../../store/reducers";

// 文本leaf样式
const Leaf = (props: RenderLeafProps) => {
  return (
    <span
      {...props.attributes}
      style={{
        fontWeight: props.leaf.bold ? "bold" : "normal",
        textDecoration: props.leaf.underlined ? "underline" : "none",
        fontStyle: props.leaf.italic ? "italic" : "normal",
        color: props.leaf.color ? props.leaf.color : "black",
        backgroundColor: props.leaf.backgroundColor
          ? props.leaf.backgroundColor
          : "transparent",
      }}
    >
      {props.leaf.code || props.leaf.type === "code" ? (
        <code
          style={{
            background: "rgba(9, 28, 65, 0.05)",
            textWrap: "wrap",
            margin: "8px 0px",
            padding: "6px 4px",
          }}
        >
          {props.children}
        </code>
      ) : (
        <>{props.children}</>
      )}
    </span>
  );
};

// 命令处理逻辑
const CustomEditor = {
  isBoldMarkActive(editor: CustomEditorType) {
    const [match] = Editor.nodes(editor, {
      match: (n) => Text.isText(n) && n.bold === true,
      universal: true,
    });

    return !!match;
  },

  isCodeBlockActive(editor: CustomEditorType) {
    const [match] = Editor.nodes(editor, {
      match: (n) => SlateElement.isElement(n) && n.type === "code",
    });

    return !!match;
  },

  toggleBoldMark(editor: CustomEditorType) {
    const isActive = CustomEditor.isBoldMarkActive(editor);
    Transforms.setNodes(
      editor,
      { bold: isActive ? undefined : true },
      { match: (n) => Text.isText(n), split: true }
    );
  },

  toggleCodeBlock(editor: CustomEditorType) {
    const isActive = CustomEditor.isCodeBlockActive(editor);
    Transforms.setNodes(
      editor,
      { type: isActive ? undefined : "code" },
      { match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n) }
    );
  },
};

export function EditorContent() {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const document = useSelector((state: RootState) => state.document);
  const dispatch = useDispatch();

  const renderElement = useCallback(
    (props: RenderElementProps) => <ElementWithAddBar elementProps={props} />,
    []
  );

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  // const [operations, setOperations] = useState<>([]);

  useEffect(() => {
    // 监听editor的变化
    const rawOnChange = editor.onChange;
    editor.onChange = (options) => {
      rawOnChange.call(editor, options);

      console.log(options);
      console.log(editor.operations);
      console.log(editor.history);
    };
  }, [editor]);

  return (
    <div className="editor-content">
      <LeftSideBar />
      <Slate
        editor={editor}
        initialValue={document.content}
        onChange={(value) => {
          dispatch(changeDocumentContent({ content: value }));
        }}
      >
        <HoveringToolbar />
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={(event) => {
            if (!event.ctrlKey) {
              return;
            }
            switch (event.key) {
              case "`": {
                event.preventDefault();
                CustomEditor.toggleCodeBlock(editor);
                break;
              }

              case "b": {
                event.preventDefault();
                CustomEditor.toggleBoldMark(editor);
                break;
              }
            }
          }}
        />
      </Slate>
    </div>
  );
}
