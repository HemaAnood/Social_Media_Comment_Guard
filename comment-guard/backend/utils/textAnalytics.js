import OffensiveWord from "../models/OffensiveWord.js";
import { classifyWithML } from "./bullyingClassifier.js";

const severityRank = { none: 0, low: 1, medium: 2, high: 3 };

// Common bullying leetspeak substitutions — bullies often dodge filters this way
const leetMap = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s" };

const normalizeLeet = (text) => {
  return text.replace(/[013457@$]/g, (ch) => leetMap[ch] ?? ch);
};

// Strips common suffixes so "stupidly", "uglier", "idiots" still match their root word
const stripSuffix = (word) => {
  return word.replace(/(ing|edly|ies|ier|iest|ed|es|er|ly|s)$/i, "");
};

export const analyzeComment = async (text) => {
  // 1. Text Preprocessing: lowercase, normalize leetspeak, strip punctuation
  let cleanText = text.toLowerCase();
  cleanText = normalizeLeet(cleanText);
  cleanText = cleanText.replace(/[^\w\s]/g, "");

  const tokens = cleanText.split(/\s+/).filter(Boolean);
  const stemmedTokens = tokens.map(stripSuffix);

  // 2. Keyword Detection: check against the OffensiveWord dictionary
  const offensiveWords = await OffensiveWord.find();
  const detected = new Set();
  let worstSeverity = "none";

  for (const entry of offensiveWords) {
    const phrase = entry.word.toLowerCase();
    let isMatch = false;

    if (phrase.includes(" ")) {
      // Multi-word phrase: match against full text with word boundaries
      const pattern = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`);
      isMatch = pattern.test(cleanText);
    } else {
      // Single word: match exact token OR stemmed token (catches suffixes/plurals)
      isMatch = tokens.includes(phrase) || stemmedTokens.includes(stripSuffix(phrase));
    }

    if (isMatch) {
      detected.add(phrase);
      if (severityRank[entry.severity] > severityRank[worstSeverity]) {
        worstSeverity = entry.severity;
      }
    }
  }

  // 3. ML pattern detection: catches bullying PHRASING even without an exact keyword match
  const ml = classifyWithML(text);
  const mlFlagged = ml.label === "offensive" && ml.confidence > 0.6;

  if (mlFlagged) {
    const mlSeverity = ml.confidence > 0.85 ? "high" : ml.confidence > 0.7 ? "medium" : "low";
    if (severityRank[mlSeverity] > severityRank[worstSeverity]) {
      worstSeverity = mlSeverity;
    }
  }

  // 4. Severity Analysis + Comment Classification (combines both signals)
  const detectedWords = [...detected];
  const classification = detectedWords.length > 0 || mlFlagged ? "offensive" : "safe";

  return {
    classification,          // "safe" | "offensive"
    severity: worstSeverity, // "none" | "low" | "medium" | "high"
    detectedWords: mlFlagged && detectedWords.length === 0 ? ["[pattern detected]"] : detectedWords,
  };
};