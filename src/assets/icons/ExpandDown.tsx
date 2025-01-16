import { SVGProps } from "react";
import { JSX } from "react/jsx-runtime";

export function ExpandDown(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill={props.fill ?? "rgb(180, 180, 180)"}
        d="m12 15.375l-6-6l1.4-1.4l4.6 4.6l4.6-4.6l1.4 1.4z"
      />
    </svg>
  );
}
