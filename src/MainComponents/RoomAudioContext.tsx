/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import {
  AUDIO_CONSTRAINTS,
  ICE_SERVERS,
  RoomAudioContext,
} from "../Utils/LobbyDetails";
import type { RoomAudioProviderProps } from "../Utils/LobbyDetails";

export const RoomAudioProvider = ({
  socket,
  children,
}: RoomAudioProviderProps) => {
  const localStream = useRef<MediaStream | null>(null);
  const peers = useRef<Record<string, RTCPeerConnection>>({});
  const audioAnalyser = useRef<AnalyserNode | null>(null);

  const [muted, setMuted] = useState(false);

  /* ------------------ helpers ------------------ */

  const waitForStream = async () => {
    while (!localStream.current) {
      await new Promise((r) => setTimeout(r, 50));
    }
  };

  /* ------------------ mic init ------------------ */

  useEffect(() => {
    let audioCtx: AudioContext | null = null;

    navigator.mediaDevices
      .getUserMedia(AUDIO_CONSTRAINTS)
      .then((stream) => {
        localStream.current = stream;

        audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 512;

        source.connect(analyser);
        audioAnalyser.current = analyser;

        // 🔔 tell server audio is ready
        socket.emit("audio_ready");
      })
      .catch(console.error);

    return () => {
      localStream.current?.getTracks().forEach((t) => t.stop());
      audioCtx?.close();
    };
  }, [socket]);

  /* ------------------ peer creation ------------------ */

  const createPeer = (peerId: string): RTCPeerConnection => {
    if (peers.current[peerId]) return peers.current[peerId];
    if (!localStream.current) throw new Error("Audio stream not ready");

    const pc = new RTCPeerConnection(ICE_SERVERS);

    localStream.current.getTracks().forEach((track) => {
      pc.addTrack(track, localStream.current!);
    });

    pc.ontrack = (event) => {
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.autoplay = true;
      audio.play().catch(() => {
        console.warn("Autoplay blocked until user interaction");
      });
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice_candidate", {
          to: peerId,
          candidate: e.candidate,
        });
      }
    };

    peers.current[peerId] = pc;
    return pc;
  };

  /* ------------------ socket handlers ------------------ */

  useEffect(() => {
    socket.on("reset_audio_peers", () => {
      Object.values(peers.current).forEach((pc) => pc.close());
      peers.current = {};
    });

    socket.on("request_audio_offer", async ({ to }: any) => {
      await waitForStream();
      const pc = createPeer(to);

      if (pc.signalingState !== "stable") return;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("audio_offer", { to, offer });
    });

    socket.on("user_joined_audio", async ({ socketId }: any) => {
      await waitForStream();
      const pc = createPeer(socketId);

      if (pc.signalingState !== "stable") return;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("audio_offer", { to: socketId, offer });
    });

    socket.on(
      "audio_offer",
      async ({
        from,
        offer,
      }: {
        from: string;
        offer: RTCSessionDescriptionInit;
      }) => {
        await waitForStream();

        const pc = createPeer(from);

        await pc.setRemoteDescription(new RTCSessionDescription(offer));

        // Only create answer if signalingState is correct
        if (pc.signalingState === "have-remote-offer") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("audio_answer", {
            to: from,
            answer: pc.localDescription,
          });
        }
      },
    );

    socket.on("audio_answer", async ({ from, answer }: any) => {
      await peers.current[from]?.setRemoteDescription(answer);
    });

    socket.on("ice_candidate", ({ from, candidate }: any) => {
      peers.current[from]?.addIceCandidate(candidate);
    });

    socket.on("user_left_audio", (id: string) => {
      peers.current[id]?.close();
      delete peers.current[id];
    });

    return () => {
      Object.values(peers.current).forEach((pc) => pc.close());
      peers.current = {};

      socket.off("reset_audio_peers");
      socket.off("request_audio_offer");
      socket.off("user_joined_audio");
      socket.off("audio_offer");
      socket.off("audio_answer");
      socket.off("ice_candidate");
      socket.off("user_left_audio");
    };
  }, [socket]);

  /* ------------------ mute ------------------ */

  const toggleMute = () => {
    localStream.current?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setMuted((p) => !p);
  };

  return (
    <RoomAudioContext.Provider value={{ muted, toggleMute }}>
      {children}
    </RoomAudioContext.Provider>
  );
};
