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
  changeDocumentTitle,
} from "../../store/docSlice";
import { Client, Operation } from "../../lib/ot";
import { CommentBar } from "./CommentBar/CommentBar";
import { getSocket } from "../../network";
import { RemoteSelection, useRemoteSelection } from "./useRemoteSelection";
import { cloneDeep } from "lodash";

// 文本leaf样式
const Leaf = (props: RenderLeafProps) => {
  return (
    <span
      {...props.attributes}
      style={{
        position: "relative",
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

      {/* 选中 */}
      {props.leaf.isSelection && (
        <span
          className="remote-selection"
          {...props.attributes}
          style={{
            borderRight: `0.08em solid ${props.leaf.selectionUser?.displayColor}`,
            opacity: "0.6",
          }} // 40 表示透明度
        >
          <div
            className="remote-selection-bar"
            style={{
              backgroundColor: `${props.leaf.selectionUser?.displayColor}`,
            }}
          >
            <div
              className="remote-selection-detail"
              contentEditable="false"
              style={{
                backgroundColor: `${props.leaf.selectionUser?.displayColor}`,
              }}
            >
              {props.leaf.selectionUser?.userId}
            </div>
          </div>
        </span>
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

  const document = useSelector((state: RootState) => state.doc.document);
  const dispatch = useDispatch();

  const { decorate, setRemoteSelections } = useRemoteSelection();

  const renderElement = useCallback(
    (props: RenderElementProps) => <ElementWithAddBar elementProps={props} />,
    []
  );

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  useEffect(() => {
    const client = new Client(editor, getSocket());

    // 注册socket处理 更新用户数量
    const handleUpdateUserCount = (res: { data: [string, OTClient][] }) => {
      const userList = res.data;
      // 更新user

      dispatch(
        updateCollaborators({
          collaborators: userList.map((item) => {
            const [socketId, user] = item;
            return new Collaborator(socketId, user.userName, user.displayColor);
          }),
        })
      );

      // 用户光标取消显示
      setRemoteSelections((prev) => {
        const newSelections = cloneDeep(prev);

        Object.keys(newSelections).forEach((userId) => {
          if (!userList.find((item) => item[1].userName === userId)) {
            delete newSelections[userId];
          }
        });

        return newSelections;
      });
    };
    client.socketAdaptor.resigterAction<{ data: [string, OTClient][] }>(
      "updateUserCount",
      handleUpdateUserCount
    );

    // 注册socket处理 初始化文档
    const handleInitialDocument = (res: Document) => {
      dispatch(
        initDocument({
          document: res,
        })
      );
      client.setRevision(res.version); // Client版本同步
      console.log("init document", res);
      Transforms.insertNodes(editor, res.content);
    };
    client.socketAdaptor.resigterAction<Document>(
      "initialDocument",
      handleInitialDocument
    );

    // 注册socket处理 远端用户光标
    const handleRemoteSelection = (selection: RemoteSelection) => {
      setRemoteSelections((prev) => ({
        ...prev,
        [selection.userId]: selection,
      }));
    };
    client.socketAdaptor.resigterAction<RemoteSelection>(
      "updateRemoteSelection",
      handleRemoteSelection
    );

    // 监听editor的变化
    let operations: SlateOperation[] = [];
    const rawOnChange = editor.onChange;
    editor.onChange = (options?: { operation?: SlateOperation }) => {
      rawOnChange.call(editor, options);
      if (!options || !options?.operation) {
        console.error("slate change>>>>>>>>>>>>>operation is undefined");
        return;
      }
      if (options.operation.applyServer) {
        // 应用服务端op
        return;
      }

      if (options.operation.type === "set_selection") {
        // 选中
        const socket = getSocket();
        socket.emit("updateRemoteSelection", {
          focus: options.operation.newProperties?.focus,
        });
        return;
      }

      // 拿history的op发送给服务端

      // 拿到history
      const history = editor.history.undos
        .map((item) => {
          return item.operations;
        })
        .flat(1);
      console.log(">>>>>>>>>>history", history);

      // 如果是撤销
      // todo: 当前 let operations 记录从页面打开开始，撤销时会将其它用户操作撤销掉
      // 诸多问题，撤销最后在做
      if (history.length < operations.length) {
        client.applyClient(
          new Operation(
            operations.slice(history.length).map((op) => {
              return { ...op, undo: true };
            }),
            client.revision
          )
        );
      } else {
        // 应用新的op
        // 来自applyServer的op不触发
        const newOps = history.slice(operations.length).filter((op) => {
          return !op.applyServer;
        });
        // history多出的部分，可能是来自applyServer
        if (newOps.length > 0) {
          client.applyClient(new Operation([...newOps], client.revision));
        }
      }

      // 更新记录
      operations = history;
    };

    return () => {
      client.destroy();
      client.socketAdaptor.offAction<{ data: [string, OTClient][] }>(
        "updateUserCount",
        handleUpdateUserCount
      );

      client.socketAdaptor.offAction<Document>(
        "initialDocument",
        handleInitialDocument
      );

      client.socketAdaptor.offAction<RemoteSelection>(
        "updateRemoteSelection",
        handleRemoteSelection
      );
      // 取消监听
      editor.onChange = rawOnChange;
    };
  }, [editor, dispatch, setRemoteSelections]);

  useEffect(() => {
    const socket = getSocket();
    const handleChangeDocTitle = (title: string) => {
      dispatch(changeDocumentTitle({ title: title }));
    };
    socket.on("changeDocTitle", handleChangeDocTitle);

    return () => {
      socket.off("changeDocTitle", handleChangeDocTitle);
    };
  }, [dispatch]);

  const { showCommentBar } = useSelector((state: RootState) => state.view);

  return (
    <>
      <div className="editor-content">
        {document.content.length > 0 && (
          <>
            <Slate
              editor={editor}
              initialValue={document.content}
              onChange={(value) => {
                dispatch(changeDocumentContent({ content: value }));
              }}
            >
              <LeftSideBar />
              <HoveringToolbar />
              <Editable
                decorate={decorate}
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
              <CommentBar />
            </Slate>
          </>
        )}
      </div>
      <div
        className="comment-bar-block"
        style={{ width: showCommentBar ? "280px" : "0px" }}
      ></div>
    </>
  );
}
