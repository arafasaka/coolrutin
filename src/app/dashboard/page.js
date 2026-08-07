"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { MOODS } from "@/lib/moods";
import Navbar from "@/components/navbar";
import { useUnsavedChanges } from "@/context/unsaved-changes";
import { getLocalDateString } from "@/lib/date";

const EXERCISE_TYPES = [
  { emoji: "🏃", label: "Treadmill", color: "#ffdab9" },
  { emoji: "🏸", label: "Badminton", color: "#cce5ff" },
  { emoji: "🎾", label: "Tenis/Padel", color: "#d4f4dd" },
  { emoji: "🏊", label: "Berenang", color: "#c7f0f4" },
  { emoji: "🏋️", label: "Angkat Beban", color: "#e6d4f4" },
];

const DURATIONS = [15, 30, 45, 60];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [allMissions, setAllMissions] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  const [missionCompleted, setMissionCompleted] = useState(false);

  const [todayExercises, setTodayExercises] = useState([]);
  const [selectedExerciseType, setSelectedExerciseType] = useState(null);
  const [customType, setCustomType] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [customDuration, setCustomDuration] = useState("");
  const [showCustomDuration, setShowCustomDuration] = useState(false);

  const router = useRouter();
  const { setIsDirty, registerSaveHandler } = useUnsavedChanges();

  const today = getLocalDateString();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .single();
      if (profile?.username) setUsername(profile.username);

      const { data: missionsData } = await supabase
        .from("missions")
        .select("*");
      setAllMissions(missionsData || []);

      const { data: existingEntry } = await supabase
        .from("entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("entry_date", today)
        .single();

      if (existingEntry) {
        setSelectedMood(existingEntry.mood);
        setNote(existingEntry.note || "");
        setSaved(!!existingEntry.mood);
        setMissionCompleted(existingEntry.mission_completed || false);

        if (existingEntry.mission_id && missionsData) {
          const found = missionsData.find(
            (m) => m.id === existingEntry.mission_id,
          );
          if (found) setCurrentMission(found);
        }
      }

      // Kalau belum ada misi assigned hari ini, pilih otomatis (seed by tanggal)
      if (
        !existingEntry?.mission_id &&
        missionsData &&
        missionsData.length > 0
      ) {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const dayOfYear = Math.floor((now - startOfYear) / 86400000);
        const picked = missionsData[dayOfYear % missionsData.length];
        setCurrentMission(picked);

        await supabase.from("entries").upsert(
          {
            user_id: user.id,
            entry_date: today,
            mission_id: picked.id,
          },
          { onConflict: "user_id,entry_date" },
        );
      }

      const { data: exercisesData } = await supabase
        .from("exercises")
        .select("*")
        .eq("user_id", user.id)
        .eq("exercise_date", today)
        .order("created_at", { ascending: false });

      setTodayExercises(exercisesData || []);

      setLoading(false);
    };

    init();
  }, [router]);

  const handleSaveMood = async () => {
    if (!selectedMood) return;
    setSaving(true);

    const { error } = await supabase.from("entries").upsert(
      {
        user_id: user.id,
        entry_date: today,
        mood: selectedMood,
        note: note,
      },
      { onConflict: "user_id,entry_date" },
    );

    setSaving(false);
    if (!error) setSaved(true);
    setIsDirty(false);
  };

  useEffect(() => {
    registerSaveHandler(handleSaveMood);
  }, [selectedMood, note]);

  const handleToggleMissionCompleted = async () => {
    const newValue = !missionCompleted;
    setMissionCompleted(newValue);

    await supabase.from("entries").upsert(
      {
        user_id: user.id,
        entry_date: today,
        mission_completed: newValue,
      },
      { onConflict: "user_id,entry_date" },
    );
  };

  const handleShuffleMission = async () => {
    if (allMissions.length <= 1) return;

    let newMission;
    do {
      newMission = allMissions[Math.floor(Math.random() * allMissions.length)];
    } while (newMission.id === currentMission?.id);

    setCurrentMission(newMission);
    setMissionCompleted(false);

    await supabase.from("entries").upsert(
      {
        user_id: user.id,
        entry_date: today,
        mission_id: newMission.id,
        mission_completed: false,
      },
      { onConflict: "user_id,entry_date" },
    );
  };

  const handleAddExercise = async () => {
    const type = showCustomInput ? customType.trim() : selectedExerciseType;
    const duration = showCustomDuration
      ? parseInt(customDuration)
      : selectedDuration;

    if (!type || !duration || duration <= 0) return;

    const { data, error } = await supabase
      .from("exercises")
      .insert({
        user_id: user.id,
        exercise_date: today,
        exercise_type: type,
        duration_minutes: duration,
      })
      .select()
      .single();

    if (!error && data) {
      setTodayExercises([data, ...todayExercises]);
      setSelectedExerciseType(null);
      setCustomType("");
      setShowCustomInput(false);
      setSelectedDuration(null);
      setCustomDuration("");
      setShowCustomDuration(false);
    }
  };

  const handleDeleteExercise = async (id) => {
    await supabase.from("exercises").delete().eq("id", id);
    setTodayExercises(todayExercises.filter((ex) => ex.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div className="p-5 max-w-lg mx-auto">
      <Navbar />
      <h1 className="text-2xl font-bold mb-6">
        Halo, {username || user.email.split("@")[0]}! 👋
      </h1>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <h2 className="font-bold text-gray-700 mb-3">
          Gimana perasaanmu hari ini?
        </h2>
        <div className="flex gap-3 text-4xl">
          {MOODS.map((m) => (
            <button
              key={m.emoji}
              onClick={() => {
                setSelectedMood(m.emoji);
                setSaved(false);
                setIsDirty(true);
              }}
              className={`p-2 rounded-2xl transition-all ${
                selectedMood === m.emoji
                  ? "bg-orange-100 scale-125 shadow-md"
                  : "hover:scale-110 hover:bg-orange-50"
              }`}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <h2 className="font-bold text-gray-700 mb-3">
          1 hal berkesan hari ini
        </h2>
        <textarea
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setSaved(false);
            setIsDirty(true);
          }}
          placeholder="Contoh: Makan siang enak sama teman lama..."
          rows={3}
          className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-300 mb-3"
        />
        <button
          onClick={handleSaveMood}
          disabled={!selectedMood || saving}
          className={`w-full py-3 rounded-xl font-semibold transition-all ${
            saved
              ? "bg-green-100 text-green-700"
              : "bg-orange-400 text-white hover:bg-orange-500 disabled:bg-gray-200 disabled:text-gray-400"
          }`}
        >
          {saving ? "Menyimpan..." : saved ? "✓ Tersimpan" : "Simpan"}
        </button>
      </div>

      {currentMission && (
        <div
          className={`rounded-2xl p-5 mb-5 border-2 border-dashed transition-all ${
            missionCompleted
              ? "bg-green-50 border-green-300"
              : "bg-yellow-50 border-yellow-300"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <p className="font-bold text-gray-700">🎯 Misi Harian</p>
            <button
              onClick={handleShuffleMission}
              title="Acak misi lain"
              className="text-xl hover:rotate-180 transition-transform duration-300"
            >
              🎲
            </button>
          </div>
          <p
            className={`mb-3 ${missionCompleted ? "line-through text-gray-400" : "text-gray-700"}`}
          >
            {currentMission.content}
          </p>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600">
            <input
              type="checkbox"
              checked={missionCompleted}
              onChange={handleToggleMissionCompleted}
              className="w-5 h-5 accent-green-500"
            />
            Sudah dilakukan
          </label>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-gray-700 mb-3">🏃 Catat Olahraga</h2>

        <div className="flex flex-wrap gap-2 mb-3">
          {EXERCISE_TYPES.map((ex) => (
            <button
              key={ex.label}
              onClick={() => {
                setSelectedExerciseType(ex.label);
                setShowCustomInput(false);
              }}
              style={{ background: ex.color }}
              className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                selectedExerciseType === ex.label
                  ? "ring-2 ring-gray-700 scale-105"
                  : "hover:scale-105"
              }`}
            >
              {ex.emoji} {ex.label}
            </button>
          ))}
          <button
            onClick={() => {
              setShowCustomInput(true);
              setSelectedExerciseType(null);
            }}
            className={`px-4 py-2 rounded-full font-medium text-sm bg-gray-100 transition-all ${
              showCustomInput ? "ring-2 ring-gray-700" : "hover:bg-gray-200"
            }`}
          >
            ✏️ Lainnya
          </button>
        </div>

        {showCustomInput && (
          <input
            type="text"
            value={customType}
            onChange={(e) => setCustomType(e.target.value)}
            placeholder="Tulis jenis olahraga..."
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-300 mb-3"
          />
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => {
                setSelectedDuration(d);
                setShowCustomDuration(false);
              }}
              className={`px-4 py-2 rounded-full font-medium text-sm border-2 transition-all ${
                selectedDuration === d
                  ? "border-gray-700 bg-gray-700 text-white scale-105"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              {d} menit
            </button>
          ))}
          <button
            onClick={() => {
              setShowCustomDuration(true);
              setSelectedDuration(null);
            }}
            className={`px-4 py-2 rounded-full font-medium text-sm border-2 transition-all ${
              showCustomDuration
                ? "border-gray-700 bg-gray-700 text-white"
                : "border-gray-200 hover:border-gray-400"
            }`}
          >
            ✏️ Lainnya
          </button>
        </div>

        {showCustomDuration && (
          <input
            type="number"
            value={customDuration}
            onChange={(e) => setCustomDuration(e.target.value)}
            placeholder="Menit"
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-orange-300 mb-3"
          />
        )}

        <button
          onClick={handleAddExercise}
          className="w-full py-3 rounded-xl font-semibold bg-blue-400 text-white hover:bg-blue-500 transition-all"
        >
          + Tambah Olahraga
        </button>

        {todayExercises.length > 0 && (
          <ul className="mt-4 space-y-2">
            {todayExercises.map((ex) => (
              <li
                key={ex.id}
                className="flex justify-between items-center bg-blue-50 rounded-xl px-4 py-2.5"
              >
                <span className="text-sm font-medium text-gray-700">
                  {ex.exercise_type} — {ex.duration_minutes} menit
                </span>
                <button
                  onClick={() => handleDeleteExercise(ex.id)}
                  className="text-red-400 hover:text-red-600 text-sm font-medium"
                >
                  Hapus
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
