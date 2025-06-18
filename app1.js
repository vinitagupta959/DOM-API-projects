const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const modelSelect = document.getElementById("modelSelect");
const countSelect = document.getElementById("countSelect");
const radioSelect = document.getElementById("ratioSelect");
const gridGallerly = document.querySelector(".gallery-grid");

// import api key
const API_TOKEN ="";
console.log(API_TOKEN);






const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A dragon sleeping on gold coins in a crystal cave",
  "An underwater kingdom with merpeople and glowing coral buildings",
  "A floating island with waterfalls pouring into clouds below",
  "A witch's cottage in fall with magic herbs in the garden",
  "A robot painting in a sunny studio with art supplies around it",
  "A magical library with floating glowing books and spiral staircases",
  "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
];






// save in local storage theme
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemTheme);
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon"

}
// function for dark and light theame
function toggleTheme() {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";

};
// function for fill prompt input with example
function randomExample() {
  const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = prompt;
  promptInput.focus();
}
function handleFormSubmit(e) {
  e.preventDefault();
  const selectedModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = radioSelect.value || "1/1";
  const promptText = promptInput.value.trim()
  CreateImageCards(selectedModel, imageCount, aspectRatio, promptText);
}
// create placc3eholder cards woth loading spinners
function CreateImageCards(selectedModel, imageCount, aspectRatio, promptText) {
  gridGallerly.innerHTML = "";
  for (let i = 0; i < imageCount; i++) {
    gridGallerly.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${aspectRatio}">
                         <div class="status-container">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p class="status-text">Genrating</p>
                        </div>
                    </div>`
  }
  genrateImages(selectedModel, imageCount, aspectRatio, promptText);
}
async function genrateImages(selectedModel, imageCount, aspectRatio, promptText) {
  const MODEL_URL = `https://api-inference.huggingface.co/models/${selectedModel}`;
  const { width, height } = getImageDimensions(aspectRatio);
  generateBtn.setAttribute("disabled", "true");
  const imagePromises = Array.from({ length: imageCount }, async function (_, i) {
    try {
      const response = await fetch(MODEL_URL,
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: promptText,
            parameters: { width, height },
            options: { wait_for_model: true, use_cache: false },
          }),

        });
      if (!response.ok) throw new Error((await response.json())?.error);
      const result = await response.blob();
      console.log(result);
      updateImageCard(i, URL.createObjectURL(result))
    } catch (error) {
      console.log(error);
      const imgCard = document.getElementById(`img-card-${i}`);
      imgCard.classList.replace("loading", "error");
      imgCard.querySelector(".status-text").textContent = "Generation FAiled"
    }
  });
  await Promise.allSettled(imagePromises);
  generateBtn.removeAttribute("disabled");
}


function getImageDimensions(aspectRatio, baseSize = 512) {
  const [w, h] = aspectRatio.split("/").map(Number);
  const scaleFactor = baseSize / Math.sqrt(w * h);
  let width = Math.round(w * scaleFactor);
  let height = Math.round(h * scaleFactor);
  width = Math.floor(width / 16) * 16;
  height = Math.floor(height / 16) * 16;

  return { width, height };
}

function updateImageCard(imgIndex, imgUrl) {
  const imgCard = document.getElementById(`img-card-${imgIndex}`); // <-- Fixed syntax
  if (!imgCard) return;
  imgCard.classList.remove("loading");
  imgCard.innerHTML = `  <img src=${imgUrl} alt="" class="result-img">
                        <div class="img-overlay">
                            <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div> `;
};




loadTheme();
// when clicking in dice means prompt btn  
promptBtn.addEventListener("click", randomExample)
// when we click genrate 
promptForm.addEventListener("submit", handleFormSubmit)
// when we click in theam btn than...
themeToggle.addEventListener("click", toggleTheme)
