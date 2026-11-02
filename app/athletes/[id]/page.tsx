import { notFound } from "next/navigation";
import { AthleteDetail } from "@/components/athlete-detail";
import { athletes, quests } from "@/lib/data";

export function generateStaticParams() {
  return athletes.map((athlete) => ({ id: athlete.id }));
}

export default async function AthletePage({ params }: PageProps<"/athletes/[id]">) {
  const { id } = await params;
  const athlete = athletes.find((item) => item.id === id);
  if (!athlete) notFound();

  return (
    <AthleteDetail
      athlete={athlete}
      quest={quests.find((item) => item.athleteId === athlete.id) ?? null}
    />
  );
}
