import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsApp } from "@/features/analytics/AnalyticsApp";

export const Route = createFileRoute("/students")({
  head: () => ({ meta: [
    { title: "Student Analysis | Student Lens" },
    { name: "description", content: "Search and sort student social media usage, sleep, mental health, and addiction records." },
    { property: "og:title", content: "Student Analysis" },
    { property: "og:description", content: "Explore individual student records and risk indicators." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AnalyticsApp view="students" />,
});
