import { NextResponse } from "next/server";
import { getAvailableTimeSlots, getPicnicAreaById, getSuggestedDates } from "@/lib/booking/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const areaId = searchParams.get("areaId");

  if (!date || !areaId) {
    return NextResponse.json({ error: "Date and area are required." }, { status: 400 });
  }

  const area = await getPicnicAreaById(areaId);

  if (!area) {
    return NextResponse.json({ error: "This picnic area is not available." }, { status: 404 });
  }

  const availableSlots = await getAvailableTimeSlots(date, areaId);
  const suggestedDates = availableSlots.length === 0 ? await getSuggestedDates(areaId, date, 4) : [];

  return NextResponse.json({
    areaId,
    date,
    availableSlots,
    suggestedDates,
    areaName: area.name,
  });
}
