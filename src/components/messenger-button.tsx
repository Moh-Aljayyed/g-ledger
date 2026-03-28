"use client";

export function MessengerButton() {
  return (
    <a
      href="https://m.me/1043966828805970"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-2xl"
      style={{ background: "linear-gradient(135deg, #00B2FF, #006AFF)" }}
      title="تواصل معنا عبر ماسنجر"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
        <path d="M12 2C6.36 2 2 6.13 2 11.7c0 2.91 1.2 5.42 3.15 7.2.16.15.26.36.27.58l.05 1.82c.02.56.6.93 1.11.71l2.04-.84c.18-.07.38-.09.57-.05.89.23 1.83.35 2.81.35 5.64 0 10-4.13 10-9.7S17.64 2 12 2zm5.89 7.54l-2.88 4.57a1.5 1.5 0 01-2.17.44l-2.29-1.72a.6.6 0 00-.72 0l-3.09 2.34c-.41.31-.95-.19-.67-.63l2.88-4.57a1.5 1.5 0 012.17-.44l2.29 1.72a.6.6 0 00.72 0l3.09-2.34c.41-.31.95.19.67.63z"/>
      </svg>
    </a>
  );
}
