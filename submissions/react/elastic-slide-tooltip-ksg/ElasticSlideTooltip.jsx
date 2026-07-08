import React, { useState, useRef, useId, useEffect, useCallback } from 'react';
import './style.css';

/**
 * ElasticSlideTooltip
 *
 * A React tooltip component that uses EaseMotion CSS utility classes for a
 * smooth elastic-slide entrance/exit animation. Designed for responsive
 * dashboard layouts — works on any trigger element.
 *
 * EaseMotion CSS classes used:
 *   ease-fade-in         — opacity fade entrance
 *   ease-slide-up        — slide from below (bottom placement)
 *   ease-slide-down      — slide from above (top placement)
 *   ease-slide-in-left   — slide from left  (right placement)
 *   ease-slide-in-right  — slide from right (left placement)
 *   ease-shadow-lg       — layered shadow token
 *
 * @param {object}  props
 * @param {React.ReactNode} props.children        — The trigger element
 * @param {string}  props.content                 — Tooltip text or JSX
 * @param {'top'|'bottom'|'left'|'right'} [props.placement='top'] — Preferred placement
 * @param {'dark'|'light'|'primary'|'success'|'danger'|'warning'} [props.variant='dark'] — Color variant
 * @param {number}  [props.delayShow=120]         — ms before tooltip appears
 * @param {number}  [props.delayHide=80]          — ms before tooltip disappears
 * @param {number}  [props.offset=10]             — px gap between trigger and tooltip
 * @param {boolean} [props.disabled=false]        — Disable tooltip entirely
 * @param {string}  [props.className='']          — Extra classes on the trigger wrapper
 * @param {string}  [props.maxWidth='220px']      — Max width of the tooltip bubble
 */
export default function ElasticSlideTooltip({
  children,
  content,
  placement = 'top',
  variant = 'dark',
  delayShow = 120,
  delayHide = 80,
  offset = 10,
  disabled = false,
  className = '',
  maxWidth = '220px',
}) {
  const [visible, setVisible] = useState(false);
  const [animClass, setAnimClass] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimer = useRef(null);
  const hideTimer = useRef(null);

  // Unique ID for aria-describedby
  const tooltipId = useId();

  // Map placement → EaseMotion entrance animation class
  const ENTRANCE_CLASS = {
    top:    'ease-slide-up',
    bottom: 'ease-slide-down',
    left:   'ease-slide-in-right',
    right:  'ease-slide-in-left',
  };

  /** Calculate pixel position of the tooltip bubble */
  const calcPosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const trig = triggerRef.current.getBoundingClientRect();
    const tip  = tooltipRef.current.getBoundingClientRect();
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top  = trig.top  + scrollY - tip.height - offset;
        left = trig.left + scrollX + trig.width / 2 - tip.width / 2;
        break;
      case 'bottom':
        top  = trig.bottom + scrollY + offset;
        left = trig.left   + scrollX + trig.width / 2 - tip.width / 2;
        break;
      case 'left':
        top  = trig.top  + scrollY + trig.height / 2 - tip.height / 2;
        left = trig.left + scrollX - tip.width - offset;
        break;
      case 'right':
        top  = trig.top   + scrollY + trig.height / 2 - tip.height / 2;
        left = trig.right + scrollX + offset;
        break;
      default:
        break;
    }

    setCoords({ top, left });
  }, [placement, offset]);

  const show = useCallback(() => {
    if (disabled) return;
    clearTimeout(hideTimer.current);
    showTimer.current = setTimeout(() => {
      setAnimClass(ENTRANCE_CLASS[placement] ?? 'ease-fade-in');
      setVisible(true);
      // Re-calculate after the tooltip is in the DOM
      requestAnimationFrame(calcPosition);
    }, delayShow);
  }, [disabled, placement, delayShow, calcPosition, ENTRANCE_CLASS]);

  const hide = useCallback(() => {
    clearTimeout(showTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setAnimClass('');
    }, delayHide);
  }, [delayHide]);

  // Recalculate on window resize
  useEffect(() => {
    if (!visible) return;
    const handler = () => requestAnimationFrame(calcPosition);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [visible, calcPosition]);

  // Cleanup on unmount
  useEffect(() => () => {
    clearTimeout(showTimer.current);
    clearTimeout(hideTimer.current);
  }, []);

  // Dismiss on Escape
  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => { if (e.key === 'Escape') hide(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [visible, hide]);

  return (
    <>
      {/* ── Trigger wrapper ─────────────────────────────────── */}
      <span
        ref={triggerRef}
        className={`elastic-tooltip-trigger ${className}`.trim()}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={visible ? tooltipId : undefined}
      >
        {children}
      </span>

      {/* ── Tooltip bubble (portalled via fixed position) ───── */}
      {visible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={[
            'elastic-tooltip-bubble',
            `elastic-tooltip--${variant}`,
            `elastic-tooltip--${placement}`,
            'ease-fade-in',          // EaseMotion: opacity fade
            animClass,               // EaseMotion: directional slide
            'ease-shadow-lg',        // EaseMotion: shadow token
          ].join(' ')}
          style={{
            position: 'fixed',
            top: coords.top,
            left: coords.left,
            maxWidth,
            zIndex: 9999,
          }}
          onMouseEnter={show}
          onMouseLeave={hide}
        >
          {/* Arrow */}
          <span
            className={`elastic-tooltip-arrow elastic-tooltip-arrow--${placement}`}
            aria-hidden="true"
          />
          {/* Content */}
          <span className="elastic-tooltip-content">{content}</span>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Dashboard demo — shows the tooltip in context
   ───────────────────────────────────────────────────────────── */

/**
 * DashboardTooltipDemo
 *
 * A self-contained responsive dashboard card grid that demonstrates
 * ElasticSlideTooltip across all placements and variants.
 * Import and render this component to see the full demo.
 */
export function DashboardTooltipDemo() {
  const metrics = [
    {
      label: 'Total Revenue',
      value: '$48,295',
      delta: '+12.4%',
      positive: true,
      icon: '💰',
      tip: 'Revenue earned this month, net of refunds and chargebacks.',
      placement: 'top',
      variant: 'dark',
    },
    {
      label: 'Active Users',
      value: '3,842',
      delta: '+5.1%',
      positive: true,
      icon: '👥',
      tip: 'Unique sessions in the last 30 days. Excludes bots and crawlers.',
      placement: 'bottom',
      variant: 'primary',
    },
    {
      label: 'Bounce Rate',
      value: '38.7%',
      delta: '-2.3%',
      positive: true,
      icon: '📉',
      tip: 'Percentage of visitors who leave after viewing only one page.',
      placement: 'top',
      variant: 'success',
    },
    {
      label: 'Open Incidents',
      value: '7',
      delta: '+3',
      positive: false,
      icon: '🚨',
      tip: 'Critical alerts requiring immediate attention from on-call engineers.',
      placement: 'top',
      variant: 'danger',
    },
    {
      label: 'Avg Response',
      value: '142ms',
      delta: '+18ms',
      positive: false,
      icon: '⚡',
      tip: 'Mean API response time across all endpoints in the last hour.',
      placement: 'right',
      variant: 'warning',
    },
    {
      label: 'Deployments',
      value: '24',
      delta: '↑ today',
      positive: true,
      icon: '🚀',
      tip: 'Successful production deployments this week via CI/CD pipeline.',
      placement: 'left',
      variant: 'dark',
    },
  ];

  return (
    <div className="dash-shell">
      <header className="dash-header">
        <h1 className="ease-fade-in">Dashboard</h1>
        <p className="ease-fade-in ease-delay-100">
          Hover or focus any metric card to see the ElasticSlide tooltip.
        </p>
      </header>

      <main className="dash-main">
        <div className="dash-grid">
          {metrics.map((m, i) => (
            <article
              key={m.label}
              className={`dash-card ease-fade-in ease-hover-lift-shadow ease-delay-${(i + 1) * 100}`}
            >
              <div className="dash-card-top">
                <span className="dash-icon" aria-hidden="true">{m.icon}</span>
                {/* Info button triggers the tooltip */}
                <ElasticSlideTooltip
                  content={m.tip}
                  placement={m.placement}
                  variant={m.variant}
                >
                  <button
                    className="dash-info-btn ease-hover-grow"
                    aria-label={`Info: ${m.label}`}
                    type="button"
                  >
                    ℹ
                  </button>
                </ElasticSlideTooltip>
              </div>

              <p className="dash-card-label">{m.label}</p>

              <div className="dash-card-value-row">
                <span className="dash-card-value">{m.value}</span>
                <span className={`dash-delta ${m.positive ? 'delta-up' : 'delta-down'}`}>
                  {m.delta}
                </span>
              </div>

              {/* Hover the metric value itself for a bottom tooltip */}
              <ElasticSlideTooltip
                content={`Compared to last month: ${m.value}`}
                placement="bottom"
                variant="dark"
                maxWidth="180px"
              >
                <div className="dash-sparkbar" role="img" aria-label="Sparkline">
                  {[40, 65, 50, 80, 55, 90, 70].map((h, j) => (
                    <span
                      key={j}
                      className="dash-bar"
                      style={{ height: `${h}%`, opacity: m.positive ? 1 : 0.6 }}
                    />
                  ))}
                </div>
              </ElasticSlideTooltip>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
