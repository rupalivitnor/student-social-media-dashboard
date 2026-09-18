import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsApp } from "@/features/analytics/AnalyticsApp";

export const Route = createFileRoute("/academic-impact")({
  head: () => ({ meta: [
    { title: "Academic Impact | Student Lens" },
    { name: "description", content: "Analyze how social media usage relates to student academic performance." },
    { property: "og:title", content: "Academic Impact" },
    { property: "og:description", content: "Understand digital habits and academic outcomes." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: () => <AnalyticsApp view="academic" />,
});
