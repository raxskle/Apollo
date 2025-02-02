import { SVGProps } from "react";

export function BulletedListElementIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      {...props}
    >
      <path
        fill="currentColor"
        d="M6 1h10v2H6zm0 6h10v2H6zm0 6h10v2H6zM0 2a2 2 0 1 1 3.999-.001A2 2 0 0 1 0 2m0 6a2 2 0 1 1 3.999-.001A2 2 0 0 1 0 8m0 6a2 2 0 1 1 3.999-.001A2 2 0 0 1 0 14"
      />
    </svg>
  );
}
