/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Ref } from "react";

import { cx, css } from "@emotion/css";

export const Menu = React.forwardRef(
  ({ className, ...props }: any, ref: Ref<HTMLDivElement | undefined>) => (
    <div
      {...props}
      data-test-id="menu"
      ref={ref}
      className={cx(
        className,
        css`
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;

          & > * + * {
            margin-left: 10px;
          }
        `
      )}
    />
  )
);
