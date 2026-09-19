// Content script injected directly into government pages
(function() {
  if (window.govSahayakInjected) return;
  window.govSahayakInjected = true;

  // Create floating widget button
  const button = document.createElement('div');
  button.id = 'govsahayak-floating-btn';
  button.innerHTML = `
    <div style="position: fixed; bottom: 24px; right: 24px; z-index: 999999; background: linear-gradient(135deg, #f59e0b, #ea580c); color: #0f172a; padding: 12px 18px; rounded-radius: 9999px; border-radius: 30px; font-family: system-ui, sans-serif; font-weight: 800; font-size: 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.4); cursor: pointer; display: flex; align-items: center; gap: 8px; border: 2px solid #fbbf24; transition: all 0.2s ease;">
      <span style="font-size: 18px;">🇮🇳</span>
      <span>GovSahayak Assistant</span>
    </div>
  `;

  document.body.appendChild(button);

  button.addEventListener('click', () => {
    // Send message to extension background/popup or extract text directly
    alert('GovSahayak Assistant activated for this government page!\n\nReading page context & simplifying instructions...');
  });
})();
