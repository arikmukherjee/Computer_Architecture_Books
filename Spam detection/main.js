
// Menu Navigation
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');

menuItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault(); // ⬅ IMPORTANT

    const targetSection = item.getAttribute('data-section');

    menuItems.forEach(m => m.classList.remove('active'));
    contentSections.forEach(s => s.classList.remove('active'));

    item.classList.add('active');
    document.getElementById(targetSection).classList.add('active');
  });
});


// Utility Functions
const spamKeywords = {
  urgent: ['urgent', 'act now', 'limited time', 'click here'],
  financial: ['claim', 'prize', 'winner', 'free money', 'deposit', 'transfer', 'inherit'],
  suspicious: ['verify account', 'update payment', 'confirm identity', 'unusual activity'],
  promotional: ['buy now', 'special offer', 'discount', 'shop now', 'deal']
};

const shortenedUrlPatterns = /^https?:\/\/(bit\.ly|tinyurl\.com|ow\.ly|short\.link|goo\.gl|rebrand\.ly)/i;
const suspiciousUrlPatterns = /(pay|bank|verify|confirm|amazon|ebay|paypal|stripe|wallet).*(?:confirm|verify|update|urgent)/i;

function analyzeText(text) {
  const lowerText = text.toLowerCase();
  let spamScore = 0;
  let foundKeywords = [];

  // Check for spam keywords
  for (const category in spamKeywords) {
    spamKeywords[category].forEach(keyword => {
      const count = (lowerText.match(new RegExp(keyword, 'gi')) || []).length;
      if (count > 0) {
        spamScore += count * 15;
        foundKeywords.push(keyword);
      }
    });
  }

  // Check for excessive links
  const linkCount = (text.match(/https?:\/\/[^\s]+/g) || []).length;
  if (linkCount > 3) spamScore += 20;

  // Check for all caps (excessive)
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.3) spamScore += 15;

  // Check for special characters (excessive)
  const specialChars = (text.match(/[!@#$%^&*]{2,}/g) || []).length;
  if (specialChars > 2) spamScore += 10;

  // Normalize score to 0-100
  spamScore = Math.min(100, spamScore);

  return {
    score: spamScore,
    keywords: [...new Set(foundKeywords)],
    isSpam: spamScore > 50
  };
}

function analyzeURL(url) {
  let score = 0;
  const indicators = {
    isShortened: false,
    hasSuspiciousPatterns: false
  };

  // Check if shortened URL
  if (shortenedUrlPatterns.test(url)) {
    indicators.isShortened = true;
    score += 30;
  }

  // Check for suspicious patterns
  if (suspiciousUrlPatterns.test(url)) {
    indicators.hasSuspiciousPatterns = true;
    score += 40;
  }

  // Check for mismatched protocols/domains
  if (url.includes('@')) {
    score += 25;
  }

  // Check domain reputation (simulated)
  const domain = url.split('/')[2];
  const knownMalicious = ['suspicious-site', 'phishing-domain', 'malware'];
  if (knownMalicious.some(m => domain.includes(m))) {
    score += 50;
  }

  score = Math.min(100, score);

  return {
    score: score,
    indicators: indicators,
    isSafe: score < 30,
    isSuspicious: score >= 30 && score < 70,
    isPhishing: score >= 70
  };
}

// Email Detection
window.detectEmailSpam = function() {
  const input = document.getElementById('email-input').value.trim();

  if (!input) {
    alert('Please enter email content');
    return;
  }

  const result = analyzeText(input);
  const resultCard = document.getElementById('email-result');
  const statusBadge = document.getElementById('email-status');
  const confidence = document.getElementById('email-confidence');
  const progress = document.getElementById('email-progress');
  const keywordsDiv = document.getElementById('email-keywords');

  // Set status
  statusBadge.textContent = result.isSpam ? '🚨 SPAM DETECTED' : '✅ NOT SPAM';
  statusBadge.className = `status-badge ${result.isSpam ? 'spam' : 'safe'}`;

  // Set confidence
  confidence.textContent = `${result.score.toFixed(1)}% spam probability`;

  // Set progress bar
  progress.style.width = `${result.score}%`;

  // Set keywords
  if (result.keywords.length > 0) {
    const keywordTags = result.keywords
      .slice(0, 8)
      .map(k => `<span class="keyword-tag">${k}</span>`)
      .join('');
    keywordsDiv.innerHTML = `<h4>Detected Spam Indicators:</h4>${keywordTags}`;
  } else {
    keywordsDiv.innerHTML = '';
  }

  resultCard.style.display = 'block';
};

window.resetEmailDetection = function() {
  document.getElementById('email-input').value = '';
  document.getElementById('email-result').style.display = 'none';
  updateEmailCharCount();
};

document.getElementById('email-input').addEventListener('input', function() {
  updateEmailCharCount();
});

function updateEmailCharCount() {
  const count = document.getElementById('email-input').value.length;
  document.getElementById('email-chars').textContent = count;
}

// SMS Detection
window.detectSMSSpam = function() {
  const input = document.getElementById('sms-input').value.trim();

  if (!input) {
    alert('Please enter a message');
    return;
  }

  const result = analyzeText(input);
  const resultCard = document.getElementById('sms-result');
  const statusBadge = document.getElementById('sms-status');
  const confidence = document.getElementById('sms-confidence');
  const progress = document.getElementById('sms-progress');

  // Set status
  statusBadge.textContent = result.isSpam ? '🚨 SPAM' : '✅ SAFE';
  statusBadge.className = `status-badge ${result.isSpam ? 'spam' : 'safe'}`;

  // Set confidence
  confidence.textContent = `${result.score.toFixed(1)}%`;

  // Set progress bar
  progress.style.width = `${result.score}%`;

  resultCard.style.display = 'block';
};

window.resetSMSDetection = function() {
  document.getElementById('sms-input').value = '';
  document.getElementById('sms-result').style.display = 'none';
  updateSMSCharCount();
};

document.getElementById('sms-input').addEventListener('input', function() {
  updateSMSCharCount();
});

function updateSMSCharCount() {
  const input = document.getElementById('sms-input');
  const count = input.value.length;
  const limit = 160;
  document.getElementById('sms-chars').textContent = count;

  if (count > limit) {
    input.style.borderColor = 'var(--danger-color)';
  } else {
    input.style.borderColor = 'var(--border-color)';
  }
}

// URL Detection
window.detectURLSpam = function() {
  const input = document.getElementById('url-input').value.trim();

  if (!input) {
    alert('Please enter a URL');
    return;
  }

  const result = analyzeURL(input);
  const resultCard = document.getElementById('url-result');
  const statusBadge = document.getElementById('url-status');
  const shortenedDiv = document.getElementById('url-shortened');
  const keywordsDiv = document.getElementById('url-keywords');
  const confidenceDiv = document.getElementById('url-confidence');

  // Set status
  let status, statusClass;
  if (result.isPhishing) {
    status = '⚠️ PHISHING RISK';
    statusClass = 'spam';
  } else if (result.isSuspicious) {
    status = '⚠️ SUSPICIOUS';
    statusClass = 'suspicious';
  } else {
    status = '✅ SAFE';
    statusClass = 'safe';
  }

  statusBadge.textContent = status;
  statusBadge.className = `status-badge ${statusClass}`;

  // Set indicators
  shortenedDiv.innerHTML = `
    <div class="indicator-title">Shortened URL</div>
    <div class="indicator-status">${result.indicators.isShortened ? '❌ Detected' : '✅ Not detected'}</div>
  `;

  keywordsDiv.innerHTML = `
    <div class="indicator-title">Suspicious Patterns</div>
    <div class="indicator-status">${result.indicators.hasSuspiciousPatterns ? '❌ Detected' : '✅ None detected'}</div>
  `;

  // Set confidence
  confidenceDiv.textContent = `${result.score.toFixed(1)}%`;

  resultCard.style.display = 'block';
};

window.resetURLDetection = function() {
  document.getElementById('url-input').value = '';
  document.getElementById('url-result').style.display = 'none';
};

// Content Detection
window.detectContentSpam = function() {
  const input = document.getElementById('content-input').value.trim();

  if (!input) {
    alert('Please enter content');
    return;
  }

  const result = analyzeText(input);
  const resultCard = document.getElementById('content-result');
  const statusBadge = document.getElementById('content-status');
  const confidence = document.getElementById('content-confidence');
  const progress = document.getElementById('content-progress');
  const explanation = document.getElementById('content-explanation');

  // Set status
  statusBadge.textContent = result.isSpam ? '⚠️ SPAM DETECTED' : '✅ LEGITIMATE';
  statusBadge.className = `status-badge ${result.isSpam ? 'spam' : 'safe'}`;

  // Set confidence
  confidence.textContent = `${result.score.toFixed(1)}% spam probability`;

  // Set credibility (inverse of spam)
  const credibility = 100 - result.score;
  progress.style.width = `${credibility}%`;

  // Set explanation
  if (result.isSpam) {
    explanation.innerHTML = `<strong>Analysis:</strong> Content shows signs of promotional or spam characteristics. Found ${result.keywords.length} spam indicators.`;
  } else {
    explanation.innerHTML = `<strong>Analysis:</strong> Content appears to be legitimate. Low spam indicators detected.`;
  }

  resultCard.style.display = 'block';
};

window.resetContentDetection = function() {
  document.getElementById('content-input').value = '';
  document.getElementById('content-result').style.display = 'none';
  updateContentWordCount();
};

document.getElementById('content-input').addEventListener('input', function() {
  updateContentWordCount();
});

function updateContentWordCount() {
  const text = document.getElementById('content-input').value;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  document.getElementById('content-words').textContent = words;
}

// Phone Detection
window.detectPhoneSpam = function() {
  const countryCode = document.getElementById('country-code').value;
  const phoneNumber = document.getElementById('phone-input').value.trim();

  if (!phoneNumber) {
    alert('Please enter a phone number');
    return;
  }

  // Validate phone number format
  if (!/^\d{7,15}$/.test(phoneNumber)) {
    alert('Please enter a valid phone number (7-15 digits)');
    return;
  }

  const fullNumber = `${countryCode} ${phoneNumber}`;
  const resultCard = document.getElementById('phone-result');
  const statusBadge = document.getElementById('phone-status');
  const riskDiv = document.getElementById('phone-risk');
  const reasonDiv = document.getElementById('phone-reason');

  // Simulate phone spam detection
  const random = Math.random();
  let status, statusClass, riskLevel, riskClass, reason;

  if (random < 0.3) {
    status = '🚨 SPAM';
    statusClass = 'spam';
    riskLevel = 'High';
    riskClass = 'high';
    reason = 'This number has been reported by multiple users as sending unsolicited messages and phishing attempts.';
  } else if (random < 0.6) {
    status = '⚠️ UNKNOWN';
    statusClass = 'suspicious';
    riskLevel = 'Medium';
    riskClass = 'medium';
    reason = 'Limited data available. This number may have some reported issues but not confirmed as spam.';
  } else {
    status = '✅ TRUSTED';
    statusClass = 'safe';
    riskLevel = 'Low';
    riskClass = 'low';
    reason = 'This number appears to be legitimate with no significant spam reports.';
  }

  statusBadge.textContent = status;
  statusBadge.className = `status-badge ${statusClass}`;

  riskDiv.textContent = riskLevel;
  riskDiv.className = `risk-level ${riskClass}`;

  reasonDiv.innerHTML = `<strong>Assessment:</strong> ${reason}`;

  resultCard.style.display = 'block';
};

window.resetPhoneDetection = function() {
  document.getElementById('phone-input').value = '';
  document.getElementById('phone-result').style.display = 'none';
};
