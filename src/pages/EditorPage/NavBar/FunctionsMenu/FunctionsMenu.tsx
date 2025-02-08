import "./FunctionsMenu.scss";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import toast from "react-hot-toast";
import { Modal } from "antd";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import { Tooltip } from "@mui/material";
import { Switch } from "antd";
import { changeDocumentFontFamily, DocFont } from "../../../../store/docSlice";
import { getSocket } from "../../../../network";
import { setFullWidth } from "../../../../store/viewSlice";
function FunctionsMenu() {
  function exportDivToPDF(fileName: string) {
    const divId = "editor-content";
    const div = document.querySelector(
      `#${divId} > :nth-child(2)`
    ) as HTMLDivElement;

    if (!div) {
      console.error(`Element with id ${divId} not found.`);
      return;
    }

    const pdf = new jsPDF({
      unit: "px",
      format: [div.offsetWidth, div.offsetHeight],
    });

    html2canvas(div, {
      scale: 2, // 缩放变清晰
      useCORS: true, // 允许跨域图片
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/jpeg");
      let pdfHeight = pdf.internal.pageSize.getHeight();
      let position = 0;

      function addPage() {
        pdf.addPage();
        position = 0;
        pdfHeight = pdf.internal.pageSize.getHeight();
      }

      function addImage() {
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(
          pdf.internal.pageSize.getWidth() / imgWidth,
          pdfHeight / imgHeight
        );
        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;

        while (position + newHeight > pdfHeight) {
          addPage();
        }

        pdf.addImage(imgData, "JPEG", 0, position, newWidth, newHeight);
        position += newHeight;
      }

      addImage();

      pdf.save(fileName);
    });
  }

  const docTitle = useSelector((state: RootState) => state.doc.document.title);

  const docAllCollaborators = useSelector(
    (state: RootState) => state.doc.document.allCollaborators
  );

  const [showAllCollaborators, setShowAllCollaborators] = useState(false);

  const dispatch = useDispatch();

  const fontFamily = useSelector(
    (state: RootState) => state.doc.document.fontFamily
  );
  const isSerif = fontFamily === DocFont.Serif;

  const fullWidth = useSelector((state: RootState) => state.view.fullWidth);

  return (
    <div className="functions-menu">
      <div
        className="function-item"
        onClick={() => {
          console.log("open");
          setShowAllCollaborators(true);
        }}
      >
        所有协同者
      </div>
      <Modal
        open={showAllCollaborators}
        title="所有协同者"
        width={400}
        closable={true}
        onCancel={() => {
          console.log("close");
          setShowAllCollaborators(false);
        }}
        footer={() => <></>}
      >
        <div className="show-all-collaborators-menu">
          {docAllCollaborators.map((item) => {
            return (
              <Tooltip
                key={item.id}
                title={item.name}
                arrow
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: "offset",
                        options: {
                          offset: [0, -6],
                        },
                      },
                    ],
                  },
                }}
              >
                <Avatar
                  alt={item.name}
                  style={{
                    width: "30px",
                    height: "30px",
                    fontSize: "11px",
                    backgroundColor: item.displayColor,
                  }}
                >
                  {item.name.slice(0, 4)}
                </Avatar>
              </Tooltip>
            );
          })}
        </div>
      </Modal>
      <div
        className="function-item"
        onClick={() => {
          const url = window.location.href;
          navigator.clipboard.writeText(url);
          toast("已复制链接", {
            id: "copy-link",
          });
        }}
      >
        复制链接
      </div>

      <div className="functions-menu-divider"></div>
      <div className="function-item">
        衬线体/宋体
        <Switch
          size="small"
          checked={isSerif}
          onChange={(checked) => {
            const socket = getSocket();
            if (checked) {
              // 设置为serif
              socket.emit("changeDocFontFamily", DocFont.Serif);
              dispatch(changeDocumentFontFamily(DocFont.Serif));
            } else {
              // 设置为default
              socket.emit("changeDocFontFamily", DocFont.Default);
              dispatch(changeDocumentFontFamily(DocFont.Default));
            }
          }}
        />
      </div>
      <div className="function-item">
        适应屏幕宽度
        <Switch
          size="small"
          value={fullWidth}
          onChange={(checked) => {
            dispatch(setFullWidth(checked));
          }}
        />
      </div>
      <div className="functions-menu-divider"></div>
      <div
        className="function-item"
        onClick={() => {
          exportDivToPDF(`${docTitle}.pdf`);
        }}
      >
        导出为PDF
      </div>
    </div>
  );
}
export default FunctionsMenu;
