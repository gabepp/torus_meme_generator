const imageFileInput = document.querySelector("#imageFileInput");
const canvas = document.querySelector("#meme");
const topTextInput = document.querySelector("#topTextInput");
const bottomTextInput = document.querySelector("#bottomTextInput");
const fontSizeSlider = document.querySelector("#fontSizeSlider");

let image = new Image();
image.src = "windows.png"; // Replace with the path to your placeholder image

// Select the font size display element
const fontSizeDisplay = document.querySelector("#fontSizeDisplay");

// Function to update the font size display and regenerate the meme
function updateFontSizeDisplay(value) {
  fontSizeDisplay.textContent = value;

  // Calculate the percentage position of the slider
  const min = parseInt(fontSizeSlider.min);
  const max = parseInt(fontSizeSlider.max);
  const percentage = (value - min) / (max - min);

  // Get the slider's width
  const sliderWidth = fontSizeSlider.offsetWidth;

  // Calculate the position for the display
  // Adjust for the thumb's width (assuming 15px as set in CSS)
  const thumbWidth = 15; // Must match the CSS thumb width
  const position = percentage * (sliderWidth - 2.5 * thumbWidth) + (1.25 * thumbWidth);

  // Update the left position of the font size display
  fontSizeDisplay.style.left = `${position}px`;

  // Regenerate the meme with the new font size
  updateMemeCanvas(
    canvas,
    image,
    topTextInput.value,
    bottomTextInput.value,
    value
  );
}

// Initialize the font size display on page load
document.addEventListener("DOMContentLoaded", () => {
  const initialFontSize = fontSizeSlider.value;
  updateFontSizeDisplay(initialFontSize);
});

// Update the font size display as the slider moves
fontSizeSlider.addEventListener("input", (e) => {
  const fontSize = e.target.value;
  updateFontSizeDisplay(fontSize);
});

// Draw the placeholder image initially
image.onload = () => {
  updateMemeCanvas(canvas, image, topTextInput.value, bottomTextInput.value, fontSizeSlider.value);
};

imageFileInput.addEventListener("change", (e) => {
  const imageDataUrl = URL.createObjectURL(e.target.files[0]);

  image = new Image();
  image.src = imageDataUrl;

  image.addEventListener(
    "load",
    () => {
      updateMemeCanvas(
        canvas,
        image,
        topTextInput.value,
        bottomTextInput.value,
        fontSizeSlider.value
      );
    },
    { once: true }
  );
});

topTextInput.addEventListener("input", () => {
  topTextInput.value = topTextInput.value.toUpperCase(); // Convert to uppercase
  updateMemeCanvas(
    canvas,
    image,
    topTextInput.value,
    bottomTextInput.value,
    fontSizeSlider.value
  );
});

bottomTextInput.addEventListener("input", () => {
  bottomTextInput.value = bottomTextInput.value.toUpperCase(); // Convert to uppercase
  updateMemeCanvas(
    canvas,
    image,
    topTextInput.value,
    bottomTextInput.value,
    fontSizeSlider.value
  );
});

function updateMemeCanvas(canvas, image, topText, bottomText, fontSize = 20) {
  const ctx = canvas.getContext("2d");
  const width = image.width;
  const height = image.height;
  const adjustedFontSize = Math.floor((width * fontSize) / 250); // Scale font size to canvas width
  const yOffset = height / 25;

  // Update canvas background
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);

  // Prepare text
  ctx.font = `${adjustedFontSize}px Impact, sans-serif`;
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;
  ctx.fillStyle = "white";

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, fontSize, direction = "down") {
    const words = text.split(" "); // Split the text into words
    let line = "";

    if (direction === "down") {
      // Flow downward (used for top text)
      let yOffset = y;

      words.forEach((word) => {
        const testLine = line + word + " ";
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && line !== "") {
          // Draw the current line with shadow
          ctx.filter = `blur(${0.03 * fontSize}px)`;
          ctx.strokeText(line, x, yOffset);
          ctx.filter = "none";
          ctx.fillText(line, x, yOffset);

          // Start a new line
          line = word + " ";
          yOffset += lineHeight;
        } else if (ctx.measureText(word).width > maxWidth) {
          // Handle long words by splitting them character by character
          for (const char of word) {
            const testCharLine = line + char;
            const charWidth = ctx.measureText(testCharLine).width;

            if (charWidth > maxWidth && line !== "") {
              // Draw the current line
              ctx.filter = `blur(${0.03 * fontSize}px)`;
              ctx.strokeText(line, x, yOffset);
              ctx.filter = "none";
              ctx.fillText(line, x, yOffset);

              line = char; // Start new line with the current character
              yOffset += lineHeight;
            } else {
              line += char;
            }
          }
          line += " "; // Add a space after splitting the word
        } else {
          line = testLine; // Add the word to the current line
        }
      });

      // Draw the last remaining line
      if (line.trim() !== "") {
        ctx.filter = `blur(${0.03 * fontSize}px)`;
        ctx.strokeText(line.trim(), x, yOffset);
        ctx.filter = "none";
        ctx.fillText(line.trim(), x, yOffset);
      }
    } else {
      // Flow upward (used for bottom text)
      let yOffset = y;

      words.reverse().forEach((word) => {
        const testLine = word + " " + line;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxWidth && line !== "") {
          // Draw the current line with shadow
          ctx.filter = `blur(${0.03 * fontSize}px)`;
          ctx.strokeText(line.trim(), x, yOffset);
          ctx.filter = "none";
          ctx.fillText(line.trim(), x, yOffset);

          // Start a new line above
          line = word + " ";
          yOffset -= lineHeight;
        } else if (ctx.measureText(word).width > maxWidth) {
          // Handle long words by splitting them character by character
          for (const char of word) {
            const testCharLine = char + line;
            const charWidth = ctx.measureText(testCharLine).width;

            if (charWidth > maxWidth && line !== "") {
              // Draw the current line
              ctx.filter = `blur(${0.03 * fontSize}px)`;
              ctx.strokeText(line.trim(), x, yOffset);
              ctx.filter = "none";
              ctx.fillText(line.trim(), x, yOffset);

              line = char; // Start new line above with the current character
              yOffset -= lineHeight;
            } else {
              line = char + line;
            }
          }
          line = word + " " + line; // Add the rest of the word to the line
        } else {
          line = testLine; // Add the word to the current line
        }
      });

      // Draw the last remaining line
      if (line.trim() !== "") {
        ctx.filter = `blur(${0.03 * fontSize}px)`;
        ctx.strokeText(line.trim(), x, yOffset);
        ctx.filter = "none";
        ctx.fillText(line.trim(), x, yOffset);
      }
    }
  }

  // Prepare text settings
  ctx.font = `${adjustedFontSize}px Impact, sans-serif`; // Use Impact font
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "black";
  ctx.lineWidth = Math.floor(adjustedFontSize / 8); // Outline thickness
  ctx.fillStyle = "white";

  const lineHeight = adjustedFontSize * 1.2; // Line height relative to font size

  // Add top text
  ctx.textBaseline = "top";
  wrapText(ctx, topText, width / 2, yOffset, width - 20, lineHeight, adjustedFontSize, "down");

  // Add bottom text
  ctx.textBaseline = "bottom";
  wrapText(ctx, bottomText, width / 2, height - yOffset, width - 20, lineHeight, adjustedFontSize, "up");
}


function addStickers(canvas) {
  // *** Instead of re-defining a new array, store them globally
  // *** We'll define them as 'stickers' within this function scope
  // *** but must also reference them from the customSticker code
  
  const stickers = [];
  let selectedSticker = null; // local reference (this is overshadowing the custom code, so see note below)

  // “Hitbox” sizes
  const RESIZE_HANDLE_SIZE = 20;
  const DELETE_ICON_SIZE = 30;

  let isDragging = false;
  let isResizing = false;
  let offsetX, offsetY;

  // Listen for built-in sticker clicks
  const stickerOptions = document.querySelectorAll(".sticker-option");
  stickerOptions.forEach((imgEl) => {
    // Only apply if it has data-sticker-src
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
        redrawMemeAndStickers();
      };
    });
  });

  // The local redraw function
  function redrawMemeAndStickers() {
    // 1) Re-draw the meme background + text
    updateMemeCanvas(
      canvas,
      image,
      topTextInput.value,
      bottomTextInput.value,
      fontSizeSlider.value
    );

    // 2) draw each sticker
    const ctx = canvas.getContext("2d");
    stickers.forEach((st) => {
      ctx.drawImage(st.image, st.x, st.y, st.width, st.height);
    });

    // bounding box if selected
    if (selectedSticker) {
      drawStickerUI(selectedSticker, ctx);
    }
  }

  function drawStickerUI(sticker, ctx) {
    ctx.save();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.strokeRect(sticker.x, sticker.y, sticker.width, sticker.height);

    // resize handle
    ctx.fillStyle = "blue";
    ctx.fillRect(
      sticker.x + sticker.width - RESIZE_HANDLE_SIZE / 2,
      sticker.y + sticker.height - RESIZE_HANDLE_SIZE / 2,
      RESIZE_HANDLE_SIZE,
      RESIZE_HANDLE_SIZE
    );

    // delete "X" top-right
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
    return (x >= rx && x <= rx + RESIZE_HANDLE_SIZE && y >= ry && y <= ry + RESIZE_HANDLE_SIZE);
  }
  function isOnDeleteIcon(x, y, sticker) {
    const cornerX = sticker.x + sticker.width;
    const cornerY = sticker.y;
    const DELETE_ICON_SIZE = 30;
    const deleteX = cornerX - DELETE_ICON_SIZE / 2;
    const deleteY = cornerY - DELETE_ICON_SIZE / 2;
    return (x >= deleteX && x <= deleteX + DELETE_ICON_SIZE &&
            y >= deleteY && y <= deleteY + DELETE_ICON_SIZE);
  }

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
      redrawMemeAndStickers();
      return;
    }

    // bring to front
    const idx = stickers.indexOf(foundSticker);
    stickers.splice(idx, 1);
    stickers.push(foundSticker);
    selectedSticker = foundSticker;
    redrawMemeAndStickers();

    // check delete
    if (isOnDeleteIcon(mouseX, mouseY, selectedSticker)) {
      stickers.pop();
      selectedSticker = null;
      redrawMemeAndStickers();
      return;
    }
    // check resize
    if (isOnResizeHandle(mouseX, mouseY, selectedSticker)) {
      isResizing = true;
      isDragging = false;
      return;
    }
    // else drag
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
      redrawMemeAndStickers();
    } else if (isResizing) {
      const newW = mouseX - selectedSticker.x;
      const newH = mouseY - selectedSticker.y;
      if (newW > 20 && newH > 20) {
        selectedSticker.width = newW;
        selectedSticker.height = newH;
        redrawMemeAndStickers();
      }
    } else {
      // update cursor style
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

  // =========== CUSTOM STICKER UPLOAD FIX ===========
  // We hook into your existing 'stickers' array & 'redrawMemeAndStickers' inside addStickers
  const customStickerInput = document.querySelector("#customStickerInput");
  customStickerInput.addEventListener("change", (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const customImg = new Image();
    customImg.src = url;
    customImg.onload = () => {
      // Scale to avoid enormous images
      const scaled = scaleToCanvas(customImg, canvas); 
      const newSticker = {
        image: scaled.img,
        x: canvas.width/2 - scaled.width/2,
        y: canvas.height/2 - scaled.height/2,
        width: scaled.width,
        height: scaled.height
      };
      stickers.push(newSticker);
      selectedSticker = newSticker;
      redrawMemeAndStickers();
    };
  });

  // Helper for scaling large images
  function scaleToCanvas(img, canvas) {
    // Scale to at most half the canvas size
    let maxW = canvas.width * 0.5;
    let maxH = canvas.height * 0.5;
    let w = img.width;
    let h = img.height;
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
}

// Call addStickers
addStickers(canvas);

function downloadMeme() {
  // Convert the canvas content to a data URL in PNG format
  const imageURI = canvas.toDataURL("image/png");

  // Create a temporary link element
  const link = document.createElement("a");
  link.href = imageURI;
  link.download = "my_meme.png"; // The default file name

  // Append the link to the body
  document.body.appendChild(link);

  // Programmatically click the link to trigger the download
  link.click();

  // Remove the link from the document
  document.body.removeChild(link);
}

// Attach the download function to the button's click event
downloadBtn.addEventListener("click", downloadMeme);

const copyBtn = document.querySelector("#copyBtn"); // Select the copy button

// Function to copy the canvas image to the clipboard
async function copyMemeToClipboard() {
  try {
    // Convert the canvas content to a Blob
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));

    // Create a ClipboardItem
    const item = new ClipboardItem({ 'image/png': blob });

    // Write the image to the clipboard
    await navigator.clipboard.write([item]);

    // Notify the user
    alert("Meme copied to clipboard!");
  } catch (error) {
    console.error("Failed to copy meme: ", error);
    alert("Failed to copy meme. Please try again.");
  }
}

// Attach the copy function to the button's click event
copyBtn.addEventListener("click", copyMemeToClipboard);

const customStickerInput = document.querySelector("#customStickerInput");

// 2) Listen for file selection
customStickerInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return; // User canceled or no file chosen

  // Create a new image from the selected file
  const stickerImageURL = URL.createObjectURL(file);
  const stickerImage = new Image();
  stickerImage.src = stickerImageURL;

  // On load, push it into your stickers array
  stickerImage.onload = () => {
    // We'll assume you already have an array 'stickers' or use logic from addStickers()
    const newSticker = {
      image: stickerImage,
      x: canvas.width / 2 - stickerImage.width / 4,
      y: canvas.height / 2 - stickerImage.height / 4,
      width: stickerImage.width / 2,
      height: stickerImage.height / 2,
    };

    // You must have the same logic in your addStickers() function
    // that defines and uses 'stickers' array & a redraw function
    stickers.push(newSticker);
    redrawMemeAndStickers(); // Or whatever function re-draws your stickers on the canvas
  };
});