import { AVATARS } from "../data/avatars";
import { PlayerAvatar } from "./PlayerAvatar";

export function AvatarPicker({ value, onChange }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] tracking-[0.35em] text-[#5a6a5a] mb-3">
        AVATAR
      </p>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {AVATARS.map((av) => {
          const selected = value === av.id;
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => onChange(av.id)}
              className={`p-1.5 border transition-all duration-200 ${
                selected
                  ? "border-[#39ff14] bg-[rgba(57,255,20,0.1)] scale-105"
                  : "border-[#1a2a1a] bg-transparent hover:border-[#2a4a2a] opacity-70 hover:opacity-100"
              }`}
              title={av.label}
            >
              <PlayerAvatar avatarId={av.id} size="sm" highlight={selected} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
