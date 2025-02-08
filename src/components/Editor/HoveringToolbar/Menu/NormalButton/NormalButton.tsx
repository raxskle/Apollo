import { FC, ReactNode } from "react";
import { Button } from "../ToggleButton/ToggleButton";

export const NormalButton: FC<{
  children?: ReactNode;
  onClick: () => void;
}> = ({ children, onClick }) => {
  return (
    <Button active={true} onClick={onClick}>
      {children}
    </Button>
  );
};
