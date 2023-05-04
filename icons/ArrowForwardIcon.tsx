import { IconProps } from "./types";

const ArrowForwardIcon = ({
  width = "24",
  height = "24",
  color = "white",
}: IconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12.2929 17.293L11.5858 18.0002L13 19.4144L13.7071 18.7073L19 13.4144C19.781 12.6333 19.781 11.367 19 10.5859L13.7071 5.29304L13 4.58594L11.5858 6.00015L12.2929 6.70726L16.5858 11.0002L5 11.0002H4V13.0001H5L16.5858 13.0002L12.2929 17.293Z"
      fill={color}
    />
  </svg>
);

export default ArrowForwardIcon;
