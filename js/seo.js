(function() {
  'use strict';
  window.DecisionArcade = window.DecisionArcade || {};
  DecisionArcade.SEO = {};

  DecisionArcade.SEO.injectWebApp = function(config) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    const data = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": config.name,
      "url": config.url,
      "description": config.description,
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Any",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
      "browserRequirements": "Requires JavaScript"
    };
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  };

  DecisionArcade.SEO.injectFAQ = function(items) {
    if (!items || items.length === 0) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    const data = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": items.map(i => ({
        "@type": "Question",
        "name": i.q,
        "acceptedAnswer": { "@type": "Answer", "text": i.a }
      }))
    };
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  };

})();
