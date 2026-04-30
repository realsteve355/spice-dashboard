import { C } from "../../tokens";

/**
 * CornerFrame — four L-bracket spans for decorated corners (redesign §3.4).
 *
 * Drop this component as a child inside any positioned container to add
 * decorative bracket markers in each corner. Caller is responsible for
 * giving the parent `position: "relative"` and a continuous outer border
 * (typically `1px solid C.line`); the brackets sit on top of that border
 * in a brighter colour (`C.txt2` by default) to draw the frame marker.
 *
 * Usage:
 *   <article style={{ position: "relative", border: `1px solid ${C.line}` }}>
 *     <CornerFrame />
 *     ...content
 *   </article>
 */
export default function CornerFrame({ size = 10, color = C.txt2, weight = 1 }) {
  const base = {
    position: "absolute",
    width: size, height: size,
    borderColor: color,
    pointerEvents: "none",
  };
  const w = `${weight}px solid`;
  return (
    <>
      <span style={{ ...base, top: 0, left: 0,    borderTop: w,    borderLeft: w  }} />
      <span style={{ ...base, top: 0, right: 0,   borderTop: w,    borderRight: w }} />
      <span style={{ ...base, bottom: 0, left: 0, borderBottom: w, borderLeft: w  }} />
      <span style={{ ...base, bottom: 0, right: 0,borderBottom: w, borderRight: w }} />
    </>
  );
}
