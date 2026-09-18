import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsApp } from "@/features/analytics/AnalyticsApp";

export const Route = createFileRoute("/insights")({
  head: () => ({ meta: [
    { title: "Insights | Student Lens" },
    { name: "description", content: "Review automatically generated insights from student social media behavior." },
    { property: "og:title", content: "Student Social Media Insights" },
    { property: "og:description", content: "Review key findings from the selected student cohort." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AnalyticsApp view="insights" />,
});
