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
  NodeEntry,
  Range,
} from "slate";
import {
  Slate,
  Editable,
  withReact,
  RenderElementProps,
  RenderLeafProps,
} from "slate-react";
import { withHistory } from "slate-history";
import { CustomEditorType, isCustomText } from "../../types/editor";
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
  DocFont,
  changeDocumentFontFamily,
} from "../../store/docSlice";
import { getClient, Operation } from "../../lib/ot";
import { CommentBar } from "./CommentBar/CommentBar";
import { getSocket } from "../../network";
import { RemoteSelection, useRemoteSelection } from "./useRemoteSelection";
import { cloneDeep } from "lodash";
import { useNavigate, useSearchParams } from "react-router";
import { prismThemeCss } from "./Elements/CodeBlockElement/CodeBlockElement";
import { useDecorateCodeBlock } from "./Elements/CodeBlockElement/useDecorateCodeBlock";

import {
  decorateInlineCode,
  SetNodeToDecorations,
} from "./Elements/CodeBlockElement/decorateCode";
import { useDecorateSearch } from "../../pages/EditorPage/NavBar/SearchBar/useDecorateSearch";
import { css, cx } from "@emotion/css";

// 文本leaf样式
const Leaf = (props: RenderLeafProps) => {
  const { attributes, children, leaf } = props;

  const {
    bold,
    underlined,
    italic,
    color,
    backgroundColor,
    code,
    type,
    isSelection,
    selectionUser,
    highlight,
    ...rest
  } = leaf;

  return (
    <span
      {...attributes}
      {...(highlight && { "data-cy": "search-highlighted" })}
      style={{
        position: "relative",
        fontWeight: bold ? "bold" : "normal",
        textDecoration: underlined ? "underline" : "none",
        fontStyle: italic ? "italic" : "normal",
        color: color ?? "black",
        backgroundColor: highlight
          ? "#ffeeba"
          : (backgroundColor ?? "transparent"),
        borderRadius: highlight ? "4px" : "",
      }}
    >
      {/* 行内code */}
      {code || type === "code" ? (
        <code
          className="language-javascript"
          style={{
            background: "rgba(209, 213, 222, 0.4)",
            textWrap: "wrap",
            margin: "8px 0px",
            padding: "0px",
          }}
        >
          <span
            className={Object.keys(rest)
              .filter((key) => key !== "text")
              .join(" ")}
          >
            {children}
          </span>
        </code>
      ) : (
        // 此处span加className是为了给prism渲染，同时不被外层style覆盖
        <span
          className={Object.keys(rest)
            .filter((key) => key !== "text")
            .join(" ")}
        >
          {children}
        </span>
      )}

      {/* 选中 */}
      {isSelection && (
        <span
          className="remote-selection"
          {...attributes}
          style={{
            borderRight: `0.08em solid ${selectionUser?.displayColor}`,
            opacity: "0.6",
          }} // 40 表示透明度
        >
          <div
            className="remote-selection-bar"
            style={{
              backgroundColor: `${selectionUser?.displayColor}`,
            }}
          >
            <div
              className="remote-selection-detail"
              contentEditable="false"
              style={{
                backgroundColor: `${selectionUser?.displayColor}`,
              }}
            >
              {selectionUser?.userName}
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
      match: (n) => isCustomText(n) && n.type === "code",
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
    decorateSelection,
    setRemoteSelections,
    transformSelection,
    // remoteSelections,
  } = useRemoteSelection();

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const docId = searchParams.get("id");

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
      console.log("init document >>>>>>>>>>>", res);
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
    userId,
  ]);

  // 修改标题
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

  // 修改字体
  const docFontFamily = useSelector(
    (state: RootState) => state.doc.document.fontFamily
  );
  useEffect(() => {
    const socket = getSocket();
    const handleChangeDocFontFamily = ({
      fontFamily,
      lastModified,
    }: {
      fontFamily: DocFont;
      lastModified: number;
    }) => {
      dispatch(changeDocumentFontFamily(fontFamily));
      dispatch(updateLastModified({ lastModified }));
    };
    socket.on("changeDocFontFamily", handleChangeDocFontFamily);

    return () => {
      socket.off("changeDocFontFamily", handleChangeDocFontFamily);
    };
  }, [dispatch]);

  const { showCommentBar } = useSelector((state: RootState) => state.view);

  const fullWidth = useSelector((state: RootState) => state.view.fullWidth);

  // code
  const decorateCodeBlock = useDecorateCodeBlock(editor);
  const { decorateSearch } = useDecorateSearch();

  const decorate = ([node, path]: NodeEntry): Range[] => {
    const codeBlockRanges = decorateCodeBlock([node, path]);
    const selectionRanges = decorateSelection([node, path]);
    const inlineCodeRanges = decorateInlineCode([node, path]);
    const searchRanges = decorateSearch([node, path]);
    const ranges = selectionRanges
      .concat(codeBlockRanges)
      .concat(inlineCodeRanges)
      .concat(searchRanges);

    return ranges;
  };

  return (
    <>
      <div
        className={cx(
          "editor-content",
          css(`
            > div[role="textbox"]{
              max-width: ${fullWidth ? " " : "1000px"};
              font-family: ${docFontFamily};
            }
        `)
        )}
        id="editor-content"
      >
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
              <SetNodeToDecorations />
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
              <style>{prismThemeCss}</style>
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

// const decorateInlineCode = ([node, path]: NodeEntry): Range[] => {
//   const ranges: (Range & {
//     code: true;
//     token: true;
//   })[] = [];

//   if (isCustomText(node) && (node.code || node.type === "code")) {
//     // 检查所有childen text，如果有code属性或者type为code
//     // 那么将这个text转换为prism token，并且转换为range
//     // 放到ranges中

//     const tokens = Prism.tokenize(node.text, Prism.languages.javascript);
//     let start = 0;

//     for (const item of tokens) {
//       const token = typeof item === "string" ? new Token("plain", item) : item;

//       const length = token.content.length;
//       if (!length) {
//         continue;
//       }

//       const end = start + length;

//       ranges.push({
//         anchor: { path, offset: start },
//         focus: { path, offset: end },
//         code: true,
//         token: true,
//         [token.type]: true,
//       });

//       start = end;
//     }
//   }
//   return ranges;
// };
