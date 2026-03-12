import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Clock, Star } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const CATEGORIES = [
  { id: 'recent', icon: '🕐', label: 'Recent' },
  { id: 'smileys', icon: '😀', label: 'Smileys' },
  { id: 'people', icon: '👋', label: 'People' },
  { id: 'animals', icon: '🐱', label: 'Animals' },
  { id: 'food', icon: '🍕', label: 'Food' },
  { id: 'travel', icon: '✈️', label: 'Travel' },
  { id: 'activities', icon: '⚽', label: 'Activities' },
  { id: 'objects', icon: '💡', label: 'Objects' },
  { id: 'symbols', icon: '❤️', label: 'Symbols' },
  { id: 'flags', icon: '🏁', label: 'Flags' },
];

const EMOJIS = {
  smileys: ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🫡','🤐','🤨','😐','😑','😶','🫠','😏','😒','🙄','😬','🤥','😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','😮','😯','😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖'],
  people: ['👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','🫵','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🧠','🫀','🫁','🦷','🦴','👀','👁️','👅','👄'],
  animals: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🦟','🦗','🕷️','🕸️','🦂','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🪸','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🪼','🐊','🐅','🐆','🦓','🫏','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏','🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪽','🪿','🐓','🦃','🦤','🦚','🦜','🦢','🪶','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦','🦥','🐁','🐀','🐿️','🦔'],
  food: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🫑','🥬','🥒','🌶️','🫒','🧄','🧅','🥔','🍠','🫘','🥐','🍞','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','🫖','☕','🍵','🧃','🥤','🧋','🫙','🍶','🍺','🍻','🥂','🍷','🫗','🥃','🍸','🍹','🧉','🍾','🧊','🥄','🍴','🍽️','🥣','🥡','🥢','🧂'],
  travel: ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🛵','🏍️','🛺','🚲','🛴','🏄','🏇','🛶','⛵','🚤','🛥️','⛴️','🛳️','🚢','✈️','🛩️','🛫','🛬','🚀','🛸','🚁','🛰️','🪂','💺','🏠','🏡','🏘️','🏢','🏣','🏤','🏥','🏦','🏨','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','♨️','🎠','🛝','🎡','🎢','💈','🎪'],
  activities: ['⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸','🏒','🏑','🥍','🏏','🪃','🥅','⛳','🪁','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛼','🛷','⛸️','🥌','🎿','⛷️','🏂','🪂','🏋️','🤸','⛹️','🤺','🤾','🏌️','🏇','🧘','🏄','🏊','🤽','🚣','🧗','🚵','🚴','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️','🎫','🎟️','🎪','🎭','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🪗','🎷','🎺','🪈','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🕹️','🧩'],
  objects: ['⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','⏰','🕰️','⌛','⏳','📡','🔋','🪫','🔌','💡','🔦','🕯️','🪔','🧯','🛢️','🪙','💵','💴','💶','💷','🪪','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','🧿','🪬','💈','⚗️','🔭','🔬','🕳️','🩻','🩹','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎈','🎏','🎀','🪄','🪅','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','🪧','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓'],
  symbols: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝','💟','☮️','✝️','☪️','🕉️','☸️','✡️','🔯','🕎','☯️','☦️','🛐','⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓','🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️','🆎','🅾️','🆑','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🏧','🚾','♿','🅿️','🛗','🈳','🈂️','🛂','🛃','🛄','🛅','🚹','🚺','🚼','⚧️','🚻','🚮','🎦','📶','🈁','🔣','ℹ️','🔤','🔡','🔠','🆖','🆗','🆙','🆒','🆕','🆓','0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟','🔢','#️⃣','*️⃣','⏏️','▶️','⏸️','⏯️','⏹️','⏺️','⏭️','⏮️','⏩','⏪','⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️','↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃','🎵','🎶','➕','➖','➗','✖️','🟰','♾️','💲','💱','™️','©️','®️','〰️','➰','➿','🔚','🔙','🔛','🔝','🔜','✔️','☑️','🔘','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔸','🔹','🔶','🔷','🔳','🔲','▪️','▫️','◾','◻️','◼️','◽','🟥','🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫','🔈','🔇','🔉','🔊','🔔','🔕','📣','📢','💬','💭','🗯️','♠️','♣️','♥️','♦️','🃏','🎴','🀄','🕐','🕑','🕒','🕓','🕔','🕕','🕖','🕗','🕘','🕙','🕚','🕛','🕜','🕝','🕞','🕟','🕠','🕡','🕢','🕣','🕤','🕥','🕦','🕧'],
  flags: ['🏳️','🏴','🏴‍☠️','🏁','🚩','🏳️‍🌈','🏳️‍⚧️','🇺🇸','🇬🇧','🇨🇦','🇦🇺','🇫🇷','🇩🇪','🇯🇵','🇰🇷','🇨🇳','🇧🇷','🇮🇳','🇲🇽','🇪🇸','🇮🇹','🇷🇺','🇵🇹','🇳🇱','🇧🇪','🇸🇪','🇳🇴','🇩🇰','🇫🇮','🇨🇭','🇦🇹','🇵🇱','🇮🇪','🇬🇷','🇹🇷','🇪🇬','🇿🇦','🇳🇬','🇰🇪','🇸🇦','🇦🇪','🇮🇱','🇹🇭','🇻🇳','🇵🇭','🇮🇩','🇲🇾','🇸🇬','🇳🇿','🇦🇷','🇨🇴','🇨🇱','🇵🇪','🇭🇹'],
};

const STORAGE_KEY = 'kairo-recent-emoji';
const FREQ_KEY = 'kairo-freq-emoji';

function getRecent() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; } }
function getFreq() { try { return JSON.parse(localStorage.getItem(FREQ_KEY) || '{}'); } catch { return {}; } }

export default function EmojiPicker({ onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('smileys');
  const [recent, setRecent] = useState(getRecent);
  const [hovered, setHovered] = useState(null);

  const handleSelect = (emoji) => {
    onSelect(emoji);
    // Update recent
    const updated = [emoji, ...recent.filter(e => e !== emoji)].slice(0, 30);
    setRecent(updated);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
    // Update frequency
    const freq = getFreq();
    freq[emoji] = (freq[emoji] || 0) + 1;
    try { localStorage.setItem(FREQ_KEY, JSON.stringify(freq)); } catch {}
  };

  const frequent = useMemo(() => {
    const freq = getFreq();
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20).map(e => e[0]);
  }, []);

  const currentEmojis = useMemo(() => {
    if (search) {
      const q = search.toLowerCase();
      const all = Object.values(EMOJIS).flat();
      return all.filter(e => e.includes(q)).slice(0, 80);
    }
    if (category === 'recent') return recent.length > 0 ? recent : frequent;
    return EMOJIS[category] || [];
  }, [category, search, recent, frequent]);

  return (
    <div className="mb-1 rounded-xl overflow-hidden k-scale-in" style={{ background: colors.bg.surface, border: `1px solid ${colors.border.default}`, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', width: 352 }}>
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
        <Search className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search emoji..." autoFocus
          className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
        {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5" style={{ color: colors.text.muted }} /></button>}
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 overflow-x-auto scrollbar-none" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} title={c.label}
              className="w-8 h-8 flex items-center justify-center rounded-md text-base transition-colors flex-shrink-0"
              style={{ background: category === c.id ? colors.accent.subtle : 'transparent' }}>
              {c.icon}
            </button>
          ))}
        </div>
      )}

      {/* Emoji grid */}
      <div className="max-h-[200px] overflow-y-auto px-2 py-1.5 scrollbar-none">
        <div className="grid grid-cols-9 gap-0">
          {currentEmojis.map((e, i) => (
            <button key={`${e}-${i}`} onClick={() => handleSelect(e)}
              onMouseEnter={() => setHovered(e)} onMouseLeave={() => setHovered(null)}
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[22px] transition-transform hover:scale-110 hover:bg-[rgba(255,255,255,0.06)]">
              {e}
            </button>
          ))}
        </div>
        {currentEmojis.length === 0 && (
          <p className="text-center py-4 text-[12px]" style={{ color: colors.text.muted }}>No emoji found</p>
        )}
      </div>

      {/* Footer with hovered emoji name */}
      <div className="h-7 px-3 flex items-center" style={{ background: colors.bg.base, borderTop: `1px solid ${colors.border.default}` }}>
        {hovered ? (
          <span className="text-[11px]" style={{ color: colors.text.muted }}>{hovered}</span>
        ) : (
          <span className="text-[11px]" style={{ color: colors.text.disabled }}>Choose an emoji</span>
        )}
      </div>
    </div>
  );
}