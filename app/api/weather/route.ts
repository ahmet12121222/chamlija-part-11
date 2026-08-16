import { getCachedWeather } from "@/lib/weather/getWeather";
import { NextResponse } from "next/server";

export const revalidate = 600; // Cache for 10 minutes

export async function GET() {
  try {
    const weather = await getCachedWeather();
    return NextResponse.json(weather);
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}
