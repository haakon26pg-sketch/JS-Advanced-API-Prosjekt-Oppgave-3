const API_URL = "https://api.scryfall.com";

const randomButton = document.querySelector("#random-card");
const cardContainer = document.querySelector("#card-container");
const searchForm = document.querySelector("#search-form");
const cardSearch = document.querySelector("#search-form");


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

// search cards

async function searchCards(event) {

    event.preventDefault();

    const searchQuery = cardSearch.value.trim();
}

// event listener 

randomButton.addEventListener("click", getRandomCard);

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