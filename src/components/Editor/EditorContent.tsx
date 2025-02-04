import { useCallback, useEffect, useMemo, useState } from "react";
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
  updateLastModified,
} from "../../store/docSlice";
import { getClient, Operation } from "../../lib/ot";
import { CommentBar } from "./CommentBar/CommentBar";
import { getSocket } from "../../network";
import { RemoteSelection, useRemoteSelection } from "./useRemoteSelection";
import { cloneDeep } from "lodash";
import { useNavigate, useSearchParams } from "react-router";

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
              {props.leaf.selectionUser?.userName}
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

  const {
    decorate,
    setRemoteSelections,
    transformSelection,
    // remoteSelections,
  } = useRemoteSelection();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const docId = searchParams.get("id");
  console.log("docid", docId);

  const renderElement = useCallback(
    (props: RenderElementProps) => <ElementWithAddBar elementProps={props} />,
    []
  );

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  const [operations, setOperations] = useState<SlateOperation[]>([]);

  const userId = useSelector((state: RootState) => state.doc.user.id);

  useEffect(() => {
    // 未登录跳转登录页
    // todo 登陆完跳回来
    if (!userId) {
      navigate("/");
    }
  }, [navigate, userId]);

  useEffect(() => {
    if (!docId) {
      navigate("/");

      return;
    }

    const client = getClient(editor, docId, userId);

    // 注册applyServer处理
    const handleApplyServer = ({
      operation,
      lastModified,
    }: {
      operation: Operation;
      lastModified: number;
    }) => {
      const operationData = Operation.formData(operation);
      client.applyServer(operationData);
      dispatch(updateLastModified({ lastModified }));
    };
    client.socketAdaptor.resigterAction<{
      operation: Operation;
      lastModified: number;
    }>("applyServer", handleApplyServer);

    // 注册socket处理 更新用户数量
    const handleUpdateUserCount = (res: { data: [string, OTClient][] }) => {
      const userList = res.data;
      // 更新user

      dispatch(
        updateCollaborators({
          collaborators: userList
            .map((item) => {
              const [, OTClient] = item;
              return new Collaborator(
                OTClient.user.id,
                OTClient.user.name,
                OTClient.user.displayColor
              );
            })
            .filter((c) => {
              return c.id !== userId;
            }),
        })
      );

      // 用户光标取消显示
      setRemoteSelections((prev) => {
        const newSelections = cloneDeep(prev);

        Object.keys(newSelections).forEach((userId) => {
          if (!userList.find(([, OTClient]) => OTClient.user.id === userId)) {
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
        [selection.user.id]: selection,
      }));
    };
    client.socketAdaptor.resigterAction<RemoteSelection>(
      "updateRemoteSelection",
      handleRemoteSelection
    );

    // 监听editor的变化
    const rawOnChange = editor.onChange;
    editor.onChange = (options?: { operation?: SlateOperation }) => {
      rawOnChange.call(editor, options);
      if (!options || !options?.operation) {
        console.error("slate change>>>>>>>>>>>>>operation is undefined");
        return;
      }

      // 拿到最新的editor history记录
      const history = editor.history.undos
        .map((item) => {
          return item.operations;
        })
        .flat(1);
      console.log("editor history >>>>>>>>>>", history);

      // 根据实际应用的op更新remoteSelection光标
      if (history.length >= operations.length) {
        const newOps = history.slice(operations.length);
        if (newOps.length > 0) {
          // 处理光标
          transformSelection(newOps);
        }
      }

      // 更新记录
      setOperations(history);

      // 应用服务端op
      if (options.operation.applyServer) {
        // 服务端op触发onChange时，直接return，不触发applyClient
        return;
      }

      if (options.operation.type === "set_selection") {
        // 选中，不作为op发送，通过updateRemoteSelection发送
        const socket = getSocket();
        socket.emit("updateRemoteSelection", {
          focus: options.operation.newProperties?.focus,
        });
        return;
      }

      // 拿history的op发送给服务端applyClient

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
          const init = client.applyClient(
            new Operation([...newOps], client.revision)
          );
          if (!init) {
            // 更新lastModified
            dispatch(updateLastModified({ lastModified: Date.now() }));
          }
        }
      }
    };

    return () => {
      client.socketAdaptor.offAction<{
        operation: Operation;
        lastModified: number;
      }>("applyServer", handleApplyServer);

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
  }, [
    editor,
    dispatch,
    setRemoteSelections,
    operations,
    transformSelection,
    docId,
    navigate,
  ]);

  useEffect(() => {
    const socket = getSocket();
    const handleChangeDocTitle = ({
      title,
      lastModified,
    }: {
      title: string;
      lastModified: number;
    }) => {
      dispatch(changeDocumentTitle({ title }));
      dispatch(updateLastModified({ lastModified }));
    };
    socket.on("changeDocTitle", handleChangeDocTitle);

    return () => {
      socket.off("changeDocTitle", handleChangeDocTitle);
    };
  }, [dispatch]);

  const { showCommentBar } = useSelector((state: RootState) => state.view);

  return (
    <>
      <div className="editor-content" id="editor-content">
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
