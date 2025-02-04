import "./AddBar.scss";
import AddIcon from "../../../../assets/icons/add.svg";
import { CustomElement, CustomText } from "../../../../types/editor";
import { ReactEditor, useSlate } from "slate-react";
import { Path, Transforms } from "slate";
import { SVGProps, useState } from "react";
import { ElementDataList } from "../../ElementDataList";
import { TextElementIcon } from "../../../../assets/icons/element-icons/TextElementIcon";
import { Heading1ElementIcon } from "../../../../assets/icons/element-icons/Heading1ElementIcon";
import { Heading3ElementIcon } from "../../../../assets/icons/element-icons/Heading3ElementIcon";
import { Heading2ElementIcon } from "../../../../assets/icons/element-icons/Heading2ElementIcon";
import { CodeElementIcon } from "../../../../assets/icons/element-icons/CodeElementIcon";
import { QuoteElementIcon } from "../../../../assets/icons/element-icons/QuoteElementIcon";
import { CheckListElementIcon } from "../../../../assets/icons/element-icons/CheckListElementIcon";
import { ImageElementIcon } from "../../../../assets/icons/element-icons/ImageElementIcon";
import { NumberedListElementIcon } from "../../../../assets/icons/element-icons/NumberedListElementIcon";
import { BulletedListElementIcon } from "../../../../assets/icons/element-icons/BulletedListElementIcon";
import { DividerElementIcon } from "../../../../assets/icons/element-icons/DividerElementIcon";

interface AddBarProps {
  element: CustomElement;
  showAddBar: boolean;
}

export const AddBar = (props: AddBarProps) => {
  const { element, showAddBar } = props;
  const editor = useSlate();

  // contentEditable="false" slate元素不可编辑

  // open for add-btn
  const [open, setOpen] = useState(false);

  const addElement = (props: {
    type: string;
    [key: string]: string | boolean | number | CustomElement[] | CustomText[];
  }) => {
    // 插入对应type元素
    const targetPath = ReactEditor.findPath(editor, element);
    const insertPath = Path.next(targetPath);

    const elementToInsert = {
      children: [{ text: "" }],
      ...props,
    } as CustomElement;
    Transforms.insertNodes(editor, elementToInsert, { at: insertPath });

    // 🔥 关键步骤：将选区移动到列表项的文本节点
    // const listItemPath = insertPath; // 根据实际插入位置调整路径
    // console.log("insertNOde>>>>>>>", listItemPath);
    // Transforms.select(editor, {
    //   anchor: { path: listItemPath, offset: 0 },
    //   focus: { path: listItemPath, offset: 0 },
    // });
    // console.log("editor.selection>>>>>>>", editor.selection);

    // 关闭add menu
    setOpen(false);
    // 设置光标到新插入的节点的第一个子节点
    const childPath = [...insertPath, 0];
    Transforms.select(editor, {
      anchor: { path: childPath, offset: 0 },
      focus: { path: childPath, offset: 0 },
    });
  };

  return (
    <div
      id="add-bar"
      className="add-bar"
      style={{ visibility: showAddBar ? "visible" : "hidden" }}
      onMouseLeave={() => {
        setOpen(false);
      }}
    >
      <div
        contentEditable="false"
        className="add-btn"
        onClick={(e) => {
          e.preventDefault();
          if (!open) {
            setOpen(true);
          }
        }}
      >
        {/* onClick在父元素，img设置pointer-events: none;不可交互 */}
        <img src={AddIcon} width="16px" height="16px" />
        <div
          className="add-btn-menu"
          style={{
            display: showAddBar && open ? "flex" : "none",
            cursor: "default",
            zIndex: "1000",
            position: "absolute",
            top: "20px",
            left: "0px",
            background: "white",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            boxShadow: "0px 2px 6px 2px rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
            transition: "opacity 0.5s ease",
          }}
        >
          {ElementDataList.map((el) => {
            return (
              <div
                className="add-btn-menu-item"
                onClick={() => addElement({ ...el.defaultData })}
              >
                {ElementIconMapping(el.type, {
                  width: "18px",
                  height: "18px",
                })}
                {el.displayName}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ElementIconMapping = (type: string, style: SVGProps<SVGSVGElement>) => {
  switch (type) {
    case "heading-one":
      return <Heading1ElementIcon {...style} />;
    case "heading-two":
      return <Heading2ElementIcon {...style} />;
    case "heading-three":
      return <Heading3ElementIcon {...style} />;
    case "code-block":
      return <CodeElementIcon {...style} />;
    case "block-quote":
      return <QuoteElementIcon {...style} />;
    case "check-list-item":
      return <CheckListElementIcon {...style} />;
    case "image":
      return <ImageElementIcon {...style} />;
    case "paragraph":
      return <TextElementIcon {...style} />;
    case "numbered-list":
      return <NumberedListElementIcon {...style} />;
    case "bulleted-list":
      return <BulletedListElementIcon {...style} />;
    case "divider":
      return <DividerElementIcon {...style} />;
    default:
      return <TextElementIcon {...style} />;
  }
};
