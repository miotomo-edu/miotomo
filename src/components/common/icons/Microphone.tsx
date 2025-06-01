export function Microphone(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      {...props}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect width="6" height="12" x="9" y="2" rx="3"></rect>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 10v1a7 7 0 0 0 7 7v0a7 7 0 0 0 7-7v-1m-7 8v4m0 0H9m3 0h3"
        ></path>
      </g>
    </svg>
  );
}
