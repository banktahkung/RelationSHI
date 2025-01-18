let currentBouncingCard = null;
let currentSelectingCard = null;

document.addEventListener("DOMContentLoaded", () => {
  const cardContainer = document.querySelector(".CardContainer");

  const indicator = { 1: "First", 2: "Second", 3: "Third" };

  for (let i = 0; i < 3; i++) {
    const rowContainer = document.createElement("div");

    // Add the row container to the card container
    rowContainer.classList.add(indicator[i + 1]);
    rowContainer.classList.add("RowContainer");

    for (let j = 0; j < 3; j++) {
      const card = document.createElement("div");
      const frontCard = document.createElement("div");
      const backCard = document.createElement("div");
      const ImageCover = document.createElement("img");

      frontCard.classList.add("front");
      backCard.classList.add("back");

      card.appendChild(frontCard);
      card.appendChild(backCard);
      frontCard.appendChild(ImageCover);

      // When the user touch the card, the card will bounce
      card.addEventListener("touchstart", () => {
        if (!card.classList.contains("selecting")) {
          bounceCard(card);
        } else if (!card.classList.contains("flipped")) {
          selectCard(card);
        }
      });

      ImageCover.src = "images/shirt_design_contest.png";
      ImageCover.alt = "Avatar";
      ImageCover.classList.add("CardImage");

      card.id = `${i}-${j}`;
      card.classList.add(indicator[j + 1]);
      card.classList.add("Card");

      rowContainer.appendChild(card);
    }

    cardContainer.appendChild(rowContainer);
  }

   CardUsage();
});

// function to bounce the card if the card has been clicked
function bounceCard(card) {
  // Stop the current bouncing card
  if (currentBouncingCard) {
    currentBouncingCard.classList.remove("bouncing");
  }

  // If the clicked card is already bouncing, stop it
  if (currentBouncingCard === card) {
    currentBouncingCard.classList.remove("bouncing");
    currentBouncingCard = null;

    const PreventWindow = document.querySelector(".prevent");

    PreventWindow.style.display = "block";
    setTimeout(() => {
      selectCard(card);
    }, 10);

    return;
  }

  // Start bouncing the clicked card
  card.classList.add("bouncing");
  currentBouncingCard = card;
}

// function to select the card if the card has been clicked
function selectCard(card) {
  card.style.zIndex = 100;

  // Start selecting the clicked card
  card.classList.add("selecting");

  // Set the position of each card
  const cardClassList = card.id.split("-").map((x) => parseInt(x));

  // Set top
  switch (cardClassList[0]) {
    case 0:
      card.style.top = "5vh";
      break;
    case 1:
      card.style.top = "-12.5vh";
      break;
    case 2:
      card.style.top = "-27.5vh";
      break;
  }

  // Set left
  card.style.left = "calc(50% - 28vw - 10px)";
  currentSelectingCard = card;

  TransitionToNextPage();
}

function TransitionToNextPage() {
  const Cards = document.querySelectorAll(".Card");

  Cards.forEach((card) => {
    if (card != currentSelectingCard) card.style.left = "-70vw";
  });

  currentSelectingCard.addEventListener("touchstart", (e) => {
    e.preventDefault();
    currentSelectingCard.classList.add("flipped");

    setTimeout(() => {
      currentSelectingCard.style.opacity = 0;
      currentSelectingCard.style.zIndex = 0;
      currentSelectingCard = null;
      BuildPileOfCard();
    }, 1000);
  });
}

// Building a pile of card
function BuildPileOfCard() {
  const PileOfCard = document.createElement("div");
  PileOfCard.classList.add("PileOfCard");
  PileOfCard.id = "PileOfCard";

  // Set the position of the pile of card
  let startX,
    startY,
    moveX,
    moveY,
    currentCard = 0;

  for (let i = 0; i < 4; i++) {
    const informationCard = document.createElement("div");
    informationCard.classList.add("InformationCard");

    PileOfCard.appendChild(informationCard);

    informationCard.style.backgroundColor = randomColor();
    informationCard.style.zIndex = 21 + 4 - i;
  }

  function randomColor(){
    // Using hex value
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  }

  document.querySelector(".CardContainer").appendChild(PileOfCard);

  CardUsage();
}

// * Function to use the card
function CardUsage() {
  const container = document.getElementById("PileOfCard");
  const cards = document.querySelectorAll(".InformationCard");

  let AlreadySelect = false;

  let startX,
    startY,
    moveX,
    moveY,
    currentCard = 0;

  cards.forEach((card, index) => {
    card.addEventListener("touchstart", (e) => {
      e.preventDefault();

      

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    });

    card.addEventListener("touchmove", (e) => {
      if (!AlreadySelect) {
        moveX = e.touches[0].clientX - startX;
        moveY = e.touches[0].clientY - startY;

        // Applying the transform for the curved effect
        card.style.transform = `translate(${moveX}px, ${moveY}px) rotate(${
          moveX / 50
        }deg)`;
      }
    });

    card.addEventListener("touchend", () => {
      if (!AlreadySelect) {
        if (Math.abs(moveX) > 120) {
          card.style.transition =
            "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)";
          card.style.transform = `translate(${
            moveX > 0 ? `90vw` : `-90vw`
          }, ${moveY}px) rotate(${moveX / 50}deg)`;

          setTimeout(() => {
            card.style.transform = "translate(0, 0) rotate(0)";
            container.appendChild(card); // Move the card to the bottom
            resetZIndices();
          }, 500);
        } else if (moveY <= -180 && !AlreadySelect) {
          card.style.transform = "translate(0px, -70vh) rotate(0)";
          card.style.transition = "transform 1.2s ease-in-out";

          AlreadySelect = true;

        } else {
          card.style.transition = "transform 0.3s ease, opacity 0.3s";
          card.style.transform = `translate(0, 0) rotate(0)`;

          startX, startY, moveX, moveY = null;
          card.style.transition = "transform 0s ease";
        }
      }
    });

    if (currentCard == index) {
      card.style.zIndex = 21 + cards.length;
    }
  });

  function resetZIndices() {
    const updatedCards = document.querySelectorAll(".InformationCard");
    updatedCards.forEach((card, index) => {
      card.style.zIndex = 21 + updatedCards.length - index;
    });
  }

  resetZIndices();
}

// Get the person
function GetPerson() {
  fetch("/person")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    });
}
