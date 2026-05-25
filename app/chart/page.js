import MonthlyChartTable from "@/components/MonthlyChartTable";
import PublicLayout from "@/components/PublicLayout";
import { getMonthlyRows } from "@/lib/data";
import { istDate, monthName } from "@/lib/utils";

export const revalidate = 30;

export const metadata = {
  title: "Satta King Chart 2026 with Old Record - Satta King 24",
  description: "Check Satta King Chart 2026 with full old record. Get Gali, Desawar, Faridabad all market charts, past results and daily updates in simple format."
};

export default async function ChartPage() {
  const today = istDate();
  const monthly = await getMonthlyRows({ untilToday: true });
  return (
    <PublicLayout>
      <MonthlyChartTable title={`Satta King Record Chart ${monthName(today)}`} rows={monthly.rows} columns={monthly.gameColumns} dateKey={today} chunkSize={4} />
    </PublicLayout>
  );
}
