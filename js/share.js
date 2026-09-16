(function() {
  'use strict';
  window.DecisionArcade = window.DecisionArcade || {};
  DecisionArcade.Share = {};

  DecisionArcade.Share.share = async function({title, text, url}) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        DecisionArcade.showToast('Shared successfully!');
      } catch (err) {
        if (err.name !== 'AbortError') {
          fallbackShare(url);
        }
      }
    } else {
      fallbackShare(url);
    }
  };

  function fallbackShare(url) {
    DecisionArcade.Share.copyToClipboard(url);
    DecisionArcade.showToast('Link copied to clipboard!');
  }

  DecisionArcade.Share.copyToClipboard = function(text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (error) {
        console.error('Copy fallback failed', error);
      }
      textArea.remove();
    }
  };

  DecisionArcade.Share.generateCard = function({question, verdict, tagline, category, mode}) {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0A0A0F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Accent glow circle
    const gradient = ctx.createRadialGradient(540, 675, 50, 540, 675, 600);
    gradient.addColorStop(0, 'rgba(124,92,255,0.3)');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Question
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Inter, sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, question || 'To be or not to be?', 540, 300, 800, 50);

    // Verdict
    ctx.fillStyle = '#7C5CFF';
    ctx.font = '900 120px Inter, sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, (verdict || '').toUpperCase(), 540, 675, 900, 130);

    // Tagline
    ctx.fillStyle = '#8A8A9A';
    ctx.font = '32px Inter, sans-serif';
    ctx.textAlign = 'center';
    wrapText(ctx, tagline || '', 540, 950, 800, 45);

    // Branding
    ctx.fillStyle = '#7C5CFF';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DECISION ARCADE', 540, 1250);

    return canvas.toDataURL('image/png');
  };

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    const words = text.split(' ');
    let line = '';
    let testY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        context.fillText(line, x, testY);
        line = words[n] + ' ';
        testY += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, testY);
  }

  DecisionArcade.Share.downloadCard = function(dataUrl, filename) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename || 'decision-arcade.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  DecisionArcade.Share.buildShareUrl = function({mode, question, result, optionA, optionB}) {
    const url = new URL(window.location.origin + window.location.pathname);
    if (mode) url.searchParams.set('mode', mode);
    if (question) url.searchParams.set('q', question);
    if (result) url.searchParams.set('r', result);
    if (optionA) url.searchParams.set('a', optionA);
    if (optionB) url.searchParams.set('b', optionB);
    return url.toString();
  };

})();
