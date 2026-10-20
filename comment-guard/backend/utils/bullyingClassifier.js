import natural from "natural";

const classifier = new natural.BayesClassifier();

// Training data: real sentence patterns, not just single words.
// The classifier learns from the STRUCTURE and CONTEXT of these examples,
// so it can catch similar-sounding bullying it's never seen verbatim.
const bullyingExamples = [
  "you are so stupid and worthless",
  "nobody likes you, just go away",
  "you should just disappear forever",
  "everyone thinks you're a joke",
  "you are ugly and nobody wants you here",
  "stop talking, you sound like an idiot",
  "you're such a loser, get a life",
  "i hope you fail at everything",
  "you don't belong with us, leave",
  "you're a waste of space and time",
  "why do you even try, you'll never be good enough",
  "everyone is laughing at how dumb you are",
  "you make me sick, get out of here",
  "no one would care if you were gone",
  "you're pathetic and everyone knows it",
  "shut up, no one wants to hear from you",
  "you're a coward and a fake friend",
  "kill yourself, nobody would miss you",
  "i'm going to hurt you if you show up again",
  "you deserve to suffer for being so annoying",
  "you're the dumbest person i have ever met",
  "everyone talks about how ugly you look",
  "stop being such an embarrassment to your family",
  "you'll never amount to anything in life",
  "go cry somewhere else, nobody cares",
];

const safeExamples = [
  "great job on your project, well done",
  "thanks for sharing this, really helpful",
  "i disagree with this point, but interesting take",
  "can you explain this a bit more please",
  "looking forward to the weekend",
  "this is a nice post, thanks for posting",
  "i had a good day today",
  "let's meet up for coffee sometime",
  "congratulations on your achievement",
  "i appreciate your help with this",
  "what time works for the meeting tomorrow",
  "this recipe looks delicious, i'll try it",
  "hope you feel better soon",
  "nice photo, where was this taken",
  "thanks for the birthday wishes everyone",
  "i think we should discuss this further",
  "good luck with your exam tomorrow",
  "that movie was really entertaining",
  "i learned a lot from this article",
  "happy to help whenever you need",
  "this is a really thoughtful comment",
  "excited for the new semester to start",
  "your presentation was very clear and informative",
  "i respectfully disagree, but good point",
  "let's collaborate on this project together",
];

bullyingExamples.forEach((text) => classifier.addDocument(text, "offensive"));
safeExamples.forEach((text) => classifier.addDocument(text, "safe"));

classifier.train(); // runs once, synchronously, at server startup — no internet involved

export const classifyWithML = (text) => {
  const classifications = classifier.getClassifications(text);
  // classifications is sorted by confidence, highest first
  const top = classifications[0];
  const offensiveScore = classifications.find((c) => c.label === "offensive")?.value ?? 0;

  return {
    label: top.label, // "offensive" | "safe"
    confidence: offensiveScore, // 0 to 1
  };
};