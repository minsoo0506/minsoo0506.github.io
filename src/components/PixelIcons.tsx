export function PixelGamepad({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path fill="#28333c" d="M7 6h18v2h3v3h2v11h-2v3h-4v-2h-3v-3H11v3H8v2H4v-3H2V11h2V8h3z" />
      <path fill="#e6e8e1" d="M8 8h16v2h3v3h1v8h-2v2h-1v-2h-3v-3H10v3H7v2H6v-2H4v-8h1v-3h3z" />
      <path fill="#718286" d="M8 11h3v3h3v3h-3v3H8v-3H5v-3h3z" />
      <path fill="#df6260" d="M23 11h3v3h-3z" />
      <path fill="#e7bd4f" d="M20 14h3v3h-3z" />
      <path fill="#5ba4aa" d="M24 17h3v3h-3z" />
      <path fill="#879394" d="M13 13h2v2h-2zm4 0h2v2h-2z" />
    </svg>
  );
}
export function PixelBooks({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
      shapeRendering="crispEdges"
    >
      <path
        fill="#293942"
        d="M5 19h20v2h3v7H7v-2H4v-6h1zM7 12h18v2h2v6H6v-2H4v-5h3zM9 5h16v2h3v6H6v-2H4V7h5z"
      />
      <path fill="#5a83bf" d="M6 21h19v2H8v3H6z" />
      <path fill="#e6ebe4" d="M9 23h17v3H9z" />
      <path fill="#c86559" d="M6 14h18v2H8v2H6z" />
      <path fill="#e6ebe4" d="M9 16h16v2H9z" />
      <path fill="#69a775" d="M7 7h17v2H9v2H7z" />
      <path fill="#eef0d7" d="M10 9h16v2H10z" />
      <path fill="#f4d178" d="M11 7h10v1H11z" />
    </svg>
  );
}
