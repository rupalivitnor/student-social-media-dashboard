import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsApp } from "@/features/analytics/AnalyticsApp";

export const Route = createFileRoute("/health")({
  head: () => ({ meta: [
    { title: "Health & Well-being | Student Lens" },
    { name: "description", content: "Explore relationships between social media addiction, sleep, and mental health." },
    { property: "og:title", content: "Student Health & Well-being" },
    { property: "og:description", content: "Explore sleep, mental health, and addiction relationships." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AnalyticsApp view="health" />,
});
