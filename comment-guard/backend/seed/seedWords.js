import mongoose from "mongoose";
import dotenv from "dotenv";
import { englishDataset } from "obscenity";
import OffensiveWord from "../models/OffensiveWord.js";

dotenv.config();

const curatedWords = [
  // ---- LOW: mild insults, name-calling, teasing ----
  { word: "idiot", severity: "low", category: "insult" },
  { word: "stupid", severity: "low", category: "insult" },
  { word: "loser", severity: "low", category: "insult" },
  { word: "dumb", severity: "low", category: "insult" },
  { word: "lame", severity: "low", category: "insult" },
  { word: "weirdo", severity: "low", category: "insult" },
  { word: "freak", severity: "low", category: "insult" },
  { word: "moron", severity: "low", category: "insult" },
  { word: "dork", severity: "low", category: "insult" },
  { word: "nerd", severity: "low", category: "insult" },
  { word: "clown", severity: "low", category: "insult" },
  { word: "clumsy", severity: "low", category: "insult" },
  { word: "annoying", severity: "low", category: "insult" },
  { word: "cringe", severity: "low", category: "insult" },
  { word: "gone mad", severity: "low", category: "insult" },
  { word: "crazy", severity: "low", category: "insult" },
  { word: "insane", severity: "low", category: "insult" },
  { word: "lunatic", severity: "low", category: "insult" },
  { word: "psycho", severity: "low", category: "insult" },
  { word: "trash", severity: "low", category: "insult" },
  { word: "garbage", severity: "low", category: "insult" },
  { word: "invisible", severity: "low", category: "exclusion" },
  { word: "pest", severity: "low", category: "insult" },
  { word: "show off", severity: "low", category: "insult" },
  { word: "attention seeker", severity: "low", category: "insult" },
  { word: "copycat", severity: "low", category: "insult" },
  { word: "baby", severity: "low", category: "insult" },
  { word: "crybaby", severity: "low", category: "insult" },
  { word: "wimp", severity: "low", category: "insult" },
  { word: "chicken", severity: "low", category: "insult" },
  { word: "teacher's pet", severity: "low", category: "academic" },
  { word: "wannabe", severity: "low", category: "insult" },
  { word: "poser", severity: "low", category: "insult" },
  { word: "try hard", severity: "low", category: "insult" },
  { word: "desperate", severity: "low", category: "insult" },
  { word: "clout chaser", severity: "low", category: "insult" },
  { word: "shame on you", severity: "low", category: "harassment" },
  { word: "cursed", severity: "low", category: "insult" },
  { word: "jinx", severity: "low", category: "insult" },
  { word: "bad omen", severity: "low", category: "insult" },
  { word: "unlucky charm", severity: "low", category: "insult" },
  { word: "black sheep", severity: "low", category: "exclusion" },
  { word: "special needs", severity: "low", category: "ability" },
  { word: "your mom", severity: "low", category: "family" },

  // ---- MEDIUM: appearance-shaming ----
  { word: "ugly", severity: "medium", category: "appearance" },
  { word: "fat", severity: "medium", category: "appearance" },
  { word: "disgusting", severity: "medium", category: "appearance" },
  { word: "gross", severity: "medium", category: "appearance" },
  { word: "hideous", severity: "medium", category: "appearance" },
  { word: "hideous freak", severity: "medium", category: "appearance" },
  { word: "fatty", severity: "medium", category: "appearance" },
  { word: "skinny freak", severity: "medium", category: "appearance" },
  { word: "four eyes", severity: "medium", category: "appearance" },
  { word: "pizza face", severity: "medium", category: "appearance" },
  { word: "hideous monster", severity: "medium", category: "appearance" },
  { word: "revolting", severity: "medium", category: "appearance" },
  { word: "repulsive", severity: "medium", category: "appearance" },

  // ---- MEDIUM: academic mockery ----
  { word: "failure", severity: "medium", category: "academic" },
  { word: "you'll never pass", severity: "medium", category: "academic" },
  { word: "dumbest in class", severity: "medium", category: "academic" },
  { word: "backbencher loser", severity: "medium", category: "academic" },
  { word: "you failed again", severity: "medium", category: "academic" },
  { word: "waste of a seat", severity: "medium", category: "academic" },

  // ---- MEDIUM: exclusion / social bullying ----
  { word: "hate", severity: "medium", category: "hostility" },
  { word: "worthless", severity: "medium", category: "harassment" },
  { word: "pathetic", severity: "medium", category: "harassment" },
  { word: "useless", severity: "medium", category: "harassment" },
  { word: "embarrassment", severity: "medium", category: "harassment" },
  { word: "nobody likes you", severity: "medium", category: "exclusion" },
  { word: "nobody wants you", severity: "medium", category: "exclusion" },
  { word: "no one cares about you", severity: "medium", category: "exclusion" },
  { word: "go away", severity: "medium", category: "exclusion" },
  { word: "get lost", severity: "medium", category: "exclusion" },
  { word: "shut up", severity: "medium", category: "hostility" },
  { word: "loner", severity: "medium", category: "exclusion" },
  { word: "outcast", severity: "medium", category: "exclusion" },
  { word: "reject", severity: "medium", category: "exclusion" },
  { word: "you don't belong", severity: "medium", category: "exclusion" },
  { word: "everyone hates you", severity: "medium", category: "exclusion" },
  { word: "unwanted", severity: "medium", category: "exclusion" },
  { word: "waste of space", severity: "medium", category: "harassment" },
  { word: "leave the group", severity: "medium", category: "exclusion" },
  { word: "don't sit with us", severity: "medium", category: "exclusion" },
  { word: "no one invited you", severity: "medium", category: "exclusion" },
  { word: "vile", severity: "medium", category: "hostility" },
  { word: "scum", severity: "medium", category: "insult" },
  { word: "filth", severity: "medium", category: "insult" },
  { word: "disgrace", severity: "medium", category: "harassment" },
  { word: "hopeless case", severity: "medium", category: "harassment" },
  { word: "toxic person", severity: "medium", category: "harassment" },
  { word: "parasite", severity: "medium", category: "insult" },
  { word: "leech", severity: "medium", category: "insult" },
  { word: "dead weight", severity: "medium", category: "harassment" },
  { word: "burden", severity: "medium", category: "harassment" },
  { word: "slow learner", severity: "medium", category: "ability" },
  { word: "can't do anything right", severity: "medium", category: "ability" },
  { word: "brain dead", severity: "medium", category: "ability" },
  { word: "your family is a joke", severity: "medium", category: "family" },
  { word: "broken family", severity: "medium", category: "family" },
  { word: "attention whore", severity: "medium", category: "insult" },
  { word: "spreading rumors about you", severity: "medium", category: "harassment" },
  { word: "everyone's talking about you", severity: "medium", category: "harassment" },
  { word: "posting your pics", severity: "medium", category: "harassment" },

  // ---- MEDIUM: online-harassment specific ----
  { word: "laughing at you", severity: "medium", category: "harassment" },
  { word: "making fun of you", severity: "medium", category: "harassment" },
  { word: "mocking", severity: "medium", category: "harassment" },
  { word: "humiliating", severity: "medium", category: "harassment" },
  { word: "everyone saw that", severity: "medium", category: "harassment" },
  { word: "screenshotting this", severity: "medium", category: "harassment" },
  { word: "sharing this everywhere", severity: "medium", category: "harassment" },
  { word: "you're cancelled", severity: "medium", category: "harassment" },
  { word: "exposing you", severity: "medium", category: "harassment" },
  { word: "posting this everywhere", severity: "medium", category: "harassment" },
  { word: "stalker", severity: "medium", category: "harassment" },
  { word: "creep", severity: "medium", category: "insult" },
  { word: "coward", severity: "medium", category: "insult" },
  { word: "fake friend", severity: "medium", category: "harassment" },
  { word: "two faced", severity: "medium", category: "harassment" },

  // ---- HIGH: threats, self-harm incitement, severe harassment ----
  { word: "kill yourself", severity: "high", category: "threat" },
  { word: "kys", severity: "high", category: "threat" },
  { word: "kill", severity: "high", category: "threat" },
  { word: "die", severity: "high", category: "threat" },
  { word: "hope you die", severity: "high", category: "threat" },
  { word: "end it", severity: "high", category: "threat" },
  { word: "end your life", severity: "high", category: "threat" },
  { word: "no one would miss you", severity: "high", category: "threat" },
  { word: "you should disappear", severity: "high", category: "threat" },
  { word: "better off dead", severity: "high", category: "threat" },
  { word: "i will hurt you", severity: "high", category: "threat" },
  { word: "i will kill you", severity: "high", category: "threat" },
  { word: "watch your back", severity: "high", category: "threat" },
  { word: "you deserve to suffer", severity: "high", category: "threat" },
  { word: "worthless piece of trash", severity: "high", category: "threat" },
  { word: "i'll beat you up", severity: "high", category: "threat" },
  { word: "meet me after school", severity: "high", category: "threat" },
  { word: "you'll regret this", severity: "high", category: "threat" },
  { word: "nobody would care if you were gone", severity: "high", category: "threat" },
  { word: "your parents don't love you", severity: "high", category: "family" },
  { word: "no wonder your parents left", severity: "high", category: "family" },
  { word: "retarded", severity: "high", category: "ability" },
  { word: "i know where you live", severity: "high", category: "threat" },
  { word: "i'll find you", severity: "high", category: "threat" },
  { word: "hacking your account", severity: "high", category: "harassment" },
  { word: "leaking your info", severity: "high", category: "harassment" },
  { word: "doxxing you", severity: "high", category: "harassment" },
  { word: "stealing your photos", severity: "high", category: "harassment" },
  { word: "waste of oxygen", severity: "high", category: "threat" },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await OffensiveWord.deleteMany();

    // Source 1: obscenity's maintained English dataset (profanity + slurs, properly curated)
    const obscenityWords = englishDataset.build().words ?? [];

    // Source 2: general bad-words list from a public moderation dataset
    const res = await fetch(
      "https://raw.githubusercontent.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en"
    );
    const text = await res.text();
    const baseWords = text
      .split("\n")
      .map((w) => w.trim().toLowerCase())
      .filter(Boolean);

    const curatedSet = new Set(curatedWords.map((w) => w.word));
    const combined = new Map();

    for (const w of baseWords) {
      if (!curatedSet.has(w)) {
        combined.set(w, { word: w, severity: "medium", category: "general" });
      }
    }

    for (const w of obscenityWords) {
      const clean = String(w).toLowerCase().trim();
      if (clean && !curatedSet.has(clean)) {
        combined.set(clean, { word: clean, severity: "high", category: "profanity" });
      }
    }

    const finalList = [...curatedWords, ...combined.values()];

    await OffensiveWord.insertMany(finalList, { ordered: false }).catch(() => {});
    console.log(`Seeded ${finalList.length} offensive words`);

    await mongoose.connection.close();
    process.exitCode = 0;
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  }
};

seed();