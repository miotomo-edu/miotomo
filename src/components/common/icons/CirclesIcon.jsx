export function CirclesIcon(props) {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle
        cx="9.28"
        cy="12.28"
        r="7.78"
        stroke="currentColor"
        strokeWidth={props.strokeWidth ?? 2}
      />
      <circle
        cx="15.7195"
        cy="12.28"
        r="7.78"
        stroke="currentColor"
        strokeWidth={props.strokeWidth ?? 2}
      />
    </svg>
  );
}
