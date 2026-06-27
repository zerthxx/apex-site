"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Phase = "loading" | "playing" | "pingpong";

export function IntroOverlay() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<Phase>("loading");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<ImageBitmap[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!sessionStorage.getItem("intro-seen")) setVisible(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const video = videoRef.current;
    if (!video) return;

    const captureCanvas = document.createElement("canvas");
    const capturePromises: Promise<ImageBitmap>[] = [];
    let capturing = false;
    let framesResolved = false;
    let captureW = 1920;
    let captureH = 1080;

    function captureFrame() {
      if (!capturing) return;
      const captureCtx = captureCanvas.getContext("2d")!;
      captureCtx.drawImage(video!, 0, 0, captureW, captureH);
      capturePromises.push(createImageBitmap(captureCanvas));
    }

    function startCapture() {
      // Read video's actual dimensions, capped at 1920×1080
      captureW = Math.min(video!.videoWidth || 1920, 1920);
      captureH = Math.min(video!.videoHeight || 1080, 1080);
      captureCanvas.width = captureW;
      captureCanvas.height = captureH;

      capturing = true;
      if ("requestVideoFrameCallback" in video!) {
        const onVFC = () => {
          captureFrame();
          if (capturing) (video as any).requestVideoFrameCallback(onVFC);
        };
        (video as any).requestVideoFrameCallback(onVFC);
      } else {
        let lastCapture = 0;
        const onRAF = (now: number) => {
          if (!capturing) return;
          if (now - lastCapture >= 1000 / 30) {
            captureFrame();
            lastCapture = now;
          }
          requestAnimationFrame(onRAF);
        };
        requestAnimationFrame(onRAF);
      }
    }

    const onTimeUpdate = () => {
      if (framesResolved) return;
      const dur = video.duration;
      if (!dur || isNaN(dur)) return;
      if (video.currentTime >= dur - 0.5) {
        framesResolved = true;
        capturing = false;
        Promise.all(capturePromises).then((bitmaps) => {
          framesRef.current = bitmaps;
        });
      }
    };

    const startPingPong = (frames: ImageBitmap[]) => {
      setPhase("pingpong");
      const canvas = canvasRef.current;
      if (!canvas || !frames.length) return;

      // Set canvas internal resolution to match capture size
      canvas.width = captureW;
      canvas.height = captureH;
      const ctx = canvas.getContext("2d")!;

      let idx = frames.length - 1;
      let dir = -1;
      let lastFrameTime = 0;
      const msPerFrame = 1000 / 30;

      const draw = (now: number) => {
        if (now - lastFrameTime >= msPerFrame) {
          lastFrameTime = now;
          ctx.drawImage(frames[idx], 0, 0, captureW, captureH);
          idx += dir;
          if (idx >= frames.length) { idx = frames.length - 2; dir = -1; }
          if (idx < 0) { idx = 1; dir = 1; }
        }
        rafRef.current = requestAnimationFrame(draw);
      };
      rafRef.current = requestAnimationFrame(draw);
    };

    const onEnded = () => {
      if (framesRef.current.length > 0) {
        startPingPong(framesRef.current);
      } else {
        Promise.all(capturePromises).then((bitmaps) => {
          framesRef.current = bitmaps;
          startPingPong(bitmaps);
        });
      }
    };

    const onCanPlay = () => {
      setPhase("playing");
      startCapture();
      video.play().catch(() => {});
    };

    video.addEventListener("canplaythrough", onCanPlay, { once: true });
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded, { once: true });

    return () => {
      capturing = false;
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener("canplaythrough", onCanPlay);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
      video.pause();
      framesRef.current.forEach((b) => b.close());
      framesRef.current = [];
    };
  }, [visible]);

  function dismiss() {
    cancelAnimationFrame(rafRef.current);
    videoRef.current?.pause();
    framesRef.current.forEach((b) => b.close());
    framesRef.current = [];
    sessionStorage.setItem("intro-seen", "1");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-[#0A0C10] flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <video
            ref={videoRef}
            src="/videos/apex-site-intro-1.mp4"
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: phase === "pingpong" ? "none" : "block" }}
          />

          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: phase === "pingpong" ? "block" : "none" }}
          />

          <motion.div
            className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.3 }}
          >
            <style>{`
              @keyframes glow-shift {
                0%   { box-shadow: 0 0 22px 7px rgba(99,210,255,0.8),  0 0 55px 18px rgba(99,210,255,0.3); }
                25%  { box-shadow: 0 0 22px 7px rgba(180,80,255,0.8),  0 0 55px 18px rgba(180,80,255,0.3); }
                50%  { box-shadow: 0 0 22px 7px rgba(255,70,100,0.8),  0 0 55px 18px rgba(255,70,100,0.3); }
                75%  { box-shadow: 0 0 22px 7px rgba(50,230,130,0.8),  0 0 55px 18px rgba(50,230,130,0.3); }
                100% { box-shadow: 0 0 22px 7px rgba(99,210,255,0.8),  0 0 55px 18px rgba(99,210,255,0.3); }
              }
            `}</style>
            <button
              onClick={dismiss}
              className="px-10 py-4 rounded-full bg-copper text-[#0A0C10] font-display font-bold text-lg tracking-wide hover:bg-copper-light transition-colors duration-200"
              style={{ animation: 'glow-shift 4s ease-in-out infinite' }}
            >
              Tervetuloa
            </button>
            <p className="text-white text-base uppercase tracking-[0.3em] font-semibold whitespace-nowrap opacity-90 drop-shadow-[0_0_12px_rgba(200,129,58,0.6)]">
              Tervetuloa Apex Site
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
