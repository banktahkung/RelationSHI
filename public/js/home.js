let currentBouncingCard = null;
let currentSelectingCard = null;

let a = false;

const SpecialTag = {
  Transgender: "🏳️‍🌈",
  Smoker: "🚬",
  Alcoholic: "🍺",
};

window.onload = function () {
  const Header = document.getElementById("Header");

  Header.style.transition = "margin-top 1s ease-in-out";
  Header.style.marginTop = "0vh";
};

// DomContentLoaded event
document.addEventListener("DOMContentLoaded", function () {
  const warningContent = document.getElementById("WarningContent");

  // Function to check the orientation
  function checkOrientation() {
    if (window.innerWidth > window.innerHeight) {
      // Landscape mode
      warningContent.style.display = "flex";
    } else {
      // Portrait mode
      warningContent.style.display = "none";
    }
  }

  // Initial check
  checkOrientation();

  // Check on resize
  window.addEventListener("resize", checkOrientation);
});

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
  card.style.left = "calc(50% - 28vw - 15px)";
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
      currentSelectingCard.style.left = "100vw";
      currentSelectingCard.classList.add("AlreadySelected");
      currentSelectingCard = null;
      document.querySelectorAll(".Indicator").forEach((indicator) => {
        indicator.style.opacity = 0.8;

        if (indicator.classList.contains("bottom")) {
          indicator.style.opacity = 1;
        }
      });
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

    // Indicate the card information with following card numbers
    // - 0 : name card
    // - 1 / 2 / 3 : picture card
    switch (i) {
      case 0:
        informationCard.innerHTML = "<div class='InformationContainer'> </div>";
        informationCard.classList.add("basicInfo");
        break;
      case 1:
        informationCard.classList.add("basicInfo2");
        break;
      case 2:
        informationCard.classList.add("imageFirst");
        break;
      case 3:
        informationCard.classList.add("imageSecond");
        break;
    }

    informationCard.style.backgroundColor = "#fff";
    informationCard.style.transition = "background-color 1s ease-in-out";
    informationCard.style.zIndex = 21 + 4 - i;
  }

  document.querySelector(".CardContainer").appendChild(PileOfCard);

  CardBuilding();

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

        const acceptArea = document.getElementById("cardAcceptArea");
        const rejectArea = document.getElementById("cardRejectArea");
        // Swipe up
        if (moveY < -300) {
          acceptArea.style.top = "-50vw";
          acceptArea.style.backgroundColor = "#45e68d";

          if (moveY < -600)
            acceptArea.style.backgroundColor = "rgba(3, 204, 3, 0.5)";
        } else if (moveY > 200) {
          rejectArea.style.bottom = "-50vw";
          rejectArea.style.backgroundColor = "#ff6687";

          if (moveY > 400)
            rejectArea.style.backgroundColor = "rgba(143, 1, 1, 0.5)";
        } else {
          acceptArea.style.top = "-100vw";
          rejectArea.style.bottom = "-100vw";
        }
      }
    });

    card.addEventListener("touchend", async () => {
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
        } else if (moveY <= -600 && !AlreadySelect) {
          card.style.transform = "translate(0px, -100vh) rotate(0)";
          card.style.transition = "transform 1.2s ease-in-out";

          AlreadySelect = true;

          card.classList.add("accepted");

          Finalize();
        } else if (moveY >= 400 && !AlreadySelect) {
          card.style.transform = "translate(0px, 100vh) rotate(0)";
          card.style.transition = "transform 1.2s ease-in-out";

          AlreadySelect = true;
          await Decline();

          if (a) ending();
          else goBack();
        } else {
          card.style.transition = "transform 0.3s ease, opacity 0.3s";
          card.style.transform = `translate(0, 0) rotate(0)`;

          startX, startY, moveX, (moveY = null);
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

// * Function to build the card
async function CardBuilding() {
  try {
    // Wait for the information to be resolved
    const information = await GetPerson();

    // Safely check the length of the imagePath
    const numberOfImage = information.ImagePath?.length || 0;

    // Get the card elements
    const Card = document.querySelectorAll(".InformationCard");

    function BuildingSpecialTag(card) {
      const specialTag = information.SpecialTag;

      // Loop through the special tag
      Object.keys(specialTag).forEach((key, index) => {
        const specialTagDiv = document.createElement("div");

        if (specialTag[key] == true) {
          specialTagDiv.classList.add("specialTag", key);
          specialTagDiv.textContent = SpecialTag[key];

          if (key == "Transgender") {
            specialTagDiv.style.backgroundColor = "rgb(255,255,255 ,0)";
            specialTagDiv.style.border = "1px solid #000";
          }

          card.querySelector(".SpecialTag").appendChild(specialTagDiv);
        }
      });
    }

    Card.forEach((card, index) => {
      if (index === 0) {
        // Style the basic information
        card.innerHTML = `
          <div class="info-card" style="height: 100%; position: relative; opacity: 0; transition: opacity 1s ease-in-out">
            <div class="Nickname">${information.Nickname}</div>
            <div class="Age">อายุ : ${information.Age} ปี</div>
            <div class="Height">ส่วนสูง : ${information.Height} ซม.</div>
            <div class="Program">ภาค : ${information.Program}</div>
            <div class="Description"> เกี่ยวกับฉัน : ${information.Description}</div>
          </div>
          <div class="SpecialTag">
          </div>
        `;

        BuildingSpecialTag(card);

        // Target `.info` within the current card and update opacity
        const infoDiv = document.querySelector(".info-card");
        const specialTagDiv = document.querySelector(".SpecialTag");

        if (infoDiv) {
          setTimeout(() => {
            infoDiv.style.opacity = 1;
            specialTagDiv.style.opacity = 1;
          }, 1000);
        }

        return;
      } else if (index === 1) {
        card.innerHTML = `
          <div class="info-card-2" style="height: 100%; position: relative; opacity: 1;">
            <div class="HobbiesHeader" style="width: 100%; text-align: center; display: flex;"> ความสนใจ (งานอดิเรก) : </div>
            <div class="Hobbies">${
              information.Hobbies == null
                ? "- ไม่มีงานอดิเรกที่ทำเป็นพิเศษ -"
                : information.Hobbies
            }</div>
          </div>
          <div class="SpecialTag" style="opacity: 1">
          </div>
        `;

        BuildingSpecialTag(card);
      }

      if (index > numberOfImage + 1) {
        return;
      }

      if (index > 1) {
        // Style the image card
        card.innerHTML = `
        <img src="/${
          information.ImagePath[index - 2]
            ? information.ImagePath[index - 2]
            : "logo.png"
        }" alt="Avatar" class="ProfileImage">
      `;
      }
    });
  } catch (error) {
    console.error("Error building card:", error);
  }
}

async function Confirmation() {
  try {
    const response = await fetch("/confirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ confirmation: true }),
    });
  } catch (error) {
    console.error("Error saving", error);
  }
}

// * Go to cutscene
async function Finalize() {
  // Making the card drop effect
  const PileOfCard = document.getElementById("PileOfCard");
  const Cards = document.querySelectorAll(".InformationCard");

  const acceptArea = document.getElementById("cardAcceptArea");

  await Confirmation();

  acceptArea.style.top = "-100vw";

  let drop = 0;

  Cards.forEach((card, index) => {
    if (!card.classList.contains("accepted")) {
      setTimeout(() => {
        card.style.transition = "transform 1s ease-in-out";
        card.style.transform = `translate(0px, 100vh) rotate(45deg)`;
      }, 100 * (index - drop));

      return;
    }

    drop++;
  });

  const Header = document.querySelector(".Header");

  setTimeout(() => {
    Header.style.transition = "transform 1s ease-in-out";
    Header.style.transform = `translate(0px, 150vh) rotate(45deg)`;

    document.querySelectorAll(".Indicator").forEach((indicator) => {
      indicator.style.opacity = 0;
    });
  }, 400);

  setTimeout(() => {
    PileOfCard.style.opacity = 0;
    PileOfCard.style.zIndex = -1;
    PileOfCard.style.transition = "opacity 1s ease-in-out";
  }, 1000);

  setTimeout(() => {
    window.location.href = "/result";
  }, 3000);
}

// * Go back to selecting card section
function goBack() {
  const PileOfCard = document.getElementById("PileOfCard");
  const cards = document.querySelectorAll(".InformationCard");

  const acceptArea = document.getElementById("cardRejectArea");

  acceptArea.style.bottom = "-100vh";

  let drop = 0;

  cards.forEach((card, index) => {
    if (!card.classList.contains("accepted")) {
      setTimeout(() => {
        card.style.transition = "transform 1s ease-in-out";
        card.style.transform = `translate(0px, 100vh) rotate(45deg)`;
      }, 100 * (index - drop));

      return;
    }

    drop++;
  });

  (currentBouncingCard = null), (currentSelectingCard = null);

  const Cards = document.querySelectorAll(".Card");

  const prevent = document.querySelector(".prevent");

  prevent.style.display = "none";

  Cards.forEach((card) => {
    if (card.classList.contains("AlreadySelected")) return;

    if (card.classList.contains("First"))
      card.style.left = "calc(50% - 31.5vw - 60px)";
    else if (card.classList.contains("Second"))
      card.style.left = "calc(50% - 10.5vw - 20px)";
    else card.style.left = "calc(50% + 10.5vw + 20px)";
  });

  document.querySelectorAll(".Indicator").forEach((indicator) => {
    indicator.style.opacity = 0;
  });

  // Remove the PileOfcard and InformationCard
  setTimeout(() => {
    PileOfCard.innerHTML = "";

    PileOfCard.remove();
  }, 2500);
}

// Get the person
async function GetPerson() {
  const location = "/person";

  try {
    const response = await fetch(location, {
      method: "GET",
    });

    if (response.status == 400) {
      ending();
    }

    // Await the JSON parsing
    const data = await response.json();

    a = data.lastPerson;

    return data.person; // Return the data
  } catch (error) {
    console.error("Error fetching test person:", error);
  }
}

function ending() {
  // Making the card drop effect
  const PileOfCard = document.getElementById("PileOfCard");
  const Cards = document.querySelectorAll(".InformationCard");

  let drop = 0;

  Cards?.forEach((card, index) => {
    if (!card.classList.contains("accepted")) {
      setTimeout(() => {
        card.style.transition = "transform 1s ease-in-out";
        card.style.transform = `translate(0px, 100vh) rotate(45deg)`;
      }, 100 * (index - drop));

      return;
    }

    drop++;
  });

  const Header = document.querySelector(".Header");

  setTimeout(() => {
    Header.style.transition = "transform 1s ease-in-out";
    Header.style.transform = `translate(0px, 150vh) rotate(45deg)`;

    document.querySelectorAll(".Indicator").forEach((indicator) => {
      indicator.style.opacity = 0;
    });
  }, 400);

  setTimeout(() => {
    if (PileOfCard) {
      PileOfCard.style.opacity = 0;
      PileOfCard.style.zIndex = -1;
      PileOfCard.style.transition = "opacity 1s ease-in-out";
    }
  }, 1000);

  setTimeout(() => {
    window.location.href = "/unexpected";
  }, 2000);
}

async function Decline() {
  const destination = "/decline";

  try {
    const response = await fetch(destination, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ decline: true }),
    });
  } catch (error) {
    console.error("Error declining", error);
  }
}
