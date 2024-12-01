<script>
import { initializeApp } from "firebase/app"; 
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore"; 

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAGhrpV-0CNFj2g6T6oAH1B_DGfR5c1csw",
  authDomain: "phoenixtournamentbracket-4adaf.firebaseapp.com",
  projectId: "phoenixtournamentbracket-4adaf",
  storageBucket: "phoenixtournamentbracket-4adaf.firebasestorage.app",
  messagingSenderId: "511635020978",
  appId: "1:511635020978:web:53b196b58f163bcc50bdab"
};

// Initialize Firebase
initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore();

export default {
  data() {
    return {
      totalPlayers: 10, 
      playersPerTeam: 2,
      rounds: [], 
      savedRounds: [], 
      bracketId: null, 
    };
  },
  computed: {
    totalTeams() {
      return Math.floor(this.totalPlayers / this.playersPerTeam);
    },
    totalRounds() {
      return Math.ceil(Math.log2(this.totalTeams)); 
    },
  },
  watch: {
    totalPlayers: "generateBracket",
    playersPerTeam: "generateBracket",
  },
  mounted() {
    this.generateBracket();
    this.loadSavedBracket(); 
  },
  methods: {
    generateBracket() {
  if (this.playersPerTeam < 1 || this.totalPlayers < 1) {
    alert("Players and teams must be greater than 0!");
    return;
  }

  const totalTeams = this.totalTeams;
  const totalRounds = this.totalRounds;

  const rounds = [];
  let matchCount = Math.floor(totalTeams / 2); // Initial match count based on number of teams

  // Generate teams
  const teams = Array.from({ length: totalTeams }, (_, i) => `Team ${i + 1}`);

  // Generate rounds
  for (let round = 0; round < totalRounds; round++) {
    const currentRound = {
      roundNumber: round + 1, // Add a field for the round number
      matches: [] // Flatten the matches into an array
    };

    if (round === 0) {
      // First round: Pair teams
      for (let match = 0; match < matchCount; match++) {
        const team1 = teams.shift();
        const team2 = teams.shift();
        currentRound.matches.push({ match: [team1, team2] });
      }
    } else {
      // Subsequent rounds: Winners advance
      for (let match = 0; match < matchCount; match++) {
        currentRound.matches.push({
          match: [`Winner ${round}-${match * 2 + 1}`, `Winner ${round}-${match * 2 + 2}`]
        });
      }
    }

    rounds.push(currentRound); // Add the round to the rounds array
    matchCount = Math.ceil(matchCount / 2); // Halve the match count for each subsequent round
  }

  this.rounds = rounds; // Store the flattened structure
},

saveBracket() {
  // Flatten the rounds data before saving
  const flattenedRounds = this.rounds.map(round => {
    return {
      roundNumber: round.roundNumber, // Keep the round number
      matches: round.matches.map(match => ({
        match: match.match.map(team => team || 'TBD') // Replace empty teams with 'TBD' if needed
      }))
    };
  });

  const bracketData = {
    totalPlayers: this.totalPlayers, // Save total players
    playersPerTeam: this.playersPerTeam, // Save players per team
    rounds: flattenedRounds, // Use the flattened rounds
    createdAt: serverTimestamp(), // Use the modular SDK method
  };

  if (this.bracketId) {
    // Update existing bracket if already saved
    updateDoc(doc(db, 'brackets', this.bracketId), bracketData)
      .then(() => {
        alert("Bracket updated!");
      })
      .catch(error => {
        console.error("Error updating bracket: ", error);
        alert("Error saving bracket.");
      });
  } else {
    // Create new bracket if no ID exists
    addDoc(collection(db, 'brackets'), bracketData)
      .then(docRef => {
        this.bracketId = docRef.id; // Store the ID of the saved bracket
        alert("Bracket saved!");
      })
      .catch(error => {
        console.error("Error saving bracket: ", error);
        alert("Error saving bracket.");
      });
  }
},
resetDatabase() {
  if (this.bracketId) {
    // Delete the bracket document from Firestore
    deleteDoc(doc(db, 'brackets', this.bracketId))
      .then(() => {
        this.rounds = [];
        this.totalPlayers = 10; // Reset to initial state
        this.playersPerTeam = 2; // Reset to initial state
        this.bracketId = null;
        alert("Database reset!");
      })
      .catch(error => {
        console.error("Error deleting bracket: ", error);
        alert("Error resetting database.");
      });
  } else {
    alert("No data to delete.");
  }
},
    loadSavedBracket() {
      getDocs(collection(db, "brackets"))
        .then(querySnapshot => {
          if (!querySnapshot.empty) {
            const savedData = querySnapshot.docs[0].data();
            this.rounds = savedData.rounds;
            this.bracketId = querySnapshot.docs[0].id;
          }
        })
        .catch(error => {
          console.error("Error loading bracket: ", error);
          alert("Error loading bracket.");
        });
    },
    resetBracket() {
      this.rounds = [];
      this.generateBracket();
      alert("Bracket reset!");
    },
  },
};
</script>

<template>
  <section class="bg-white dark:bg-gray-900 height-screen">
    <div class="py-8 px-4 mx-auto max-w-screen-xl text-center">
      <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
        Phoenix Tournament Bracket
      </h1>

      <!-- Inputs for total players and players per team -->
      <div class="mb-8">
        <label for="totalPlayers" class="text-lg font-semibold dark:text-gray-200">Total Players:</label>
        <input
          type="number"
          id="totalPlayers"
          v-model.number="totalPlayers"
          min="1"
          class="ml-4 p-2 border rounded w-20 text-center"
        />
        <label for="playersPerTeam" class="ml-8 text-lg font-semibold dark:text-gray-200">Players per Team:</label>
        <input
          type="number"
          id="playersPerTeam"
          v-model.number="playersPerTeam"
          min="1"
          class="ml-4 p-2 border rounded w-20 text-center"
        />
      </div>

      <!-- Bracket display -->
      <div class="contests mx-5 my-5">
        <div class="h-auto rounded-lg bg-gray-200">
          <div class="p-4">
            <div v-for="(round, roundIndex) in rounds" :key="roundIndex" class="flex flex-col items-center mb-8">
              <div class="text-2xl font-bold mb-4">Round {{ round.roundNumber }}</div>
              <div class="flex flex-wrap justify-center">
                <!-- Loop through the matches in the round -->
                <div v-for="(match, matchIndex) in round.matches" :key="matchIndex" class="m-2 p-4 border rounded">
                  <div v-for="(team, teamIndex) in match.match" :key="teamIndex" class="mb-2">
                    <input
                      type="text"
                      v-model="rounds[roundIndex].matches[matchIndex].match[teamIndex]"
                      class="border p-2 rounded"
                      :placeholder="team || 'TBD'"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save and Reset Buttons -->
      <div class="mt-8">
        <button @click="saveBracket" class="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">Save Bracket</button>
        <button @click="resetBracket" class="ml-4 px-6 py-2 bg-red-500 text-white rounded hover:bg-red-700">Reset Bracket</button>
      </div>
    </div>
  </section>
</template>


<style></style>
