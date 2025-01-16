import { SVGProps } from "react";

export function AlignLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="none"
        stroke={props.color ?? "rgb(228, 228, 228)"}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 4v16M8 6h12M8 12h6m-6 6h10"
      />
    </svg>
  );
}
