import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsApp } from "@/features/analytics/AnalyticsApp";

export const Route = createFileRoute("/usage")({
  head: () => ({ meta: [
    { title: "Social Media Usage | Student Lens" },
    { name: "description", content: "Compare student platform preferences and daily social media usage patterns." },
    { property: "og:title", content: "Social Media Usage" },
    { property: "og:description", content: "Compare platform preferences and daily usage patterns." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AnalyticsApp view="usage" />,
});
