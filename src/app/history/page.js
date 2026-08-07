"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { MOODS, moodScore } from "@/lib/moods";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "@/components/navbar";
import { getLocalDateString } from '@/lib/date'

export default function History() {
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [missionHistory, setMissionHistory] = useState([]);
  const [exerciseData, setExerciseData] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Ambil 7 hari terakhir
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const startDate = getLocalDateString(sevenDaysAgo);

      const { data: entries } = await supabase
        .from("entries")
        .select("entry_date, mood")
        .eq("user_id", user.id)
        .gte("entry_date", startDate)
        .order("entry_date", { ascending: true });

      // Bikin 7 titik tanggal (biar hari yang nggak diisi tetap muncul sebagai gap)
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateString(d);
        const label = d.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
        });

        const entry = entries?.find((e) => e.entry_date === dateStr);
        const score = entry?.mood ? moodScore(entry.mood) : null;
        days.push({
          date: label,
          score: entry?.mood ? moodScore(entry.mood) : null,
          emoji: entry?.mood || null,
          emptyMarker: score === null ? 0.8 : null,
        });
      }

      setChartData(days);
      // Riwayat misi 7 hari terakhir
      const { data: missionEntries } = await supabase
        .from("entries")
        .select("entry_date, mission_completed, mission_id, missions(content)")
        .eq("user_id", user.id)
        .gte("entry_date", startDate)
        .order("entry_date", { ascending: true });

      const missionDays = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateString(d);
        const label = d.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "short",
        });

        const entry = missionEntries?.find((e) => e.entry_date === dateStr);
        missionDays.push({
          date: label,
          missionText: entry?.missions?.content || null,
          completed: entry?.mission_completed || false,
        });
      }

      setMissionHistory(missionDays);

      // Total durasi olahraga per hari, 7 hari terakhir
      const { data: exercises } = await supabase
        .from("exercises")
        .select("exercise_date, duration_minutes")
        .eq("user_id", user.id)
        .gte("exercise_date", startDate);

      const exerciseDays = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = getLocalDateString(d);
        const label = d.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
        });

        const totalMinutes =
          exercises
            ?.filter((e) => e.exercise_date === dateStr)
            .reduce((sum, e) => sum + e.duration_minutes, 0) || 0;

        exerciseDays.push({ date: label, minutes: totalMinutes });
      }

      setExerciseData(exerciseDays);
      setLoading(false);
    };

    load();
  }, [router]);

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div className="p-5 max-w-2xl mx-auto">
      <Navbar />
      <h1 className="text-2xl font-bold mb-6">📊 Progress Kamu</h1>
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="font-bold text-gray-700 mb-3">
          😊 Mood 7 Hari Terakhir
        </h2>
        <div className="w-full h-72">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                domain={[0.5, 5.5]}
                ticks={[1, 2, 3, 4, 5]}
                tickFormatter={(value) =>
                  MOODS.find((m) => m.score === value)?.emoji || value
                }
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "emptyMarker") return ["Tidak diisi", "Status"];
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  const emoji = payload?.[0]?.payload?.emoji;
                  return emoji ? `${label} — Mood: ${emoji}` : label;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#fb923c"
                strokeWidth={3}
                dot={{ r: 6, fill: "#fb923c" }}
                activeDot={{ r: 8 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="emptyMarker"
                stroke="none"
                dot={{ r: 4, fill: "#d1d5db" }}
                connectNulls={false}
                legendType="none"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6">
        <h2 className="font-bold text-gray-700 mb-3">🎯 Riwayat Misi</h2>
        <ul className="divide-y divide-gray-100">
          {missionHistory.map((day) => (
            <li
              key={day.date}
              className="flex justify-between items-center py-3"
            >
              <div>
                <div className="text-xs text-gray-400 mb-0.5">{day.date}</div>
                <div
                  className={
                    day.completed
                      ? "line-through text-gray-400"
                      : day.missionText
                        ? "text-gray-700"
                        : "text-gray-300"
                  }
                >
                  {day.missionText || "Tidak ada data"}
                </div>
              </div>
              <span className="text-xl">
                {day.missionText ? (day.completed ? "✅" : "⭕") : "—"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-gray-700 mb-3">
          🏃 Olahraga 7 Hari Terakhir
        </h2>
        <div className="w-full h-64">
          <ResponsiveContainer>
            <BarChart data={exerciseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis
                label={{ value: "menit", angle: -90, position: "insideLeft" }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`${value} menit`, "Total olahraga"]}
              />
              <Bar dataKey="minutes" fill="#60a5fa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
