const randomButton = document.querySelector("#random-card");
const cardContainer = document.querySelector("#card-container");

// fetch random cards

async function getRandomCard () {

    try {

        const response = await fetch (`$(API_URL)/cards/random`);

        if (!response.ok) {
            throw new Error("Could not retrieve card");
        }

        const card = await response.json()

        console.log(card);

    } catch (error) {

        console.error(error);
    }

}

// event listener 

randomButton.addEventListener("click", getRandomCard);