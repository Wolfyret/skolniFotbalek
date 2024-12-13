// Funkce pro načtení CSV souboru
function loadCSV(file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => callback(data))
        .catch(error => console.error("Chyba při načítání souboru:", error));
}

// Funkce pro převod CSV na pole objektů
function parseCSV(csv) {
    const rows = csv.split("\n");
    const headers = rows[0].split(",");
    const players = [];

    console.log("CSV obsah:", rows); // Ladící výstup pro zjištění, co načítáme

    // Zpracování řádků CSV souboru
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();  // Odstraní přebytečné bílé znaky
        if (row) {  // Zkontroluje, že řádek není prázdný
            const values = row.split(",");
            if (values.length === headers.length) {
                const player = {};
                for (let j = 0; j < headers.length; j++) {
                    // Odstraníme mezery z názvů sloupců (např. "elo " na "elo")
                    const header = headers[j].trim();  
                    console.log(`Zpracovávám: ${header} = ${values[j]}`);
                    
                    // Pokud je sloupec "elo", převedeme hodnotu na číslo
                    if (header === "elo") {
                        const eloValue = parseFloat(values[j].trim());  // Převod na číslo
                        if (isNaN(eloValue)) {
                            console.error(`Chyba při převodu ELO pro ${values[j]}`);
                        } else {
                            player[header] = eloValue;  // Uložíme číselnou hodnotu
                        }
                    } else {
                        player[header] = values[j].trim();  // Uložíme ostatní hodnoty jako string
                    }
                }
                players.push(player);
            }
        }
    }
    return players;
}

// Funkce pro načtení souboru ref.txt
function loadRefereeClasses(file, callback) {
    fetch(file)
        .then(response => response.text())
        .then(data => callback(data))
        .catch(error => console.error("Chyba při načítání souboru:", error));
}

// Funkce pro zpracování souboru ref.txt
function parseRefereeClasses(data) {
    const refereeClasses = {};
    const lines = data.split("\n");

    lines.forEach(line => {
        const [id, refereeClass] = line.split(";");
        if (id && refereeClass) {
            refereeClasses[id.trim()] = refereeClass.trim();
        }
    });

    return refereeClasses;
}

// Funkce pro přiřazení třídy rozhodčího k hráčům
function assignRefereeClasses(players, refereeClasses) {
    players.forEach(player => {
        const refereeClass = refereeClasses[player.id];
        if (refereeClass) {
            player.refereeClass = refereeClass;  // Přiřazení třídy rozhodčího hráči
        }
    });
}

// Funkce pro zobrazení leaderboardu
function displayLeaderboard(players) {
    const tableBody = document.querySelector("#leaderboard tbody");
    players.sort((a, b) => b.elo - a.elo); // Seřadíme hráče podle ELO

    players.forEach((player, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td><a href="?id=${player.id}" onclick="showProfile(${player.id}); return false;">${player.nick}</a></td>
            <td>${parseFloat(player.elo).toFixed(2)}</td>
            <td>${player.id}</td> <!-- Zobrazení ID -->
            <td>${player.refereeClass || "---"}</td> <!-- Zobrazení třídy rozhodčího -->
        `;
        tableBody.appendChild(row);
    });
}

// Funkce pro zobrazení profilu hráče
function showProfile(playerId) {
    const player = players.find(p => p.id == playerId);
    if (player) {
        document.getElementById("profileName").innerText = player.nick;
        document.getElementById("profileId").innerText = player.id;
        document.getElementById("profileElo").innerText = player.elo;
        
        // Místo placeholderu pro zápasy přidáme odkaz na stránku se zápasy hráče
        document.getElementById("profileMatches").innerHTML = `<a href="zapasy.html?id=${player.id}">Zobrazit zápasy</a>`;
        
        document.getElementById("profileRefereeClass").innerText = player.refereeClass || "---"; // Zobrazení třídy rozhodčího
        document.getElementById("profileModal").style.display = "block";

        // Změna URL, aby ukazovala na tento profil
        window.history.pushState(null, "", "?id=" + player.id);
    }
}


// Funkce pro zavření modálního okna
function closeProfile() {
    document.getElementById("profileModal").style.display = "none";
    // Pokud je modální okno zavřeno, odstraníme parametr id z URL
    window.history.pushState(null, "", window.location.pathname);
}

document.querySelector(".close").addEventListener("click", closeProfile);

// Načteme a zobrazení dat při načtení stránky
let players = [];
let refereeClasses = {};

window.onload = function () {
    loadCSV("lok.csv", function (csv) {
        players = parseCSV(csv); // Načteme hráče z CSV
        loadRefereeClasses("ref.txt", function (data) {
            refereeClasses = parseRefereeClasses(data); // Načteme třídy rozhodčích z ref.txt
            assignRefereeClasses(players, refereeClasses); // Přiřadíme třídy rozhodčích k hráčům
            displayLeaderboard(players); // Zobrazíme leaderboard
        });
    });
};
