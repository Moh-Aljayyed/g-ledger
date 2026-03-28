"use client";

import { useEffect } from "react";

export function AntiCopy() {
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection via CSS
    document.body.style.userSelect = "none";
    document.body.style.webkitUserSelect = "none";

    // Disable keyboard shortcuts (Ctrl+U, Ctrl+S, Ctrl+Shift+I, F12)
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (view source)
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        return false;
      }
      // Ctrl+S (save page)
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I (devtools)
      if (e.ctrlKey && e.shiftKey && e.key === "I") {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J (console)
      if (e.ctrlKey && e.shiftKey && e.key === "J") {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+C (inspect element)
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable print screen detection
    const handleBeforePrint = () => {
      document.body.style.display = "none";
    };
    const handleAfterPrint = () => {
      document.body.style.display = "";
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("copy", handleCopy);
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);

    // DevTools detection — redirect or warn
    const devtoolsCheck = setInterval(() => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        // DevTools likely open — show warning
        console.clear();
        console.log(
          "%c\u26a0\ufe0f \u062a\u062d\u0630\u064a\u0631 \u0623\u0645\u0646\u064a",
          "color: red; font-size: 30px; font-weight: bold;"
        );
        console.log(
          "%c\u0647\u0630\u0627 \u0627\u0644\u0646\u0638\u0627\u0645 \u0645\u062d\u0645\u064a. \u0623\u064a \u0645\u062d\u0627\u0648\u0644\u0629 \u0644\u0644\u0646\u0633\u062e \u0623\u0648 \u0627\u0644\u0627\u062e\u062a\u0631\u0627\u0642 \u0645\u062e\u0627\u0644\u0641\u0629 \u0642\u0627\u0646\u0648\u0646\u064a\u0629.",
          "color: red; font-size: 16px;"
        );
      }
    }, 1000);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("copy", handleCopy);
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
      clearInterval(devtoolsCheck);
    };
  }, []);

  return null;
}
