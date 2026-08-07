"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";

const ROUND_SECONDS = 60;
const BOMB_CHANCE = 0.16;

export default function BubblePop() {
  const canvasRef = useRef(null);
  const bubblesRef = useRef([]);
  const animRef = useRef(null);
  const startTimeRef = useRef(null);
  const spawnTimerRef = useRef(0);

  const [paused, setPaused] = useState(false);
  const pausedAtRef = useRef(null);

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | playing | over
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [bestScore, setBestScore] = useState(null);
  const [gameOverReason, setGameOverReason] = useState(null);
  const router = useRouter();

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

      const { data } = await supabase
        .from("game_scores")
        .select("score")
        .eq("user_id", user.id)
        .eq("game", "bubble-pop")
        .order("score", { ascending: false })
        .limit(1)
        .single();
      if (data) setBestScore(data.score);
    };
    init();
  }, [router]);

  const startGame = () => {
    bubblesRef.current = [];
    spawnTimerRef.current = 0;
    startTimeRef.current = performance.now();
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setGameOverReason(null);
    setStatus("playing");
  };

  const endGame = async (reason) => {
    setStatus("over");
    setGameOverReason(reason);
    cancelAnimationFrame(animRef.current);

    setScore((currentScore) => {
      supabase
        .from("game_scores")
        .insert({
          user_id: user.id,
          game: "bubble-pop",
          score: currentScore,
        })
        .then(() => {
          if (bestScore === null || currentScore > bestScore)
            setBestScore(currentScore);
        });
      return currentScore;
    });
  };

  const togglePause = () => {
    if (!paused) {
      pausedAtRef.current = performance.now();
      cancelAnimationFrame(animRef.current);
    }
    setPaused(!paused);
  };

  const quitGame = () => {
    cancelAnimationFrame(animRef.current);
    setStatus("idle");
    setPaused(false);
  };

  useEffect(() => {
    if (status !== "playing" || paused) return;
    // Kalau baru resume dari pause, geser startTime supaya waktu pause nggak ke-hitung
    if (pausedAtRef.current !== null) {
      const pauseDuration = performance.now() - pausedAtRef.current;
      startTimeRef.current += pauseDuration;
      pausedAtRef.current = null;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const loop = (now) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const remaining = Math.max(0, ROUND_SECONDS - elapsed);
      setTimeLeft(Math.ceil(remaining));

      if (remaining <= 0) {
        endGame("time");
        return;
      }

      // Difficulty: makin lama makin cepat geraknya
      const difficulty = 1 + elapsed / 30; // naik pelan-pelan

      // Spawn bubble baru (jumlah spawn tetap konsisten)
      spawnTimerRef.current -= 1;
      if (spawnTimerRef.current <= 0) {
        spawnTimerRef.current = 40;
        bubblesRef.current.push({
          x: 30 + Math.random() * (canvas.width - 60),
          y: canvas.height + 20,
          r: 24,
          isBomb: Math.random() < BOMB_CHANCE,
          speed: (1.2 + Math.random() * 0.8) * difficulty,
        });
      }

      // Update & gambar
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubblesRef.current = bubblesRef.current.filter((b) => {
        b.y -= b.speed;
        const age = now - b.born;
        if (age > b.life || b.y < -40) return false;

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.isBomb ? "#374151" : "rgba(251,146,60,0.25)";
        ctx.fill();
        ctx.font = "28px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(b.isBomb ? "💣" : "🫧", b.x, b.y);
        return true;
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [status, paused]);

  const handleTap = (e) => {
    if (status !== "playing") return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const hitIndex = bubblesRef.current.findIndex(
      (b) => Math.hypot(b.x - x, b.y - y) < b.r,
    );
    if (hitIndex === -1) return;

    const hit = bubblesRef.current[hitIndex];
    if (hit.isBomb) {
      endGame("bomb");
      return;
    }
    bubblesRef.current.splice(hitIndex, 1);
    setScore((s) => s + 1);
  };

  return (
    <div className="p-5 max-w-lg mx-auto">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">🫧 Bubble Pop</h1>

      {status === "idle" && (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <p className="text-gray-500 mb-1">
            Pencet bubble sebanyak mungkin dalam 60 detik.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Awas bom 💣 — kepencet, langsung game over!
          </p>
          {bestScore !== null && (
            <p className="text-orange-500 font-semibold mb-6">
              🏆 Rekor kamu: {bestScore}
            </p>
          )}
          <button
            onClick={startGame}
            className="px-8 py-3 rounded-xl font-semibold bg-orange-400 text-white hover:bg-orange-500 transition-all"
          >
            Mulai Main
          </button>
        </div>
      )}

      {status === "playing" && (
        <>
          <div className="flex justify-between items-center mb-3 px-1">
            <span className="font-bold text-gray-700">Skor: {score}</span>
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-700">⏱️ {timeLeft}s</span>
              <button
                onClick={togglePause}
                className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 hover:bg-gray-200 transition-all"
              >
                {paused ? "▶️" : "⏸️"}
              </button>
            </div>
          </div>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={360}
              height={480}
              onPointerDown={handleTap}
              className="w-full bg-orange-50 rounded-2xl shadow-sm touch-none"
            />
            {paused && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center gap-3">
                <p className="text-white text-xl font-bold">⏸️ Dijeda</p>
                <button
                  onClick={togglePause}
                  className="px-6 py-2 rounded-xl font-semibold bg-orange-400 text-white hover:bg-orange-500 transition-all"
                >
                  Lanjutkan
                </button>
                <button
                  onClick={quitGame}
                  className="text-white/70 text-sm hover:text-white"
                >
                  Berhenti
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {status === "over" && (
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="text-4xl mb-2">
            {gameOverReason === "bomb" ? "💥" : "⏰"}
          </div>
          <p className="font-bold text-gray-800 text-lg mb-1">
            {gameOverReason === "bomb" ? "Kena Bom!" : "Waktu Habis!"}
          </p>
          <p className="text-gray-500 mb-4">
            Skor kamu:{" "}
            <span className="font-bold text-orange-500">{score}</span>
          </p>
          {bestScore !== null && (
            <p className="text-sm text-gray-400 mb-6">
              🏆 Rekor terbaik: {bestScore}
            </p>
          )}
          <button
            onClick={startGame}
            className="px-8 py-3 rounded-xl font-semibold bg-orange-400 text-white hover:bg-orange-500 transition-all"
          >
            Main Lagi
          </button>
        </div>
      )}
    </div>
  );
}
