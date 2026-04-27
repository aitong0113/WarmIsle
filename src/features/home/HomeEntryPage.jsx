import { useEffect, useRef, useState } from "react";
import { Music2, Music4, Volume2, VolumeX } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./HomeEntryPage.scss";
import islandBg from "@/assets/scenes/island/main.png";
import brandLogo from "@/assets/brand/logo.png";
import hakoGreeting from "@/assets/characters/hako/chat/transparent/hako-greeting-cutout.png";
import hakoTalking from "@/assets/characters/hako/chat/transparent/hako-talking-cutout.png";
import hakoThinking from "@/assets/characters/hako/chat/transparent/hako-thinking-cutout.png";
import hakoCalm from "@/assets/characters/hako/chat/transparent/hako-calm-cutout.png";
import hakoHappy from "@/assets/characters/hako/chat/transparent/hako-happy-cutout.png";
import { EMOTION_OPTIONS } from "@/features/emotion/config/emotionOptions";
import { getGuestUserId } from "@/services/guestUser";
import { setUser } from "@/features/user/store/userSlice";
import { addEmotionLog, setEmotion, setEmotionNote } from "@/features/emotion/store/emotionSlice";
import { syncEmotionLogApi } from "@/services/emotionApi";
import { todayLocalDate } from "@/utils/date";
import { markEntrySeen } from "./entrySession";

function HomeEntryPage() {
  const [entering, setEntering] = useState(false);
  const [mood, setMood] = useState(null);
  const [name, setName] = useState("");
  const [introNote, setIntroNote] = useState("");
  const [dialogueStep, setDialogueStep] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const nameInputRef = useRef(null);
  const introNoteRef = useRef(null);
  const user = useSelector((state) => state.user || {});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const moodOptions = EMOTION_OPTIONS.map((option) => ({
    key: option.id,
    iconSrc: option.iconSrc,
    label: option.label,
    emotionId: option.id,
    appearance:
      option.id === "happy" || option.id === "grateful"
        ? "happy"
        : ["sad", "tired", "stressed", "anxious"].includes(option.id)
          ? "sad"
          : "neutral",
  }));

  const selectedMood = moodOptions.find((option) => option.key === mood) || null;
  const activeMood = selectedMood || moodOptions.find((option) => option.key === "relaxed") || moodOptions[0];
  const trimmedName = name.trim();
  const trimmedIntroNote = introNote.trim();
  const hasName = Boolean(trimmedName);
  const hasSelectedMood = Boolean(selectedMood);
  const displayName = hasName ? trimmedName : "旅人";
  const selectedMoodLabel = selectedMood?.label || "現在的心情";
  const introGreetingByMood = {
    neutral: "嗨，歡迎來到暖心島。我是哈可。",
    happy: "嗨，歡迎來到暖心島。我是哈可。看起來你心裡有一點亮亮的期待。",
    sad: "嗨，歡迎來到暖心島。我是哈可。如果你今天比較累，我會陪你慢一點。",
  };
  const moodResponseByAppearance = {
    sad: `${displayName}，我有接住你現在這份「${selectedMoodLabel}」。今天如果想慢一點，也沒有關係。`,
    neutral: `${displayName}，收到你現在的「${selectedMoodLabel}」。我們就照這個節奏，慢慢往裡走。`,
    happy: `${displayName}，我有感覺到你現在這份「${selectedMoodLabel}」。把這道亮亮的心情，也一起帶進暖心島吧。`,
  };
  const dialogueScenes = [
    {
      line: introGreetingByMood[activeMood.appearance] || introGreetingByMood.neutral,
      image: hakoGreeting,
    },
    {
      line: "進島前，我會先陪你做一個很短的整理：名字、現在的感覺，還有一句今天的心情。",
      image: hakoTalking,
    },
    {
      line: "如果你想先感受一下這座島，也可以先當遊客看看；如果你願意，也先把名字留給我，這樣我就能好好稱呼你。",
      image: hakoThinking,
    },
    {
      line: hasName
        ? `${displayName}，我記住了。先選一個比較貼近現在的心情，我會照這個節奏陪你。`
        : "你可以先寫下名字，準備好了，我再帶你一起選今天的入島心情。",
      image: hakoTalking,
    },
    {
      line: hasSelectedMood
        ? moodResponseByAppearance[selectedMood.appearance] || moodResponseByAppearance.neutral
        : "先選一個比較像現在的感覺，我再接著陪你往下走。",
      image: selectedMood?.appearance === "happy" ? hakoHappy : hakoCalm,
    },
    {
      line: "如果你想，下一步可以寫一句短短的心情日記留給今天；不想寫也沒關係，我們一樣可以直接去情緒沙灘。",
      image: hakoCalm,
    },
  ];
  const currentDialogueScene = dialogueScenes[dialogueStep] || dialogueScenes[0];
  const currentDialogueLine = currentDialogueScene.line;
  const showMoodStep = dialogueStep >= 3 && dialogueStep < 5;
  const showJournalStep = dialogueStep >= 5;
  const canAdvanceDialogue =
    dialogueStep < 2 ||
    (dialogueStep === 2 && hasName) ||
    (dialogueStep === 4 && hasSelectedMood);
  const canGoBackDialogue = dialogueStep > 0;
  const nextDialogueLabel =
    dialogueStep < 1
      ? "先聽你說"
      : dialogueStep < 2
        ? "讓你認識我"
        : dialogueStep === 2
          ? hasName
            ? "好，繼續"
            : "先寫名字"
          : dialogueStep === 4
            ? "寫一句心情"
            : "下一句";
  const hakoImageSrc = currentDialogueScene.image;

  useEffect(() => {
    if (dialogueStep === 2 && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [dialogueStep]);

  useEffect(() => {
    if (dialogueStep >= 5 && introNoteRef.current) {
      introNoteRef.current.focus();
    }
  }, [dialogueStep]);

  const persistVisitor = () => {
    const trimmedName = name.trim();
    dispatch(
      setUser({
        id: user.id || getGuestUserId(),
        name: trimmedName || user.name || "暖心島遊客",
      }),
    );
  };

  const handleEnter = () => {
    persistVisitor();
    markEntrySeen();
    setEntering(true);
    setTimeout(() => {
      navigate("/island");
    }, 1200);
  };

  const handleBrowseFirst = () => {
    persistVisitor();
    markEntrySeen();
    navigate("/island");
  };

  const handleGoToEmotionBeach = () => {
    if (!selectedMood) return;

    persistVisitor();
    markEntrySeen();
    const emotionValue = selectedMood.emotionId || "ok";
    const today = todayLocalDate();

    dispatch(setEmotion(emotionValue));
    dispatch(
      addEmotionLog({
        emotion: emotionValue,
        date: today,
      }),
    );
    if (trimmedIntroNote) {
      dispatch(setEmotionNote({ date: today, note: trimmedIntroNote }));
    }

    const userId = user.id || getGuestUserId();
    if (userId) {
      syncEmotionLogApi(userId, { emotion: emotionValue, date: today, note: trimmedIntroNote || undefined }).catch((error) => {
        console.warn("Failed to sync intro emotion log", error);
      });
    }

    navigate("/beach", {
      state: {
        prefillEmotionId: emotionValue,
        source: "intro-mood",
        moodLabel: selectedMood.label,
        prefillNote: trimmedIntroNote,
      },
    });
  };

  const handleMoodSelect = (nextMood) => {
    const selectedOption = moodOptions.find((option) => option.key === nextMood);
    const nextEmotion = selectedOption?.emotionId || "ok";
    const today = todayLocalDate();

    setMood(nextMood);
    if (dialogueStep === 3) {
      setDialogueStep(4);
    }
    dispatch(setEmotion(nextEmotion));
    dispatch(
      addEmotionLog({
        emotion: nextEmotion,
        date: today,
      }),
    );

    const userId = user.id || getGuestUserId();
    if (userId) {
      syncEmotionLogApi(userId, { emotion: nextEmotion, date: today }).catch((error) => {
        console.warn("Failed to sync intro emotion log", error);
      });
    }
  };

  const handleAdvanceDialogue = () => {
    if (!canAdvanceDialogue || dialogueStep >= dialogueScenes.length - 1) return;
    setDialogueStep((current) => current + 1);
  };

  const handleRetreatDialogue = () => {
    if (!canGoBackDialogue) return;
    setDialogueStep((current) => Math.max(current - 1, 0));
  };

  return (
    <section className={`home-entry ${entering ? "home-entry--entering" : ""}`}>
      <img src={islandBg} alt="暖心島入口背景" className="home-entry__bg" />
      <div className="home-entry__veil" />

      <header className="home-entry__topbar">
        <div className="home-entry__brand">
          <span className="home-entry__brand-icon" aria-hidden="true">
            <img src={brandLogo} alt="" className="home-entry__brand-logo" />
          </span>
          <div className="home-entry__brand-copy">
            <span className="home-entry__brand-text">Warm Isle</span>
            <span className="home-entry__brand-subtitle">在情緒的海上，有座懂你的島</span>
          </div>
        </div>

        <div className="home-entry__controls" aria-label="入口控制">
          <button
            type="button"
            className={`home-entry__icon-button ${musicEnabled ? "is-active" : "is-inactive"}`}
            aria-label={musicEnabled ? "關閉背景音樂" : "開啟背景音樂"}
            aria-pressed={musicEnabled}
            onClick={() => setMusicEnabled((current) => !current)}
            title={musicEnabled ? "背景音樂已開啟" : "背景音樂已關閉"}
            data-hako-hover={musicEnabled ? "如果你想安靜一點，可以先把背景音樂關掉。" : "如果你想讓進島更有氣氛，可以把背景音樂打開。"}
            data-hako-click={musicEnabled ? "好，我先把背景音樂關掉。" : "好，我把背景音樂打開。"}
          >
            {musicEnabled ? <Music4 size={18} strokeWidth={2.2} aria-hidden="true" /> : <Music2 size={18} strokeWidth={2.2} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className={`home-entry__icon-button ${soundEnabled ? "is-active" : "is-inactive"}`}
            aria-label={soundEnabled ? "關閉音效" : "開啟音效"}
            aria-pressed={soundEnabled}
            onClick={() => setSoundEnabled((current) => !current)}
            title={soundEnabled ? "音效已開啟" : "音效已關閉"}
            data-hako-hover={soundEnabled ? "如果你不想被按鈕音效打擾，可以先關掉。" : "如果你想保留一點互動聲音，可以把音效打開。"}
            data-hako-click={soundEnabled ? "好，我先把音效關掉。" : "好，我把音效打開。"}
          >
            {soundEnabled ? <Volume2 size={18} strokeWidth={2.2} aria-hidden="true" /> : <VolumeX size={18} strokeWidth={2.2} aria-hidden="true" />}
          </button>
        </div>
      </header>

      <div className="home-entry__hero">
        <img src={hakoImageSrc} alt="哈可" className={`home-entry__haku home-entry__haku--${mood || "default"} ${dialogueStep === 0 ? "home-entry__haku--greeting" : ""}`} />
      </div>

      <div className={`entry-panel ${entering ? "entry-panel--fade" : ""}`}>
        <div className="entry-panel__identity">哈可（Hako）</div>

        <div className="entry-panel__content">
          <div className="entry-panel__copy">
            <p key={dialogueStep} className="entry-panel__line entry-panel__line--latest">
              {currentDialogueLine}
            </p>
          </div>

          <div className="entry-panel__actions">
            {dialogueStep === 2 && (
              <div className="entry-panel__name-row entry-panel__reveal-block">
                <input
                  ref={nameInputRef}
                  className="entry-panel__name-input"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && dialogueStep === 2 && hasName) {
                      handleAdvanceDialogue();
                    }
                  }}
                  placeholder="請輸入你的名字..."
                  aria-label="你的名字"
                  data-hako-hover="你可以先留下名字，這樣我之後就能好好稱呼你。"
                />
              </div>
            )}

            {showMoodStep && (
              <div className="entry-panel__flow-row entry-panel__reveal-block">
                <div className="entry-panel__moods-block">
                  <div className="entry-panel__moods entry-panel__moods--bare" aria-label="選擇現在的心情" role="tablist">
                    {moodOptions.map((option) => (
                      <button
                        key={option.key}
                        type="button"
                        className={`entry-panel__mood ${mood === option.key ? "is-active" : ""}`}
                        onClick={() => handleMoodSelect(option.key)}
                        aria-label={option.label}
                        aria-pressed={mood === option.key}
                        role="tab"
                        title={option.label}
                        data-hako-hover={`如果現在比較接近${option.label}，就先點這個。`}
                        data-hako-click={`好，我先接住你現在的${option.label}。`}
                      >
                        <span className="entry-panel__mood-icon" aria-hidden="true">
                          <img src={option.iconSrc} alt="" className="entry-panel__mood-icon-image" />
                        </span>
                        <span className="entry-panel__mood-label">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showJournalStep && (
              <div className="entry-panel__note-block entry-panel__reveal-block">
                <textarea
                  id="entry-note"
                  ref={introNoteRef}
                  className="entry-panel__note-input entry-panel__note-input--bare"
                  value={introNote}
                  onChange={(event) => setIntroNote(event.target.value)}
                  placeholder="例如：今天有點累，但想先讓自己慢下來。"
                  maxLength={100}
                  data-hako-hover="如果你想，這裡可以先留一句今天的心情；不寫也沒關係。"
                />
              </div>
            )}

          </div>
        </div>

        {(canGoBackDialogue || dialogueStep < dialogueScenes.length - 1) && (
          <div className="entry-panel__dialogue-controls entry-panel__dialogue-controls--dock">
            <div className="entry-panel__dialogue-slot entry-panel__dialogue-slot--left">
              <button
                type="button"
                className="entry-panel__dialogue-btn entry-panel__dialogue-btn--secondary"
                onClick={handleRetreatDialogue}
                disabled={!canGoBackDialogue}
                data-hako-hover="如果你想回頭再聽一次上一句，可以按這裡。"
                data-hako-click="好，我們退回上一句。"
              >
                上一句
              </button>
            </div>

            <div className="entry-panel__dialogue-slot entry-panel__dialogue-slot--center">
              <button
                type="button"
                className="entry-panel__guest-btn entry-panel__guest-btn--footer"
                onClick={handleBrowseFirst}
                data-hako-hover="如果你想先自己逛逛，也可以先當遊客進島。"
                data-hako-click="好，我先帶你以遊客身份進島看看。"
              >
                先當遊客看看
              </button>
            </div>

            <div className="entry-panel__dialogue-slot entry-panel__dialogue-slot--right">
              {showJournalStep && hasSelectedMood ? (
                <button
                  type="button"
                  className="entry-panel__dialogue-btn entry-panel__dialogue-btn--primary"
                  onClick={handleGoToEmotionBeach}
                  data-hako-hover="如果你準備好了，我就帶你去情緒沙灘，把今天的感受接續記下來。"
                  data-hako-click="好，我們一起去情緒沙灘。"
                >
                  去情緒沙灘
                </button>
              ) : (
                dialogueStep < dialogueScenes.length - 1 && dialogueStep !== 3 && (
                  <button
                    type="button"
                    className="entry-panel__dialogue-btn entry-panel__dialogue-btn--primary"
                    onClick={handleAdvanceDialogue}
                    disabled={!canAdvanceDialogue}
                    data-hako-hover="準備好就往下一句走，我會一段一段陪你。"
                    data-hako-click="好，我們繼續下一段。"
                  >
                    {nextDialogueLabel}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeEntryPage;