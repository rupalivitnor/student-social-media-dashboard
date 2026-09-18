import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsApp } from "@/features/analytics/AnalyticsApp";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About | Student Lens" },
    { name: "description", content: "Learn about the student social media analytics dataset and project methodology." },
    { property: "og:title", content: "About Student Lens" },
    { property: "og:description", content: "Dataset scope, analytical goals, and measures." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AnalyticsApp view="about" />,
});
