import { AlignType, CustomElement } from "../../types/editor";

type ElementData = {
  type: string;
  displayName: string;
  defaultData: { type: string } & Record<
    string,
    string | number | boolean | CustomElement[]
  >;
};

export const ElementDataList: ElementData[] = [
  {
    type: "heading-one",
    displayName: "Heading 1",
    defaultData: {
      type: "heading-one",
      align: AlignType.Left,
    },
  },
  {
    type: "heading-two",
    displayName: "Heading 2",
    defaultData: {
      type: "heading-two",
      align: AlignType.Left,
    },
  },
  {
    type: "heading-three",
    displayName: "Heading 3",
    defaultData: {
      type: "heading-three",
      align: AlignType.Left,
    },
  },
  {
    type: "paragraph",
    displayName: "Text",
    defaultData: {
      type: "paragraph",
    },
  },
  {
    type: "block-quote",
    displayName: "Quote",
    defaultData: {
      type: "block-quote",
    },
  },
  {
    type: "code",
    displayName: "Code",
    defaultData: {
      type: "code",
    },
  },
  {
    type: "check-list-item",
    displayName: "Check List",
    defaultData: {
      type: "check-list-item",
      checked: false,
    },
  },
  {
    type: "image",
    displayName: "Image",
    defaultData: {
      type: "image",
      url: "",
      alt: "", // 不要给默认的width属性
      align: AlignType.Left,
    },
  },
  {
    type: "numbered-list",
    displayName: "Numbered List",
    defaultData: {
      type: "numbered-list",
      children: [{ type: "list-item", children: [{ text: "" }] }],
    },
  },
];
