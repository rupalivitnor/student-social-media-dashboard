export type Student = {
  studentId: number;
  age: number;
  gender: "Female" | "Male";
  academicLevel: "High School" | "Undergraduate" | "Graduate";
  country: string;
  dailyUsage: number;
  platform: string;
  academicImpact: "Yes" | "No";
  sleepHours: number;
  mentalHealth: number;
  relationshipStatus: "Single" | "In Relationship" | "Complicated";
  conflicts: number;
  addictionScore: number;
};

const countries = ["India", "USA", "UK", "Canada", "Bangladesh", "Australia", "Germany", "Brazil", "Japan", "France", "Spain", "Italy"];
const platforms = ["Instagram", "Instagram", "Instagram", "TikTok", "TikTok", "Facebook", "Facebook", "WhatsApp", "Twitter", "LinkedIn", "YouTube", "Snapchat"];
const levels: Student["academicLevel"][] = ["Undergraduate", "Graduate", "High School"];
const statuses: Student["relationshipStatus"][] = ["Single", "In Relationship", "Complicated"];

const seeded = (n: number) => {
  const value = Math.sin(n * 12.9898) * 43758.5453;
  return value - Math.floor(value);
};

export const students: Student[] = Array.from({ length: 705 }, (_, index) => {
  const id = index + 1;
  const dailyUsage = Number((1.5 + seeded(id) * 5.7).toFixed(1));
  const sleepHours = Number(Math.max(3.8, Math.min(9.2, 9.1 - dailyUsage * 0.48 + (seeded(id + 50) - 0.5) * 1.4)).toFixed(1));
  const mentalHealth = Math.max(4, Math.min(9, Math.round(9.5 - dailyUsage * 0.75 + (seeded(id + 90) - 0.5) * 2)));
  const addictionScore = Math.max(2, Math.min(9, Math.round(1.8 + dailyUsage * 1.03 + (seeded(id + 140) - 0.5) * 2)));
  return {
    studentId: id,
    age: 18 + (id * 7) % 7,
    gender: id % 2 === 0 ? "Male" : "Female",
    academicLevel: levels[(id * 5) % levels.length] ?? "Undergraduate",
    country: countries[(id * 7 + Math.floor(id / 19)) % countries.length] ?? "India",
    dailyUsage,
    platform: platforms[(id * 5 + Math.floor(id / 11)) % platforms.length] ?? "Instagram",
    academicImpact: dailyUsage + addictionScore / 3 > 6.2 ? "Yes" : "No",
    sleepHours,
    mentalHealth,
    relationshipStatus: statuses[(id * 7) % statuses.length] ?? "Single",
    conflicts: Math.max(0, Math.min(5, Math.round(addictionScore / 2 + seeded(id + 200) - 1))),
    addictionScore,
  };
});

export const palette = {
  coral: "var(--coral)", sage: "var(--sage)", butter: "var(--butter)", sky: "var(--sky)", mauve: "var(--mauve)", ink: "var(--foreground)", hair: "var(--border)", muted: "var(--muted-foreground)", surface: "var(--card)",
};
