import "./FunctionsMenu.scss";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store";
import toast, { Toaster } from "react-hot-toast";

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

  return (
    <div className="functions-menu">
      <div className="function-item">所有协同者</div>
      <div
        className="function-item"
        onClick={() => {
          const url = window.location.href;
          navigator.clipboard.writeText(url);
          toast("已复制链接");
        }}
      >
        复制链接
      </div>
      <Toaster />
      <div className="functions-menu-divider"></div>
      <div className="function-item">设置字体</div>
      <div className="function-item">设置封面图</div>
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
