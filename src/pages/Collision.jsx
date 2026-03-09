/**
 * Collision.jsx
 *
 * The original /collision page has been superseded by /simulation.
 * This file redirects visitors and preserves the route.
 * Original content archived in CollisionArchive.jsx.
 */

import { Navigate } from "react-router-dom";

export default function Collision() {
  return <Navigate to="/simulation" replace />;
}
