const API_URL = "https://api.scryfall.com";

const randomButton = document.querySelector("#random-card");
const cardContainer = document.querySelector("#card-container");
const searchForm = document.querySelector("#search-form");
const cardSearch = document.querySelector("#card-search");
const setFilter = document.querySelector("#set-filter");
const colorFilter = document.querySelector("#color-filter");
const typeFilter = document.querySelector("#type-filter");
const rarityFilter = document.querySelector("#rarity-filter");


// fetch random cards

async function getRandomCard () {
    
    try {
        
        const response = await fetch (`${API_URL}/cards/random`);
        
        if (!response.ok) {
            throw new Error("Could not retrieve card");
        }
        
        const card = await response.json()

        cardContainer.innerHTML = "";
        
        displayCard(card);
        
        console.log(card);
        
        
    } catch (error) {
        
        console.error(error);
    }
    
}

// search cards with pagination

async function searchCards(event) {

    event.preventDefault();

    let searchQuery = cardSearch.value.trim();

    const selectedSet = setFilter.value;
    const selectedColor = colorFilter.value;
    const selectedType = typeFilter.value;
    const selectedRarity = rarityFilter.value;

    if (selectedSet) {
        searchQuery += ` set:${selectedSet}`;
    }

    if (selectedColor) {
        searchQuery += ` id=${selectedColor}`;
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

    let nextPage = `${API_URL}/cards/search?q=${encodeURIComponent(searchQuery)}`;

    let pageCount = 0;
    const maxPages = 3;

    cardContainer.innerHTML = "";

    try {

        while (nextPage && pageCount < maxPages) {

            const response = await fetch(nextPage);

            if (response.status === 404) {
                cardContainer.textContent = "No cards found.";
                return;
            }

            if (!response.ok) {
                throw new Error("Could not retrieve cards");
            }

            const result = await response.json();

            pageCount++;

            console.log(`Page ${pageCount} received`);
            console.log(result);

            result.data.forEach(card => {
                displayCard(card);
            });

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

// event listener 

randomButton.addEventListener("click", getRandomCard);
searchForm.addEventListener("submit", searchCards);

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

// initial API requests

getSets();