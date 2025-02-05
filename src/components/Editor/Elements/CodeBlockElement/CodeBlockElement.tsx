import { Select } from "antd";
import { Transforms } from "slate";
import { ReactEditor, RenderElementProps, useSlateStatic } from "slate-react";
import { isCodeBlockElement } from "../../../../types/editor";
import "./CodeBlockElement.scss";
import toast from "react-hot-toast";

export const CodeBlockElement = (props: RenderElementProps) => {
  const { element } = props;
  const editor = useSlateStatic();

  const setLanguage = (language: string) => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.setNodes(editor, { language }, { at: path });
  };

  if (element.children.length === 0) {
    // 无子元素时删除
    const nodePath = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: nodePath });

    return;
  }

  if (!isCodeBlockElement(element)) {
    return <div>类型出错</div>;
  }

  return (
    <pre
      {...props.attributes}
      style={{
        background: "rgba(209, 213, 222, 0.4)",
        fontSize: "16px",
        textWrap: "wrap",
        margin: "20px 0px",
        paddingRight: "12px",
        paddingBottom: "6px",
        paddingTop: "36px",
        paddingLeft: "12px",
        position: "relative",
        borderRadius: "4px",
      }}
      spellCheck={false}
      className={`language-${element.language} code-block-element`}
    >
      <div
        contentEditable={false}
        style={{
          position: "absolute",
          top: "6px",
          left: "6px",
          backgroundColor: "transparent",
        }}
        className="code-block-language-select-wrap"
      >
        <Select
          defaultValue={element.language}
          className="code-block-language-select"
          style={{
            height: 24,
          }}
          dropdownStyle={{ width: "120px" }}
          onChange={setLanguage}
          options={[
            { value: "javascript", label: "JavaScript" },
            { value: "html", label: "HTML" },
            { value: "css", label: "CSS" },
            { value: "jsx", label: "JSX" },
            { value: "java", label: "Java" },
            { value: "python", label: "Python" },
          ]}
        />
      </div>
      <div
        className="code-block-copy-code-btn"
        contentEditable={false}
        onClick={() => {
          const code = element.children
            .map((line) => {
              return line.children
                .map((text) => {
                  return text.text;
                })
                .join("");
            })
            .join("\n");
          navigator.clipboard.writeText(code);
          toast("已复制代码", {
            id: "copy-code",
          });
        }}
      >
        Copy
      </div>
      <code className={`language-${element.language}`}>{props.children}</code>
    </pre>
  );
};

export const prismThemeCss = `
/**
 * prism.js default theme for JavaScript, CSS and HTML
 * Based on dabblet (http://dabblet.com)
 * @author Lea Verou
 */

code[class*="language-"],
pre[class*="language-"] {
    color: black;
    background: none;
    text-shadow: 0 1px white;
    font-family: Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
    font-size: 1em;
    text-align: left;
    white-space: pre;
    word-spacing: normal;
    word-break: normal;
    word-wrap: normal;
    line-height: 1.5;

    -moz-tab-size: 4;
    -o-tab-size: 4;
    tab-size: 4;

    -webkit-hyphens: none;
    -moz-hyphens: none;
    -ms-hyphens: none;
    hyphens: none;
}

pre[class*="language-"]::-moz-selection, pre[class*="language-"] ::-moz-selection,
code[class*="language-"]::-moz-selection, code[class*="language-"] ::-moz-selection {
    text-shadow: none;
    background: #b3d4fc;
}

pre[class*="language-"]::selection, pre[class*="language-"] ::selection,
code[class*="language-"]::selection, code[class*="language-"] ::selection {
    text-shadow: none;
    background: #b3d4fc;
}

@media print {
    code[class*="language-"],
    pre[class*="language-"] {
        text-shadow: none;
    }
}

/* Code blocks */
pre[class*="language-"] {
    padding: 1em;
    margin: .5em 0;
    overflow: auto;
}

:not(pre) > code[class*="language-"],
pre[class*="language-"] {
    background: #f5f2f0;
}

/* Inline code */
:not(pre) > code[class*="language-"] {
    padding: .1em;
    // border-radius: .3em;
    white-space: normal;
}

.token.comment,
.token.prolog,
.token.doctype,
.token.cdata {
    color: slategray;
}

.token.punctuation {
    color: #999;
}

.token.namespace {
    opacity: .7;
}

.token.property,
.token.tag,
.token.boolean,
.token.number,
.token.constant,
.token.symbol,
.token.deleted {
    color: #905;
}

.token.selector,
.token.attr-name,
.token.string,
.token.char,
.token.builtin,
.token.inserted {
    color: #690;
}

.token.operator,
.token.entity,
.token.url,
.language-css .token.string,
.style .token.string {
    color: #9a6e3a;
    /* This background color was intended by the author of this theme. */
    // background: hsla(0, 0%, 100%, .5);
}

.token.atrule,
.token.attr-value,
.token.keyword {
    color: #07a;
}

.token.function,
.token.class-name {
    color: #DD4A68;
}

.token.regex,
.token.important,
.token.variable {
    color: #e90;
}

.token.important,
.token.bold {
    font-weight: bold;
}
.token.italic {
    font-style: italic;
}

.token.entity {
    cursor: help;
}
`;
