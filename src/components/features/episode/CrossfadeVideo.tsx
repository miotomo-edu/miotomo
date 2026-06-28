import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Props = {
  src: string | null | undefined;
  paused?: boolean;
  crossfadeDuration?: number;
  className?: string;
};

type Slot = "a" | "b";

export default function CrossfadeVideo({
  src,
  paused = false,
  crossfadeDuration = 200,
  className,
}: Props) {
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const frontSlotRef = useRef<Slot>("a");
  const currentSrcRef = useRef<string | null>(null);
  const pausedRef = useRef(paused);
  const swapInProgressRef = useRef(false);
  const pendingCleanupRef = useRef<(() => void) | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);
  const [frontSlot, setFrontSlot] = useState<Slot>("a");
  const [hasVisibleFrame, setHasVisibleFrame] = useState(false);
  pausedRef.current = paused;

  const getVideo = useCallback(
    (slot: Slot) => (slot === "a" ? aRef.current : bRef.current),
    [],
  );

  const revealOnNextFrame = useCallback(
    (video: HTMLVideoElement, reveal: () => void) => {
      if ("requestVideoFrameCallback" in video) {
        const callbackId = video.requestVideoFrameCallback(() => reveal());
        return () => video.cancelVideoFrameCallback(callbackId);
      }

      const frameId = window.requestAnimationFrame(reveal);
      return () => window.cancelAnimationFrame(frameId);
    },
    [],
  );

  const swapTo = useCallback(
    (nextSrc: string) => {
      pendingCleanupRef.current?.();
      pendingCleanupRef.current = null;
      if (pauseTimeoutRef.current !== null) {
        window.clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }

      const outgoingSlot = frontSlotRef.current;
      const incomingSlot: Slot = outgoingSlot === "a" ? "b" : "a";
      const outgoingVideo = getVideo(outgoingSlot);
      const incomingVideo = getVideo(incomingSlot);
      if (!incomingVideo) return;

      swapInProgressRef.current = true;
      incomingVideo.pause();
      if (incomingVideo.getAttribute("src") !== nextSrc) {
        incomingVideo.src = nextSrc;
        incomingVideo.load();
      }
      incomingVideo.currentTime = 0;

      let cancelled = false;
      let cancelFrame: (() => void) | null = null;

      const reveal = () => {
        if (cancelled) return;
        frontSlotRef.current = incomingSlot;
        setFrontSlot(incomingSlot);
        setHasVisibleFrame(true);

        if (pauseTimeoutRef.current !== null) {
          window.clearTimeout(pauseTimeoutRef.current);
        }
        pauseTimeoutRef.current = window.setTimeout(() => {
          outgoingVideo?.pause();
          swapInProgressRef.current = false;
          pauseTimeoutRef.current = null;
        }, crossfadeDuration);
      };

      const playIncoming = () => {
        if (pausedRef.current) {
          reveal();
          return;
        }
        incomingVideo
          .play()
          .then(() => {
            if (!cancelled) {
              cancelFrame = revealOnNextFrame(incomingVideo, reveal);
            }
          })
          .catch(() => {
            swapInProgressRef.current = false;
          });
      };

      if (incomingVideo.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        playIncoming();
      } else {
        incomingVideo.addEventListener("canplay", playIncoming, { once: true });
      }

      pendingCleanupRef.current = () => {
        cancelled = true;
        cancelFrame?.();
        incomingVideo.removeEventListener("canplay", playIncoming);
      };
    },
    [crossfadeDuration, getVideo, revealOnNextFrame],
  );

  useEffect(() => {
    if (!src) return;

    if (
      currentSrcRef.current === null ||
      (!hasVisibleFrame && src === currentSrcRef.current)
    ) {
      currentSrcRef.current = src;
      const video = aRef.current;
      if (!video) return;
      video.src = src;
      video.load();

      let cancelled = false;
      let cancelFrame: (() => void) | null = null;
      const showFirstFrame = () => {
        if (!cancelled) {
          cancelFrame = revealOnNextFrame(video, () =>
            setHasVisibleFrame(true),
          );
        }
      };
      const showLoadedFrame = () => {
        if (!cancelled) setHasVisibleFrame(true);
      };
      if (pausedRef.current) {
        video.addEventListener("loadeddata", showLoadedFrame, { once: true });
      } else {
        video.addEventListener("playing", showFirstFrame, { once: true });
        video.play().catch(() => {});
      }

      return () => {
        cancelled = true;
        cancelFrame?.();
        video.removeEventListener("playing", showFirstFrame);
        video.removeEventListener("loadeddata", showLoadedFrame);
      };
    }

    if (src !== currentSrcRef.current) {
      currentSrcRef.current = src;
      swapTo(src);
    }
  }, [hasVisibleFrame, src, revealOnNextFrame, swapTo]);

  useEffect(() => {
    const frontVideo = getVideo(frontSlotRef.current);
    if (paused) {
      aRef.current?.pause();
      bRef.current?.pause();
      return;
    }

    frontVideo?.play().catch(() => {});
  }, [getVideo, paused]);

  useEffect(() => {
    let frameId = 0;
    const tick = () => {
      const video = getVideo(frontSlotRef.current);
      const remaining = video ? video.duration - video.currentTime : Infinity;
      const loopLeadSeconds = crossfadeDuration / 1000 + 0.05;

      if (
        currentSrcRef.current &&
        !swapInProgressRef.current &&
        video &&
        !video.paused &&
        Number.isFinite(remaining) &&
        remaining <= loopLeadSeconds
      ) {
        swapTo(currentSrcRef.current);
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [crossfadeDuration, getVideo, swapTo]);

  useEffect(
    () => () => {
      pendingCleanupRef.current?.();
      if (pauseTimeoutRef.current !== null) {
        window.clearTimeout(pauseTimeoutRef.current);
      }
    },
    [],
  );

  const videoStyle = (slot: Slot): CSSProperties => ({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    opacity: hasVisibleFrame && frontSlot === slot ? 1 : 0,
    transition: `opacity ${crossfadeDuration}ms ease`,
  });

  return (
    <div
      className={className}
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <video
        ref={aRef}
        muted
        playsInline
        preload="auto"
        style={videoStyle("a")}
      />
      <video
        ref={bRef}
        muted
        playsInline
        preload="auto"
        style={videoStyle("b")}
      />
    </div>
  );
}
