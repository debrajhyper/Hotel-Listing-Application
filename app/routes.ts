import { type RouteConfig, index } from "@react-router/dev/routes";

// export default [index("routes/home.tsx")] satisfies RouteConfig;

export default [
    index("routes/index.tsx"),
    {
        path: "results",
        file: "routes/results.tsx"
    }
] satisfies RouteConfig;