"use client";

import { useEffect, useState } from "react";
import { chatSoundOn, playChatSound, setChatSoundOn, unlockChatSound } from "@/lib/chat-sound";

/** On/off switch for the chat alert sound. Saved on this device only. */
export function ChatSoundSetting() {
  const [on, setOn] = useState(true);
  useEffect(() => setOn(chatSoundOn()), []);

  return (
    <div className="space-y-2">
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => {
            setOn(e.target.checked);
            setChatSoundOn(e.target.checked);
            if (e.target.checked) {
              unlockChatSound();
              playChatSound("direct", true);
            }
          }}
          className="mt-0.5"
        />
        <span>Play a sound when a new Team Chat message comes in while the app is open</span>
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            unlockChatSound();
            playChatSound("direct", true);
          }}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
        >
          Test message to me
        </button>
        <button
          type="button"
          onClick={() => {
            unlockChatSound();
            playChatSound("team", true);
          }}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs"
        >
          Test whole-team post
        </button>
      </div>
      <p className="text-xs text-slate-500">
        This is saved on this phone or computer only. Your phone&apos;s silent switch or volume still applies.
      </p>
    </div>
  );
}
