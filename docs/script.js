/****************************************************
 * GLOBAL VARIABLES
 ****************************************************/
const imageFileInput = document.querySelector("#imageFileInput");
const canvas = document.querySelector("#meme");
const topTextInput = document.querySelector("#topTextInput");
const bottomTextInput = document.querySelector("#bottomTextInput");
const fontSizeSlider = document.querySelector("#fontSizeSlider");
const fontSizeDisplay = document.querySelector("#fontSizeDisplay");
const downloadBtn = document.querySelector("#downloadBtn");
const copyBtn = document.querySelector("#copyBtn");
const customStickerInput = document.querySelector("#customStickerInput");

let image = new Image();
image.src = "windows.png"; // Replace with the path to your placeholder image

// Stickers array and currently selected sticker are now GLOBAL
let stickers = [];
let selectedSticker = null;

// For resizing and dragging
let isDragging = false;
let isResizing = false;
let offsetX, offsetY;

const RESIZE_HANDLE_SIZE = 20;
const DELETE_ICON_SIZE = 30;

/****************************************************
 * INITIALIZATION
 ****************************************************/
// On page load, initialize the font size display and set up the placeholder image
document.addEventListener("DOMContentLoaded", () => {
  const initialFontSize = fontSizeSlider.value;
  updateFontSizeDisplay(initialFontSize);
});

// Once the placeholder image loads, draw it for the first time
image.onload = () => {
  redrawAll(); 
};

/****************************************************
 * FONT SIZE SLIDER
 ****************************************************/
function updateFontSizeDisplay(value) {
  fontSizeDisplay.textContent = value;

  const min = parseInt(fontSizeSlider.min);
  const max = parseInt(fontSizeSlider.max);
  const percentage = (value - min) / (max - min);
  const sliderWidth = fontSizeSlider.offsetWidth;
  const thumbWidth = 15; // Must match the CSS thumb width
  const position = percentage * (sliderWidth - 2.5 * thumbWidth) + (1.25 * thumbWidth);

  fontSizeDisplay.style.left = `${position}px`;

  // Instead of calling updateMemeCanvas directly, call the unified redraw
  redrawAll();
}

fontSizeSlider.addEventListener("input", (e) => {
  const fontSize = e.target.value;
  updateFontSizeDisplay(fontSize);
});

/****************************************************
 * IMAGE UPLOAD
 ****************************************************/
imageFileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const imageDataUrl = URL.createObjectURL(file);
  image = new Image();
  image.src = imageDataUrl;

  image.addEventListener(
    "load",
    () => {
      redrawAll();
    },
    { once: true }
  );
});

/****************************************************
 * TEXT INPUTS
 ****************************************************/
topTextInput.addEventListener("input", () => {
  topTextInput.value = topTextInput.value.toUpperCase();
  redrawAll();
});

bottomTextInput.addEventListener("input", () => {
  bottomTextInput.value = bottomTextInput.value.toUpperCase();
  redrawAll();
});

/****************************************************
 * MAIN DRAW FUNCTION: updateMemeCanvas
 * - Draws the background image + text only
 ****************************************************/
function updateMemeCanvas(canvas, image, topText, bottomText, fontSize = 20) {
  const ctx = canvas.getContext("2d");
  const width = image.width;
  const height = image.height;
  const adjustedFontSize = Math.floor((width * fontSize) / 250); 
  const yOffset = height / 25;

  // Update canvas size to the image size
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);

  // Prepare text style
  ctx.font = `${adjustedFontSize}px Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "black";
  ctx.lineWidth = Math.floor(adjustedFontSize / 8);
  ctx.fillStyle = "white";

  const lineHeight = adjustedFontSize * 1.2;

  // Helper to wrap text
  function wrapText(ctx, text, x, y, maxWidth, lineHeight, fontSize, direction = "down") {
    const words = text.split(" ");
    let line = "";

    if (direction === "down") {
      // Flow downward (top text)
      let yPos = y;
      words.forEach((word) => {
        const testLine = line + word + " ";
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && line !== "") {
          // Draw current line
          ctx.filter = `blur(${0.03 * fontSize}px)`;
          ctx.strokeText(line, x, yPos);
          ctx.filter = "none";
          ctx.fillText(line, x, yPos);

          line = word + " ";
          yPos += lineHeight;
        } else if (ctx.measureText(word).width > maxWidth) {
          // Handle extremely long words
          for (const char of word) {
            const testCharLine = line + char;
            const charWidth = ctx.measureText(testCharLine).width;
            if (charWidth > maxWidth && line !== "") {
              ctx.filter = `blur(${0.03 * fontSize}px)`;
              ctx.strokeText(line, x, yPos);
              ctx.filter = "none";
              ctx.fillText(line, x, yPos);

              line = char;
              yPos += lineHeight;
            } else {
              line += char;
            }
          }
          line += " ";
        } else {
          line = testLine;
        }
      });

      // Draw final line
      if (line.trim() !== "") {
        ctx.filter = `blur(${0.03 * fontSize}px)`;
        ctx.strokeText(line.trim(), x, yPos);
        ctx.filter = "none";
        ctx.fillText(line.trim(), x, yPos);
      }
    } else {
      // Flow upward (bottom text)
      let yPos = y;
      words.reverse().forEach((word) => {
        const testLine = word + " " + line;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && line !== "") {
          ctx.filter = `blur(${0.03 * fontSize}px)`;
          ctx.strokeText(line.trim(), x, yPos);
          ctx.filter = "none";
          ctx.fillText(line.trim(), x, yPos);

          line = word + " ";
          yPos -= lineHeight;
        } else if (ctx.measureText(word).width > maxWidth) {
          // Handle extremely long words
          for (const char of word) {
            const testCharLine = char + line;
            const charWidth = ctx.measureText(testCharLine).width;
            if (charWidth > maxWidth && line !== "") {
              ctx.filter = `blur(${0.03 * fontSize}px)`;
              ctx.strokeText(line.trim(), x, yPos);
              ctx.filter = "none";
              ctx.fillText(line.trim(), x, yPos);

              line = char;
              yPos -= lineHeight;
            } else {
              line = char + line;
            }
          }
          line = word + " " + line;
        } else {
          line = testLine;
        }
      });

      // Draw final line
      if (line.trim() !== "") {
        ctx.filter = `blur(${0.03 * fontSize}px)`;
        ctx.strokeText(line.trim(), x, yPos);
        ctx.filter = "none";
        ctx.fillText(line.trim(), x, yPos);
      }
    }
  }

  // Draw top text
  ctx.textBaseline = "top";
  wrapText(ctx, topText, width / 2, yOffset, width - 20, lineHeight, adjustedFontSize, "down");

  // Draw bottom text
  ctx.textBaseline = "bottom";
  wrapText(ctx, bottomText, width / 2, height - yOffset, width - 20, lineHeight, adjustedFontSize, "up");
}

/****************************************************
 * STICKER DRAWING + UI
 ****************************************************/
function drawStickers(ctx) {
  stickers.forEach((st) => {
    ctx.drawImage(st.image, st.x, st.y, st.width, st.height);
  });
}

function drawStickerUI(sticker, ctx) {
  // Draw bounding box
  ctx.save();
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  ctx.strokeRect(sticker.x, sticker.y, sticker.width, sticker.height);

  // Resize handle
  ctx.fillStyle = "blue";
  ctx.fillRect(
    sticker.x + sticker.width - RESIZE_HANDLE_SIZE / 2,
    sticker.y + sticker.height - RESIZE_HANDLE_SIZE / 2,
    RESIZE_HANDLE_SIZE,
    RESIZE_HANDLE_SIZE
  );

  // Delete "X" at top-right
  const cornerX = sticker.x + sticker.width;
  const cornerY = sticker.y;
  const deleteX = cornerX - DELETE_ICON_SIZE / 2;
  const deleteY = cornerY - DELETE_ICON_SIZE / 2;

  ctx.strokeStyle = "red";
  ctx.lineWidth = 4;
  ctx.lineCap = "square";
  ctx.beginPath();
  ctx.moveTo(deleteX, deleteY);
  ctx.lineTo(deleteX + DELETE_ICON_SIZE, deleteY + DELETE_ICON_SIZE);
  ctx.moveTo(deleteX + DELETE_ICON_SIZE, deleteY);
  ctx.lineTo(deleteX, deleteY + DELETE_ICON_SIZE);
  ctx.stroke();

  ctx.restore();
}

/****************************************************
 * REDRAW EVERYTHING (IMAGE + TEXT + STICKERS)
 ****************************************************/
function redrawAll() {
  updateMemeCanvas(
    canvas,
    image,
    topTextInput.value,
    bottomTextInput.value,
    fontSizeSlider.value
  );

  // Now draw stickers on top
  const ctx = canvas.getContext("2d");
  drawStickers(ctx);

  // If a sticker is selected, show its UI
  if (selectedSticker) {
    drawStickerUI(selectedSticker, ctx);
  }
}

/****************************************************
 * STICKER LOGIC (ADDING, DRAGGING, RESIZING, DELETING)
 ****************************************************/
function addStickers(canvas) {
  // Set up built-in sticker clicks
  const stickerOptions = document.querySelectorAll(".sticker-option");
  stickerOptions.forEach((imgEl) => {
    if (!imgEl.dataset.stickerSrc) return;
    imgEl.addEventListener("click", () => {
      const stickerImage = new Image();
      stickerImage.src = imgEl.dataset.stickerSrc;
      stickerImage.onload = () => {
        const newSticker = {
          image: stickerImage,
          x: canvas.width / 2 - stickerImage.width / 4,
          y: canvas.height / 2 - stickerImage.height / 4,
          width: stickerImage.width / 2,
          height: stickerImage.height / 2,
        };
        stickers.push(newSticker);
        selectedSticker = newSticker;
        redrawAll();
      };
    });
  });

  // MOUSE EVENTS
  canvas.addEventListener("mousedown", (e) => {
    if (!stickers.length) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let foundSticker = null;
    for (let i = stickers.length - 1; i >= 0; i--) {
      if (isInsideSticker(mouseX, mouseY, stickers[i])) {
        foundSticker = stickers[i];
        break;
      }
    }
    if (!foundSticker) {
      selectedSticker = null;
      redrawAll();
      return;
    }

    // Bring clicked sticker to the front
    const idx = stickers.indexOf(foundSticker);
    stickers.splice(idx, 1);
    stickers.push(foundSticker);
    selectedSticker = foundSticker;
    redrawAll();

    // Check if clicked on delete icon
    if (isOnDeleteIcon(mouseX, mouseY, selectedSticker)) {
      stickers.pop(); // remove from top
      selectedSticker = null;
      redrawAll();
      return;
    }
    // Check if clicked on resize handle
    if (isOnResizeHandle(mouseX, mouseY, selectedSticker)) {
      isResizing = true;
      isDragging = false;
      return;
    }
    // Otherwise, it's a drag
    isDragging = true;
    isResizing = false;
    offsetX = mouseX - selectedSticker.x;
    offsetY = mouseY - selectedSticker.y;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!selectedSticker) {
      canvas.style.cursor = "default";
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (isDragging) {
      selectedSticker.x = mouseX - offsetX;
      selectedSticker.y = mouseY - offsetY;
      redrawAll();
    } else if (isResizing) {
      const newW = mouseX - selectedSticker.x;
      const newH = mouseY - selectedSticker.y;
      if (newW > 20 && newH > 20) {
        selectedSticker.width = newW;
        selectedSticker.height = newH;
        redrawAll();
      }
    } else {
      // Update cursor style
      if (isOnDeleteIcon(mouseX, mouseY, selectedSticker)) {
        canvas.style.cursor = "pointer";
      } else if (isOnResizeHandle(mouseX, mouseY, selectedSticker)) {
        canvas.style.cursor = "nwse-resize";
      } else if (isInsideSticker(mouseX, mouseY, selectedSticker)) {
        canvas.style.cursor = "move";
      } else {
        canvas.style.cursor = "default";
      }
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
    isResizing = false;
    canvas.style.cursor = "default";
  });

  canvas.addEventListener("mouseleave", () => {
    isDragging = false;
    isResizing = false;
    canvas.style.cursor = "default";
  });

  // Listen for custom sticker uploads
  const customStickerInput = document.querySelector("#customStickerInput");
  customStickerInput.addEventListener("change", (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const customImg = new Image();
    customImg.src = url;
    customImg.onload = () => {
      // Scale down large images
      const scaled = scaleToCanvas(customImg, canvas);
      const newSticker = {
        image: scaled.img,
        x: canvas.width / 2 - scaled.width / 2,
        y: canvas.height / 2 - scaled.height / 2,
        width: scaled.width,
        height: scaled.height,
      };
      stickers.push(newSticker);
      selectedSticker = newSticker;
      redrawAll();
    };
  });
}

// Scale large images so they fit nicely
function scaleToCanvas(img, canvas) {
  let maxW = canvas.width * 0.5;
  let maxH = canvas.height * 0.5;
  let w = img.width;
  let h = img.height;

  // Scale down if too large
  if (w > maxW) {
    const ratio = maxW / w;
    w = maxW;
    h = h * ratio;
  }
  if (h > maxH) {
    const ratio = maxH / h;
    h = maxH;
    w = w * ratio;
  }
  return { img, width: w, height: h };
}

/****************************************************
 * STICKER HELPER FUNCTIONS
 ****************************************************/
function isInsideSticker(x, y, sticker) {
  return (
    x >= sticker.x &&
    x <= sticker.x + sticker.width &&
    y >= sticker.y &&
    y <= sticker.y + sticker.height
  );
}
function isOnResizeHandle(x, y, sticker) {
  const rx = sticker.x + sticker.width - RESIZE_HANDLE_SIZE;
  const ry = sticker.y + sticker.height - RESIZE_HANDLE_SIZE;
  return (
    x >= rx &&
    x <= rx + RESIZE_HANDLE_SIZE &&
    y >= ry &&
    y <= ry + RESIZE_HANDLE_SIZE
  );
}
function isOnDeleteIcon(x, y, sticker) {
  const cornerX = sticker.x + sticker.width;
  const cornerY = sticker.y;
  const deleteX = cornerX - DELETE_ICON_SIZE / 2;
  const deleteY = cornerY - DELETE_ICON_SIZE / 2;

  return (
    x >= deleteX &&
    x <= deleteX + DELETE_ICON_SIZE &&
    y >= deleteY &&
    y <= deleteY + DELETE_ICON_SIZE
  );
}

/****************************************************
 * ADD STICKERS & EVENTS
 ****************************************************/
addStickers(canvas);

/****************************************************
 * DOWNLOAD FUNCTION
 ****************************************************/
function downloadMeme() {
  const imageURI = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = imageURI;
  link.download = "my_meme.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
downloadBtn.addEventListener("click", downloadMeme);

/****************************************************
 * COPY TO CLIPBOARD
 ****************************************************/
async function copyMemeToClipboard() {
  try {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    const item = new ClipboardItem({ "image/png": blob });
    await navigator.clipboard.write([item]);
    alert("Meme copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy meme: ", error);
    alert("Failed to copy meme. Please try again.");
  }
}
copyBtn.addEventListener("click", copyMemeToClipboard);