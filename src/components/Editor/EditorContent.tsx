import { useCallback, useEffect, useMemo } from "react";
import "./EditorContent.scss";
import { OTClient } from "../../../server/ot/index";
import {
  createEditor,
  Text,
  Editor,
  Transforms,
  Element as SlateElement,
  Operation as SlateOperation,
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
import {
  updateCollaborators,
  changeDocumentContent,
  Collaborator,
  Document,
  initDocument,
} from "../../store/reducers";
import { Client, Operation } from "../../lib/ot";

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

// 封装处理编辑器修改的逻辑
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
    const client = new Client();
    client.socketAdaptor.resigterAction<{ data: [string, OTClient][] }>(
      "updateUserCount",
      (res) => {
        const userList = res.data;
        console.log("???updateUserCount", userList);
        // 更新user

        dispatch(
          updateCollaborators({
            collaborators: userList.map((item) => {
              const [socketId, user] = item;
              return new Collaborator(
                socketId,
                user.userName,
                user.displayColor
              );
            }),
          })
        );
      }
    );
    client.socketAdaptor.resigterAction<Document>("initialDocument", (res) => {
      dispatch(
        initDocument({
          document: res,
        })
      );
      Transforms.insertNodes(editor, res.content);
    });

    // 监听editor的变化
    const rawOnChange = editor.onChange;
    editor.onChange = (options?: { operation?: SlateOperation }) => {
      rawOnChange.call(editor, options);
      if (!options || !options?.operation) {
        console.error("slate change>>>>>>>>>>>>>operation is undefined");
        return;
      }

      console.log("slate change>>>>>>>>>>>operation", options.operation);
      client.applyClient(new Operation([options.operation]));
      // console.log("slate change>>>>>>>>>>>>>editor", editor);
    };

    return () => {
      client.destroy();
      // 取消监听
      editor.onChange = rawOnChange;
    };
  }, [editor, dispatch]);

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
