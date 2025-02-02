import { RenderElementProps } from "slate-react";
import { HeadingElement } from "./HeadingElement/HeadingElement";
import { CodeElement } from "./CodeElement/CodeElement";
import { BlockQuoteElement } from "./BlockQuoteElement/BlockQuoteElement";
import { CheckListItemElement } from "./CheckListItemElement/CheckListItemElement";
import { ParagraphElement } from "./ParagraphElement/ParagraphElement";
import { ImageElement } from "./ImageElement/ImageElement";
import { NumberedListElement } from "./NumberedListElement/NumberedListElement";
import { ListItemElement } from "./ListItemElement/ListItemElement";
import { BulletedListElement } from "./BulletedListElement/BulletedListElement";

export const Element = (props: RenderElementProps) => {
  switch (props.element.type) {
    case "heading-one":
      return <HeadingElement {...props} />;
    case "heading-two":
      return <HeadingElement {...props} />;
    case "heading-three":
      return <HeadingElement {...props} />;
    case "code":
      return <CodeElement {...props} />;
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
    case "paragraph":
    default:
      return <ParagraphElement {...props} />;
  }
};
