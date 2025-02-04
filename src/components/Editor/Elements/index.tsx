import { RenderElementProps } from "slate-react";
import { HeadingElement } from "./HeadingElement/HeadingElement";
import { BlockQuoteElement } from "./BlockQuoteElement/BlockQuoteElement";
import { CheckListItemElement } from "./CheckListItemElement/CheckListItemElement";
import { ParagraphElement } from "./ParagraphElement/ParagraphElement";
import { ImageElement } from "./ImageElement/ImageElement";
import { NumberedListElement } from "./NumberedListElement/NumberedListElement";
import { ListItemElement } from "./ListItemElement/ListItemElement";
import { BulletedListElement } from "./BulletedListElement/BulletedListElement";
import { DividerElement } from "./DividerElement/DividerElement";
import { CodeBlockElement } from "./CodeBlockElement/CodeBlockElement";
import { CodeLineElement } from "./CodeLineElement/CodeLineElement";

export const Element = (props: RenderElementProps) => {
  switch (props.element.type) {
    case "heading-one":
      return <HeadingElement {...props} />;
    case "heading-two":
      return <HeadingElement {...props} />;
    case "heading-three":
      return <HeadingElement {...props} />;
    case "block-quote":
      return <BlockQuoteElement {...props} />;
    case "check-list-item":
      return <CheckListItemElement {...props} />;
    case "image":
      return <ImageElement {...props} />;
    case "numbered-list":
      return <NumberedListElement {...props} />;
    case "bulleted-list":
      return <BulletedListElement {...props} />;
    case "list-item":
      return <ListItemElement {...props} />;
    case "divider":
      return <DividerElement {...props} />;
    case "code-block":
      return <CodeBlockElement {...props} />;
    case "code-line":
      return <CodeLineElement {...props} />;
    case "paragraph":
    default:
      return <ParagraphElement {...props} />;
  }
};
