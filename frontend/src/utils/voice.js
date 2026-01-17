let currentUtterance = null;

function getBestVoice(lang) {
  const voices = window.speechSynthesis.getVoices();

  // Tamil male preference
  if (lang === "ta-IN") {
    const tamilMale = voices.find(v =>
      v.lang === "ta-IN" &&
      /male|google|microsoft/i.test(v.name)
    );
    if (tamilMale) return tamilMale;

    // Any Tamil voice fallback
    const tamilAny = voices.find(v => v.lang === "ta-IN");
    if (tamilAny) return tamilAny;
  }

  // English male preference
  const englishMale = voices.find(v =>
    v.lang.startsWith("en") &&
    /male|google|microsoft|alex|david/i.test(v.name)
  );
  if (englishMale) return englishMale;

  // Absolute fallback
  return voices.find(v => v.lang.startsWith("en")) || voices[0];
}

function preprocessText(text, lang) {
  if (lang === "ta-IN") {
    return text; // Tamil already flows well
  }

  // English pacing improvements
  return text
    .replace(/\. /g, ". ... ")
    .replace(/\? /g, "? ... ")
    .replace(/! /g, "! ... ");
}

export function speakText(text, lang = "en-IN") {
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(
    preprocessText(text, lang)
  );

  utterance.voice = getBestVoice(lang);
  utterance.lang = lang;

  // Male tuning
  utterance.rate = lang === "ta-IN" ? 0.85 : 0.9;
  utterance.pitch = 0.8;
  utterance.volume = 1;

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  window.speechSynthesis.cancel();
}
