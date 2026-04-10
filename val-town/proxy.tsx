import { Hono } from "npm:hono";
import process from "node:process";
import { cors } from "npm:hono/cors";

const app = new Hono();

// Allow *.miotomo.com and localhost
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return false; // block requests with no origin (e.g., curl)
      try {
        const url = new URL(origin);
        if (
          url.hostname.endsWith(".miotomo.com") ||
          url.hostname === "localhost" ||
          url.hostname === "127.0.0.1"
        ) {
          return origin;
        }
      } catch {
        // If origin is not a valid URL, block it
      }
      return false;
    },
  }),
);
app.get("/", (c) => c.text("Hello from miot!"));

app.post("/connect-pipecat", async (c) => {
  try {
    const { config } = await c.req.json();

    const botData = {
      greeting: config.greeting,
      transportType: "daily",
      metadata: config.metadata,
    };
    console.log(
      `Fetching https://api.pipecat.daily.co/v1/public/${process.env.AGENT_NAME}${
        botData.metadata.region && botData.metadata.region !== ""
          ? `-${botData.metadata.region}`
          : ""
      }/start`,
    );
    console.log("botData", botData);
    const body = {
      student_name: botData.metadata.studentName,
      student_id: botData.metadata.studentId,
      chapter_old:
        botData.metadata.book.progress ?? +botData.metadata.chapter - 1,
      chapter: botData.metadata.chapter,
      book_id: botData.metadata.book.id,
      book: botData.metadata.book.title,
      prompt: botData.metadata.character.prompt,
      section_type: botData.metadata.book.section_type,
      character_name: botData.metadata.character.name,
      region: botData.metadata.region,
    };
    console.log("body", body);

    const response = await fetch(
      `https://api.pipecat.daily.co/v1/public/${process.env.AGENT_NAME}${
        body.region && body.region !== "" ? `-${body.region}` : ""
      }/start`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PIPECAT_CLOUD_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Create Daily room
          createDailyRoom: true,
          privacy: "private",
          // Optionally set Daily room properties
          dailyRoomProperties: {
            start_video_off: true,
            // geo: "ap-south-1",
            exp: +new Date() / 1000 + 610, // time in minutes now + 10 minutes + 10 seconds
            max_participants: 2,
            eject_at_room_exp: true,
          },
          // Optionally pass custom data to the bot
          body,
          // body: JSON.stringify(updatedBotConfig),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("DATA", data);
    // Transform to what your RTVI client expects
    return c.json({
      room_url: data.dailyRoom,
      token: data.dailyToken,
    });
  } catch (error) {
    console.error("API error:", error);
    return c.json({ error: "Failed to start agent" }, 500);
  }
});

app.post("/disconnect-pipecat", async (c) => {
  try {
    const payload = await c.req.json();
    const roomName =
      typeof payload?.room_name === "string"
        ? payload.room_name.trim()
        : typeof payload?.roomName === "string"
          ? payload.roomName.trim()
          : "";
    const participantId =
      typeof payload?.participant_id === "string"
        ? payload.participant_id.trim()
        : typeof payload?.participantId === "string"
          ? payload.participantId.trim()
          : "";

    if (!roomName || !participantId) {
      return c.json(
        {
          error: "Missing room_name or participant_id",
        },
        400,
      );
    }

    if (!process.env.PIPECAT_CLOUD_API_KEY) {
      return c.json(
        {
          error: "Missing PIPECAT_CLOUD_API_KEY",
        },
        500,
      );
    }

    console.log("Disconnecting Daily participant", {
      roomName,
      participantId,
      studentId:
        typeof payload?.student_id === "string" ? payload.student_id : "",
      reason: typeof payload?.reason === "string" ? payload.reason : "",
    });

    const response = await fetch(
      `https://api.daily.co/v1/rooms/${encodeURIComponent(roomName)}/eject`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PIPECAT_CLOUD_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: [participantId],
        }),
      },
    );

    const responseText = await response.text();
    let responseBody: unknown = responseText;
    if (responseText) {
      try {
        responseBody = JSON.parse(responseText);
      } catch {
        responseBody = responseText;
      }
    }
    if (!response.ok) {
      console.error("Daily eject failed", {
        status: response.status,
        body: responseBody,
      });
      return c.json(
        {
          error: "Failed to eject Daily participant",
          status: response.status,
          body: responseBody,
        },
        502,
      );
    }

    return c.json({
      ok: true,
      roomName,
      participantId,
      daily: responseBody ?? null,
    });
  } catch (error) {
    console.error("Disconnect API error:", error);
    return c.json({ error: "Failed to disconnect participant" }, 500);
  }
});

app.get("/analytics-status", async (c) => {
  try {
    console.log(`Fetching https://littleark-ta.hf.space/status`);
    const response = await fetch("https://littleark-ta.hf.space/status", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    const status = await response.json();
    return c.json(status);
  } catch (error) {
    console.error(error);
    return c.status(500).text("Internal Server Error");
  }
});

app.post("/analyze", async (c) => {
  try {
    const body = await c.req.json();

    console.log(`Fetching https://littleark-ta.hf.space/analyze_with_summary`);

    console.log("body", body);

    const response = await fetch(
      `https://littleark-ta.hf.space/analyze_with_summary`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("DATA", data);
    return c.json(data);
  } catch (error) {
    console.error(error);
    return c.status(500).text("Internal Server Error");
  }
});

app.get("/vocabulary-ready", async (c) => {
  try {
    console.log(`Fetching https://littleark-vocabulary.hf.space/ready`);
    const response = await fetch(
      "https://littleark-vocabulary.hf.space/ready",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN_VOCABULARY}`,
          "Content-Type": "application/json",
        },
      },
    );
    const status = await response.json();
    return c.json(status);
  } catch (error) {
    console.error(error);
    return c.status(500).text("Internal Server Error");
  }
});

app.get("/grade", async (c) => {
  const { socket: clientWs, response } = Deno.upgradeWebSocket(c.req.raw);
  const url = new URL(c.req.url);

  const targetWord = (url.searchParams.get("target_word") ?? "")
    .trim()
    .toLowerCase();
  const sampleRateRaw = url.searchParams.get("sample_rate"); // optional, for client compatibility

  if (!targetWord || targetWord.length > 40) {
    clientWs.close(1008, "Invalid target_word");
    return response;
  }

  if (sampleRateRaw !== null) {
    const sampleRate = Number(sampleRateRaw);
    if (
      !Number.isFinite(sampleRate) ||
      sampleRate < 8000 ||
      sampleRate > 48000
    ) {
      clientWs.close(1008, "Invalid sample_rate");
      return response;
    }
  }

  // Your FastAPI WS route on HF Space
  const upstreamUrl = "wss://littleark-vocabulary.hf.space/v1/vocab/grade";

  let upstreamWs: WebSocket | null = null;
  let upstreamOpen = false;
  let closed = false;

  const queue: (string | Uint8Array)[] = [];
  const MAX_QUEUE_MESSAGES = 100;

  const closeBoth = (code = 1011, reason = "Proxy closed") => {
    if (closed) return;
    closed = true;
    try {
      if (
        clientWs.readyState === WebSocket.OPEN ||
        clientWs.readyState === WebSocket.CONNECTING
      ) {
        clientWs.close(code, reason);
      }
    } catch {}
    try {
      if (
        upstreamWs &&
        (upstreamWs.readyState === WebSocket.OPEN ||
          upstreamWs.readyState === WebSocket.CONNECTING)
      ) {
        upstreamWs.close(code, reason);
      }
    } catch {}
  };

  const normalizeWsData = async (
    data: unknown,
  ): Promise<string | Uint8Array> => {
    if (typeof data === "string") return data;
    if (data instanceof Uint8Array) return data;
    if (data instanceof ArrayBuffer) return new Uint8Array(data);
    if (typeof Blob !== "undefined" && data instanceof Blob) {
      return new Uint8Array(await data.arrayBuffer());
    }
    return new TextEncoder().encode(String(data));
  };

  const flushQueue = () => {
    if (!upstreamWs || !upstreamOpen) return;
    while (queue.length && upstreamWs.readyState === WebSocket.OPEN) {
      upstreamWs.send(queue.shift()!);
    }
  };

  const connectUpstream = async () => {
    const token = Deno.env.get("HF_TOKEN_VOCABULARY");
    if (!token) {
      closeBoth(1011, "Server misconfigured");
      return;
    }

    try {
      const { socket } = await Deno.connectWebSocket(upstreamUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      upstreamWs = socket;
      upstreamWs.binaryType = "arraybuffer";

      const openTimer = setTimeout(() => {
        closeBoth(1011, "Upstream open timeout");
      }, 10_000);

      upstreamWs.onopen = () => {
        clearTimeout(openTimer);
        upstreamOpen = true;

        // Required by your backend before streaming audio
        upstreamWs?.send(
          JSON.stringify({
            type: "start",
            target_word: targetWord,
          }),
        );

        flushQueue();
      };

      upstreamWs.onmessage = (evt) => {
        try {
          if (clientWs.readyState !== WebSocket.OPEN) return;
          clientWs.send(evt.data);
        } catch {
          closeBoth(1011, "Proxy forward error");
        }
      };

      upstreamWs.onerror = () => {
        closeBoth(1011, "Upstream error");
      };

      upstreamWs.onclose = (e) => {
        closeBoth(e.code || 1011, e.reason || "Upstream closed");
      };
    } catch {
      closeBoth(1011, "Upstream connect failed");
    }
  };

  clientWs.onmessage = (evt) => {
    void (async () => {
      if (closed) return;

      const payload = await normalizeWsData(evt.data);

      if (
        upstreamWs &&
        upstreamOpen &&
        upstreamWs.readyState === WebSocket.OPEN
      ) {
        upstreamWs.send(payload);
        return;
      }

      if (queue.length >= MAX_QUEUE_MESSAGES) {
        closeBoth(1013, "Overloaded");
        return;
      }

      queue.push(payload);
    })();
  };

  clientWs.onerror = () => {
    closeBoth(1002, "Client error");
  };

  clientWs.onclose = (e) => {
    closeBoth(e.code || 1000, e.reason || "Client closed");
  };

  // Important: connect immediately, do not wait for clientWs.onopen
  void connectUpstream();

  return response;
});

export default app.fetch;
