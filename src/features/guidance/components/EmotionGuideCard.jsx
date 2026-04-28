import useGuideNavigation from "@/features/guidance/useGuideNavigation";

function EmotionGuideCard({
  guide,
  title,
  compact = false,
  interactive = true,
  source = "guide-card",
}) {
  const goWithGuide = useGuideNavigation(source);

  if (!guide) return null;

  const handleNavigate = (action) => {
    if (!interactive || !action?.to) return;

    goWithGuide({ action, guide });
  };

  const ActionTag = interactive ? "button" : "div";

  return (
    <section className={`emotion-guide-card${compact ? " emotion-guide-card--compact" : ""}`} aria-label="哈可引導建議">
      <div className="emotion-guide-card__header">
        <div>
          <p className="emotion-guide-card__eyebrow">引導系統</p>
          <h3>{title || guide.title}</h3>
        </div>
        <span className={`emotion-guide-card__state emotion-guide-card__state--${guide.state}`}>
          {guide.badgeLabel}
        </span>
      </div>

      <p className="emotion-guide-card__lead">{guide.message}</p>
      <p className="emotion-guide-card__companion">哈可：{guide.companionLine}</p>

      <div className="emotion-guide-card__actions">
        <ActionTag
          type={interactive ? "button" : undefined}
          className="emotion-guide-card__action emotion-guide-card__action--primary"
          onClick={interactive ? () => handleNavigate(guide.primaryAction) : undefined}
        >
          <strong>{guide.primaryAction.label}</strong>
          <span>{guide.primaryAction.description}</span>
        </ActionTag>

        {guide.secondaryAction && (
          <ActionTag
            type={interactive ? "button" : undefined}
            className="emotion-guide-card__action emotion-guide-card__action--secondary"
            onClick={interactive ? () => handleNavigate(guide.secondaryAction) : undefined}
          >
            <strong>{guide.secondaryAction.label}</strong>
            <span>{guide.secondaryAction.description}</span>
          </ActionTag>
        )}
      </div>
    </section>
  );
}

export default EmotionGuideCard;