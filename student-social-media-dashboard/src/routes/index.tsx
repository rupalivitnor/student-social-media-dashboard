import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsApp } from "@/features/analytics/AnalyticsApp";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Dashboard | Student Social Media Analytics" },
    { name: "description", content: "Interactive overview of student social media usage, academic performance, sleep, mental health, and addiction risk." },
    { property: "og:title", content: "Student Social Media Analytics Dashboard" },
    { property: "og:description", content: "Explore interactive student usage, academic impact, and well-being insights." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AnalyticsApp view="dashboard" />,
});