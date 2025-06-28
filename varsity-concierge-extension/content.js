// Placeholder for content script logic 

window.addEventListener('load', () => {
  setTimeout(() => {
    // Prevent multiple injections
    if (document.getElementById('concierge-cta-button') || document.getElementById('learning-concierge-iframe')) {
      return;
    }

    // Create the CTA button
    const ctaButton = document.createElement('button');
    ctaButton.id = 'concierge-cta-button';
    ctaButton.textContent = 'Build Your Free Learning Plan';

    // Button click handler
    ctaButton.addEventListener('click', () => {
      if (document.getElementById('learning-concierge-iframe')) return;
      // Create the iframe
      const iframe = document.createElement('iframe');
      iframe.id = 'learning-concierge-iframe';
      iframe.src = chrome.runtime.getURL('chatbot.html');
      document.body.appendChild(iframe);
      ctaButton.style.display = 'none';
    });

    document.body.appendChild(ctaButton);

  }, 3000);
}); 