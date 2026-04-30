import { C, F } from "../../tokens";

const base = {
  fontFamily: F.mono,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  padding: "12px 22px",
  cursor: "pointer",
  transition: "all 0.15s",
  display: "inline-block",
  textDecoration: "none",
  textAlign: "center",
};

const primary = {
  ...base,
  background: C.txt,
  color: C.bg,
  border: `1px solid ${C.txt}`,
};

const secondary = {
  ...base,
  background: "transparent",
  color: C.txt,
  border: `1px solid ${C.lineHot}`,
};

export default function Button({ variant = "secondary", children, ...rest }) {
  const style = variant === "primary" ? primary : secondary;
  return <button style={style} {...rest}>{children}</button>;
}
