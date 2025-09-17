// Tournament Table JavaScript
// Loads data from tournament-data.json and populates the page

class TournamentTable {
  constructor() {
    this.data = null;
    this.init();
  }

  async init() {
    console.log("Tournament Table initializing...");
    try {
      console.log("Loading tournament data...");
      await this.loadTournamentData();
      console.log("Data loaded successfully:", this.data);

      console.log("Rendering overall standings...");
      this.renderOverallStandings();

      console.log("Rendering completed groups...");
      this.renderCompletedGroups();

      console.log("Rendering current group...");
      this.renderCurrentGroup();

      console.log("Tournament table initialization complete!");
    } catch (error) {
      console.error("Error loading tournament data:", error);
      this.showError("Failed to load tournament data. Please try again later.");
      // Add a fallback message to show the table is working
      this.showFallbackTable();
    }
  }

  showFallbackTable() {
    const tbody = document.querySelector("#overall-standings tbody");
    if (!tbody) return;

    tbody.innerHTML = `
      <tr class="standings-row">
        <td class="rank-cell">
          <span class="rank-number">1</span>
          <span class="rank-medal">🥇</span>
        </td>
        <td class="region-cell">
          <div class="region-info">
            <strong>Loading...</strong>
          </div>
        </td>
        <td class="score-cell">
          <strong class="score-value">-</strong>
        </td>
        <td class="battles-cell">- <small>battles</small></td>
        <td class="stats-cell">
          <small class="stats-breakdown">-</small>
        </td>
      </tr>
    `;
  }

  async loadTournamentData() {
    const response = await fetch("tournament-data.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    this.data = await response.json();
  }

  renderOverallStandings() {
    console.log("Rendering standings with data:", this.data);
    if (!this.data?.regions) {
      console.error("No regions data found");
      return;
    }

    const tbody = document.querySelector("#overall-standings tbody");
    if (!tbody) {
      console.error("Table body not found");
      return;
    }

    console.log("Found table body, clearing and populating...");
    tbody.innerHTML = "";

    // Sort regions by battle score (highest first)
    const sortedRegions = [...this.data.regions].sort(
      (a, b) => b.battleScore - a.battleScore
    );

    console.log("Sorted regions:", sortedRegions);

    sortedRegions.forEach((region, index) => {
      const row = this.createStandingsRow(region, index + 1);
      tbody.appendChild(row);
    });

    console.log("Standings rendered successfully");
  }

  createStandingsRow(region, rank) {
    const row = document.createElement("tr");
    row.className = "standings-row";

    // Rank cell with medal icons
    const rankCell = document.createElement("td");
    rankCell.className = "rank-cell";
    rankCell.innerHTML = `
      <span class="rank-number">${rank}</span>
      <span class="rank-medal">${this.getRankMedal(rank)}</span>
    `;

    // Region cell
    const regionCell = document.createElement("td");
    regionCell.className = "region-cell";
    regionCell.innerHTML = `
      <div class="region-info">
        <strong>${region.name}</strong>
      </div>
    `;

    // Battle Score cell
    const scoreCell = document.createElement("td");
    scoreCell.className = "score-cell";
    scoreCell.innerHTML = `<strong class="score-value">${region.battleScore}</strong>`;

    // Total Battles cell
    const battlesCell = document.createElement("td");
    battlesCell.className = "battles-cell";
    battlesCell.innerHTML = `${region.totalBattles} <small>battles</small>`;

    // Win Rate cell (optional - shows wins/2nds/3rds)
    const statsCell = document.createElement("td");
    statsCell.className = "stats-cell";
    statsCell.innerHTML = `
      <small class="stats-breakdown">
        ${region.wins > 0 ? `🏆${region.wins}` : ""}
        ${region.secondPlaces > 0 ? `🥈${region.secondPlaces}` : ""}
        ${region.thirdPlaces > 0 ? `🥉${region.thirdPlaces}` : ""}
      </small>
    `;

    row.appendChild(rankCell);
    row.appendChild(regionCell);
    row.appendChild(scoreCell);
    row.appendChild(battlesCell);
    row.appendChild(statsCell);

    return row;
  }

  getRankMedal(rank) {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "🏅";
    }
  }

  renderCompletedGroups() {
    if (!this.data?.completedGroups) return;

    const container = document.getElementById("groups-container");
    if (!container) return;

    container.innerHTML = "";

    this.data.completedGroups.forEach((group) => {
      const groupCard = this.createGroupCard(group);
      container.appendChild(groupCard);
    });
  }

  createGroupCard(group) {
    const card = document.createElement("div");
    card.className = "group-card completed";

    card.innerHTML = `
      <div class="group-header">
        <h3 class="group-name">${group.name}</h3>
        <span class="group-status completed">Completed</span>
      </div>
      <div class="group-results">
        <div class="group-placement">
          <span class="placement-medal">🥇</span>
          <span class="placement-region">${group.first}</span>
          <span class="placement-points">+5 pts</span>
        </div>
        <div class="group-placement">
          <span class="placement-medal">🥈</span>
          <span class="placement-region">${group.second}</span>
          <span class="placement-points">+3 pts</span>
        </div>
        <div class="group-placement">
          <span class="placement-medal">🥉</span>
          <span class="placement-region">${group.third}</span>
          <span class="placement-points">+1 pt</span>
        </div>
        <div class="group-date">
          <small>Completed ${this.formatDate(group.date)}</small>
        </div>
      </div>
    `;

    return card;
  }

  renderCurrentGroup() {
    if (!this.data?.currentGroup) return;

    const container = document.getElementById("current-group-container");
    if (!container) return;

    const { currentGroup } = this.data;

    const card = document.createElement("div");
    card.className = `group-card ${currentGroup.status}`;

    card.innerHTML = `
      <div class="group-header">
        <h3 class="group-name">${currentGroup.name}</h3>
        <span class="group-status ${currentGroup.status}">Active</span>
      </div>
      <div class="current-group-regions">
        ${currentGroup.regions
          .map(
            (region) => `
          <div class="current-region">
            <span class="region-name">${region}</span>
          </div>
        `
          )
          .join("")}
      </div>
      <div class="group-date">
        <small>Started ${this.formatDate(currentGroup.startDate)}</small>
      </div>
    `;

    container.innerHTML = "";
    container.appendChild(card);
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  showError(message) {
    // Create error message element
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-text">${message}</span>
      </div>
    `;

    // Insert at the top of main content
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.insertBefore(errorDiv, mainContent.firstChild);
    }
  }
}

// Initialize the tournament table when the page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded - Starting tournament table...");
  new TournamentTable();
});

// Also try to initialize after a short delay in case of timing issues
setTimeout(() => {
  console.log("Fallback initialization attempt...");
  if (!document.querySelector("#overall-standings tbody tr")) {
    console.log("No table rows found, reinitializing...");
    new TournamentTable();
  }
}, 1000);

// Export for potential use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = TournamentTable;
}
