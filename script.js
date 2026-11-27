const API_URL = "https://api.scryfall.com";

const randomButton = document.querySelector("#random-card");
const cardContainer = document.querySelector("#card-container");
const searchForm = document.querySelector("#search-form");
const cardSearch = document.querySelector("#card-search");
const setFilter = document.querySelector("#set-filter");
const colorFilter = document.querySelector("#color-filter");
const typeFilter = document.querySelector("#type-filter");
const rarityFilter = document.querySelector("#rarity-filter");
const sortFilter = document.querySelector("#sort-filter");
const directionFilter = document.querySelector("#direction-filter");
const resultCounter = document.querySelector("#result-counter");
const searchButton = searchForm.querySelector(`button[type="submit"]`);
const resetButton = document.querySelector("#reset-filters");
const manabuttons = document.querySelectorAll("[data-color]");
const clearColorsButton = document.querySelector("#clear-colors");
const selectedIdentity = document.querySelector("#selected-identity");

// mana colour data

let selectedColors = [];

const colorOrder = ["w", "u", "b", "r", "g"];

const colorNames = {
    w: "White",
    u: "Blue",
    b: "Black",
    r: "Red",
    g: "Green",
    c: "Colourless",
    m: "Any multicoloured"
};

// loading state

let isLoading = false;

// manage loading state

function setLoading(loading) {

    isLoading = loading;

    searchButton.disabled = loading;
    randomButton.disabled = loading;
    resetButton.disabled = loading;

    searchButton.textContent = loading
    ? "Loading..."
    : "Search";

cardContainer.setAttribute("aria-busy", loading);

}


// fetch random cards

async function getRandomCard() {

    if (isLoading) {
        return;
    }

    setLoading(true);

    resultCounter.textContent = "Loading random card...";

    try {

        const response = await fetch(`${API_URL}/cards/random`);

        if (!response.ok) {
            throw new Error("Could not retrieve card");
        }

        const card = await response.json();

        cardContainer.innerHTML = "";

        displayCard(card);

        resultCounter.textContent = "Showing 1 random card";

        console.log(card);

    } catch (error) {

        console.error(error);

        resultCounter.textContent = "Could not retrieve card.";

    } finally {

        setLoading(false);

    }

}

// search cards with pagination

async function searchCards(event) {

    event.preventDefault();

    if (isLoading) {
        return;
    }

    let searchQuery = cardSearch.value.trim();

    const selectedSet = setFilter.value;
    const selectedColor = colorFilter.value;
    const selectedType = typeFilter.value;
    const selectedRarity = rarityFilter.value;

    if (selectedSet) {
        searchQuery += ` set:${selectedSet}`;
    }

// apply colour identity filter

    if (selectedColor === "m") {

        searchQuery += " id: m";
    
    } else if (selectedColor === "c") {

        searchQuery += "id:c";

    } else if (selectedColor) {

        searchQuery += `id=${selectedColor}`;;
    }


    if (selectedType) {
        searchQuery += ` t:${selectedType}`;
    }

    if (selectedRarity) {
        searchQuery += ` r:${selectedRarity}`;
    }

    searchQuery = searchQuery.trim();

    if (!searchQuery) {
        return;
    }

    console.log("Search query:", searchQuery);

    const selectedSort = sortFilter.value;
    const selectedDirection = directionFilter.value;

    let nextPage = `${API_URL}/cards/search?q=${encodeURIComponent(searchQuery)}&order=${selectedSort}&dir=${selectedDirection}`;

    let pageCount = 0;
    const maxPages = 3;

    let loadedCards = 0;
    let totalCards = 0;

    cardContainer.innerHTML = "";
    resultCounter. textContent = "Loading cards...";

    setLoading(true);

    try {

        while (nextPage && pageCount < maxPages) {

            const response = await fetch(nextPage);

            if (response.status === 404) {
                cardContainer.textContent = "No cards found.";
                resultCounter.textContent = "0 cards found";
                return;
            }

            if (!response.ok) {
                throw new Error("Could not retrieve cards");
            }

            const result = await response.json();

            pageCount++;

            totalCards = result.total_cards;
            loadedCards += result.data.length;

            console.log(`Page ${pageCount} received`);
            console.log(result);

            result.data.forEach(card => {
                displayCard(card);
            });

            resultCounter.textContent =
            `Showing ${loadedCards} of ${totalCards} cards`;

            if (result.has_more) {
                nextPage = result.next_page;
            } else {
                nextPage = null;
            }

            if (nextPage && pageCount < maxPages) {
                await new Promise(resolve => setTimeout(resolve, 150));
            }
        }

        console.log(`Finished loading ${pageCount} page(s)`);

    } catch (error) {

        console.error(error);
        cardContainer.textContent = "Could not retrieve cards.";
        resultCounter.textContent = "Search failed";

    } finally {


        setLoading(false);

    }


}

// fetch magic expansions

async function getSets() {
    
    try {

        const response = await fetch (`${API_URL}/sets`);


        if (!response.ok) {
            throw new Error("Could not retrieve sets");
        }

        const result = await response.json();

        console.log(result);

        const sets = result.data.filter(set => {
            return !set.digital && set.card_count > 0;
        });

        sets.forEach(set => {

            const option = document.createElement("option");

            option.value = set.code;
            option.textContent = set.name;

            setFilter.appendChild(option);

        });

    } catch (error) {

        console.error(error);
    }

}

// reset search filters

function resetFilters() {
    
    cardContainer.innerHTML = "";

    resultCounter.textContent = "No search performed";

}

// event listener 

randomButton.addEventListener("click", getRandomCard);
searchForm.addEventListener("submit", searchCards);
searchForm.addEventListener("reset", resetFilters);

// display card

function displayCard(card) {
    
    const cardElement = document.createElement("article");
    
    cardElement.classList.add("mtg-card");
    
    cardElement.innerHTML = `
    <img src="${card.image_uris?.normal || card.card_faces?.[0]?.image_uris?.normal || ""}" 
    alt="${card.name}">
    
    <h3>${card.name}</h3>
    
    <p>Mana cost: ${card.mana_cost || "N/A"}</p>
    <p>Type: ${card.type_line}</p>
    <p>Rarity: ${card.rarity}</p>
    <p>Set: ${card.set_name}</p>
    <p>Price: ${card.prices.eur || "N/A"} EUR</p>
    
`;
    
    cardContainer.appendChild(cardElement);
    
}

// update mana selection

function updateManaSelection () {

    manabuttons.forEach(button => {

        const color = button.dataset.color;
        const isSelected = selectedColors.includes(color);

        button.classList.toggle("active", isSelected);

        button.setAttribute("aria-pressed", isSelected);
    });

    if (selectedColors.includes("c")) {

        colorFilter.value = "c";
    } else if (selectedColors.includes("m")) {

        colorFilter.value = "m";
    } else {

        colorFilter.value = colorOrder
        .filter(color => selectedColors.includes(color))
        .join("");
    }

    selectedIdentity.textContent = selectedColors.length
    ? selectedColors.map(color => colorNames[color]).join(" + ")
    : "All colours";

}


// handle mana button clicks

manabuttons.forEach(button => {

    button.addEventListener("click", () => {

        const color = button.dataset.color;

        if (isLoading) return;

        if (selectedColors.includes(color)) {

            selectedColors = selectedColors.filter(
                selected => selected !== color
            );
        } else if (color === "c" || color === "m") {

            selectedColors = [color];

        } else {

            selectedColors = selectedColors.filter(
                selected => selected !== "c" && selected !== "m"
            );

            selectedColors.push(color);
        }

        updateManaSelection();
    
    });
});

// clear selected mana colours

function resetManaSelection() {

    selectedColors = [];
    updateManaSelection();
}

clearColorsButton.addEventListener("click", () => {

    if (isLoading) return;

    resetManaSelection
});

// initial API requests

getSets();