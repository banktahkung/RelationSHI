document.addEventListener("DOMContentLoaded", function () {
  const Container = document.getElementById("Container");

  Container.style.top = "0vh";

  A();
});

async function GetPopularity() {
  const response = await fetch("/popularity");
  const data = await response.json();

  return data.pop;
}

setInterval(async function () {
  await A();
}, 10000);

async function A() {
  const popularity = await GetPopularity();
  const Popularity = document.querySelector(".PopularityText");

  Popularity.innerHTML =
    " 🤝 ในขณะนี้มีคนอยากรู้จักคุณ : " + (popularity ? popularity : 0);
}
