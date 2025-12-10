import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useLocation, useParams } from "react-router";

export function VercelAnalytics() {
  const basePath = import.meta.env.VITE_VERCEL_OBSERVABILITY_BASEPATH;
  const location = useLocation();
  const params = useParams();
  const path = location.pathname;
  const route = computeRoute(path, params);

  return (
    <>
      <Analytics basePath={basePath} path={path} route={route} />
      <SpeedInsights basePath={basePath} route={route} />
    </>
  );
}

function computeRoute(
  pathname: string,
  pathParams: Record<string, string | undefined>,
) {
  if (!pathname || !pathParams) {
    return pathname;
  }
  let result = pathname;
  try {
    const entries = Object.entries(pathParams);
    for (const [key, value] of entries) {
      if (!Array.isArray(value) && typeof value === "string") {
        const matcher = turnValueToRegExp(value);
        if (matcher.test(result)) {
          result = result.replace(matcher, `/[${key}]`);
        }
      }
    }
    for (const [key, value] of entries) {
      if (Array.isArray(value)) {
        const matcher = turnValueToRegExp(value.join("/"));
        if (matcher.test(result)) {
          result = result.replace(matcher, `/[...${key}]`);
        }
      }
    }
    return result;
  } catch {
    return pathname;
  }
}

function turnValueToRegExp(value: string) {
  return new RegExp(`/${escapeRegExp(value)}(?=[/?#]|$)`);
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
