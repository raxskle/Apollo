import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import "./ImageElement.scss";
import { ImageIcon } from "../../../../assets/icons/ImageIcon";
import { Transforms } from "slate";
import {
  AlignType,
  ImageElement as CustomImageElement,
} from "../../../../types/editor";
import { LoadingLoop } from "../../../../assets/icons/LoadingLoop";
import { useEffect, useRef, useState, useTransition } from "react";
import { AlignCenter } from "../../../../assets/icons/AlignCenter";
import { AlignLeft } from "../../../../assets/icons/AlignLeft";
import { AlignRight } from "../../../../assets/icons/AlignRight";
import { ExpandDown } from "../../../../assets/icons/ExpandDown";
import { Trash } from "../../../../assets/icons/Trash";

enum DragBar {
  None = 0,
  Left = 1,
  Right = 2,
}

const ElementMinWidth = 100;
const ElementMaxWidth = 850;

export const ImageElement = (props: RenderElementProps) => {
  const { attributes, element, children } = props;

  const editor = useSlateStatic();
  const [isPending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const imageRef = useRef<HTMLImageElement>(null);

  const [startX, setStartX] = useState(0); // 开始拖拽时位置
  const [startWidth, setStartWidth] = useState(
    (element as CustomImageElement).width
  ); // 开始拖拽时宽度
  const [width, setWidth] = useState((element as CustomImageElement).width); // 当前实际宽度
  const [dragBar, setDragBar] = useState(DragBar.None); // 是否拖拽中

  useEffect(() => {
    const handler = () => {
      if (dragBar) {
        setDragBar(DragBar.None);
        // 结束拖拽，更新节点
        const path = ReactEditor.findPath(editor, element);
        Transforms.setNodes(editor, { width: width }, { at: path });
      }
    };
    document.addEventListener("mouseup", handler);

    const handlerMouseMove = (e: MouseEvent) => {
      if (dragBar && imageRef.current) {
        const end = e.clientX;
        // 实际伸长distance*2
        // 原本长度startWid
        const distance = dragBar === DragBar.Left ? startX - end : end - startX;
        // 新的长度newWid = wid + distance*2
        let newWid = startWidth + distance * 2;
        newWid = Math.max(ElementMinWidth, newWid);
        const elementBounding =
          (imageRef.current.parentNode?.parentNode as HTMLDivElement)
            .offsetWidth ?? ElementMaxWidth; // image-element的宽度
        newWid = Math.min(elementBounding, newWid);

        setWidth(newWid);
      }
    };
    document.addEventListener("mousemove", handlerMouseMove);

    return () => {
      document.removeEventListener("mouseup", handler);
      document.removeEventListener("mousemove", handlerMouseMove);
    };
  }, [dragBar, startX, startWidth, editor, element, width]);

  if (element.type !== "image") {
    return <div>类型出错</div>;
  }

  // 点击上传图片
  const handleUpload = () => {
    // 触发隐藏的input元素的点击事件
    if (fileInput.current) {
      fileInput.current.click();
    }
  };

  // 没有element.url时
  if (!element.url) {
    return (
      <div {...attributes} contentEditable={false} className="image-element">
        <div className="image-element-hide-children" contentEditable={true}>
          {children}
        </div>
        <input
          ref={fileInput}
          type="file"
          style={{ display: "none" }}
          onChange={(e) => {
            startTransition(() => {
              // 处理文件上传逻辑
              const file = e.target.files?.[0];
              if (file) {
                // 预览显示
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target?.result) {
                    // 获取图片尺寸
                    const img = new Image();
                    img.onload = () => {
                      let width = img.width;
                      width = Math.max(ElementMinWidth, width);
                      const elementBounding =
                        (fileInput.current?.parentNode as HTMLDivElement)
                          .offsetWidth ?? ElementMaxWidth;
                      width = Math.min(elementBounding, width);
                      // 更新节点
                      const path = ReactEditor.findPath(editor, element);
                      Transforms.setNodes(
                        editor,
                        {
                          width: width,
                          url: event.target?.result as string,
                        },
                        {
                          at: path,
                        }
                      );
                    };
                    img.src = event.target?.result as string;
                  }
                };
                reader.readAsDataURL(file);
              }
            });
          }}
        />
        {isPending ? (
          <div className="upload-image-btn forbid">
            <LoadingLoop
              width={"2em"}
              height={"2em"}
              style={{ margin: "10px" }}
            />
            Uploading...
          </div>
        ) : (
          <div className="upload-image-btn" onClick={handleUpload}>
            <ImageIcon
              width={"2em"}
              height={"2em"}
              style={{ margin: "10px" }}
            />
            Add an image
          </div>
        )}
      </div>
    );
  }

  const changeAlign = (align: AlignType) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { align }, { at: path });
  };

  const deleteElement = () => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: path });
  };

  // 有element.url
  return (
    <div
      {...attributes}
      contentEditable={false}
      className="image-element"
      style={{ justifyContent: element.align }}
    >
      <div className="image-element-hide-children">{children}</div>
      <div
        className="image-element-container"
        tabIndex={0}
        style={{ outline: "none" }}
      >
        <img
          src={element.url}
          alt={element.alt}
          className="image-element-content"
          style={{
            width: `${width}px`,
          }}
          ref={imageRef}
        />
        <div
          className="image-resize-bar-left"
          onMouseDown={(e) => {
            if (!dragBar && imageRef.current) {
              setStartX(e.clientX);
              setStartWidth(imageRef.current.offsetWidth);
              setDragBar(DragBar.Left);
            }
          }}
        ></div>
        <div
          className="image-resize-bar-right"
          onMouseDown={(e) => {
            if (!dragBar && imageRef.current) {
              setStartX(e.clientX);
              setStartWidth(imageRef.current.offsetWidth);
              setDragBar(DragBar.Right);
            }
          }}
        ></div>
        <div className="image-tooltip-bar">
          <div className="align-btn" tabIndex={0} style={{ width: "40px" }}>
            {element.align === AlignType.Left && (
              <AlignLeft width={"1.2em"} height={"1.2em"} />
            )}
            {element.align === AlignType.Center && (
              <AlignCenter width={"1.2em"} height={"1.2em"} />
            )}
            {element.align === AlignType.Right && (
              <AlignRight width={"1.2em"} height={"1.2em"} />
            )}
            <ExpandDown className="expand" width={"0.8em"} height={"0.8em"} />
            <div className="align-menu">
              <div
                className={`align-btn ${element.align === AlignType.Left ? "active" : ""}`}
                onClick={() => {
                  changeAlign(AlignType.Left);
                }}
              >
                <AlignLeft width={"1.2em"} height={"1.2em"} />
              </div>
              <div
                className={`align-btn ${element.align === AlignType.Center ? "active" : ""}`}
                onClick={() => {
                  changeAlign(AlignType.Center);
                }}
              >
                <AlignCenter width={"1.2em"} height={"1.2em"} />
              </div>
              <div
                className={`align-btn ${element.align === AlignType.Right ? "active" : ""}`}
                onClick={() => {
                  changeAlign(AlignType.Right);
                }}
              >
                <AlignRight width={"1.2em"} height={"1.2em"} />
              </div>
            </div>
          </div>

          <div className="align-btn" onClick={deleteElement}>
            <Trash className="trash" />
          </div>
        </div>
      </div>
    </div>
  );
};
