import { SVGProps } from "react";

export function DividerElementIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 512 512"
      {...props}
    >
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M469.333 277.333H42.666v-42.666h426.667z"
        clip-rule="evenodd"
      />
    </svg>
  );
}
