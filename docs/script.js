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
  const position = percentage * (sliderWidth - 2.5 * thumbWidth) + (thumbWidth);

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
  // Store multiple stickers in an array
  const stickers = [];
  let selectedSticker = null; // Which sticker is currently selected?

  // “Hitbox” sizes
  const RESIZE_HANDLE_SIZE = 20;
  const DELETE_ICON_SIZE = 30; // Increased size

  // For dragging/resizing
  let isDragging = false;
  let isResizing = false;
  let offsetX, offsetY; // Track drag offset for the selected sticker

  // Listen for clicks on sticker options to add a new sticker
  const stickerOptions = document.querySelectorAll(".sticker-option");
  stickerOptions.forEach((imgEl) => {
    imgEl.addEventListener("click", () => {
      // Create a new Image object
      const stickerImage = new Image();
      stickerImage.src = imgEl.dataset.stickerSrc;

      // Once it loads, push a new sticker object to the array
      stickerImage.onload = () => {
        const newSticker = {
          image: stickerImage,
          x: canvas.width / 2 - stickerImage.width / 4, // center-ish
          y: canvas.height / 2 - stickerImage.height / 4,
          width: stickerImage.width / 2,
          height: stickerImage.height / 2,
        };
        stickers.push(newSticker);

        // Make this new sticker selected and bring to front
        selectedSticker = newSticker;
        redrawMemeAndStickers();
      };
    });
  });

  // Redraw function that draws the meme + *all* stickers
  function redrawMemeAndStickers() {
    // 1) Redraw the meme background + text
    updateMemeCanvas(
      canvas,
      image,
      topTextInput.value,
      bottomTextInput.value,
      fontSizeSlider.value
    );

    // 2) Draw each sticker in order (first in array = behind)
    const ctx = canvas.getContext("2d");
    stickers.forEach((sticker) => {
      ctx.drawImage(
        sticker.image,
        sticker.x,
        sticker.y,
        sticker.width,
        sticker.height
      );
    });

    // If we have a selected sticker, draw bounding box, resize handle, delete icon
    if (selectedSticker) {
      drawStickerUI(selectedSticker, ctx);
    }
  }

  // Helper: draw bounding box, resize handle, and a delete "X" icon
  function drawStickerUI(sticker, ctx) {
    // Bounding box
    ctx.save();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.strokeRect(sticker.x, sticker.y, sticker.width, sticker.height);
    
    // Resize handle (bottom-right)
    ctx.fillStyle = "blue";
    ctx.fillRect(
      sticker.x + sticker.width - RESIZE_HANDLE_SIZE / 2,
      sticker.y + sticker.height - RESIZE_HANDLE_SIZE / 2,
      RESIZE_HANDLE_SIZE,
      RESIZE_HANDLE_SIZE
    );
    
    // === Draw the centered delete "X" (top-right corner) ===
    const DELETE_ICON_SIZE = 30; // Increased size for better visibility
    
    // Calculate the top-right corner coordinates
    const cornerX = sticker.x + sticker.width;
    const cornerY = sticker.y;
    
    // Position the "X" so that its center aligns with the corner
    const deleteX = cornerX - DELETE_ICON_SIZE / 2;
    const deleteY = cornerY - DELETE_ICON_SIZE / 2;
    
    // Draw the "X"
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4; // Thicker lines for better visibility
    ctx.lineCap = "square"; // Square line endings for a pixelated look
    
    // Draw two diagonal lines to form the "X"
    ctx.beginPath();
    ctx.moveTo(deleteX, deleteY);
    ctx.lineTo(deleteX + DELETE_ICON_SIZE, deleteY + DELETE_ICON_SIZE);
    ctx.moveTo(deleteX + DELETE_ICON_SIZE, deleteY);
    ctx.lineTo(deleteX, deleteY + DELETE_ICON_SIZE);
    ctx.stroke();
    
    ctx.restore();
  }

  // Helper: check if mouse is inside the given sticker
  function isInsideSticker(mouseX, mouseY, sticker) {
    return (
      mouseX >= sticker.x &&
      mouseX <= sticker.x + sticker.width &&
      mouseY >= sticker.y &&
      mouseY <= sticker.y + sticker.height
    );
  }

  // Helper: check if mouse is on the resize handle (bottom-right)
  function isOnResizeHandle(mouseX, mouseY, sticker) {
    const rx = sticker.x + sticker.width - RESIZE_HANDLE_SIZE;
    const ry = sticker.y + sticker.height - RESIZE_HANDLE_SIZE;
    return (
      mouseX >= rx &&
      mouseX <= rx + RESIZE_HANDLE_SIZE &&
      mouseY >= ry &&
      mouseY <= ry + RESIZE_HANDLE_SIZE
    );
  }

  // Helper: check if mouse is on the delete icon (top-right)
  function isOnDeleteIcon(mouseX, mouseY, sticker) {
    const DELETE_ICON_SIZE = 30; // Must match the size used in drawStickerUI
    const cornerX = sticker.x + sticker.width;
    const cornerY = sticker.y;
    const deleteX = cornerX - DELETE_ICON_SIZE / 2;
    const deleteY = cornerY - DELETE_ICON_SIZE / 2;
    
    return (
      mouseX >= deleteX &&
      mouseX <= deleteX + DELETE_ICON_SIZE &&
      mouseY >= deleteY &&
      mouseY <= deleteY + DELETE_ICON_SIZE
    );
  }

  // On mousedown: figure out if user clicked any sticker
  canvas.addEventListener("mousedown", (e) => {
    if (!stickers.length) return;

    // Scale mouse coords if canvas is resized in CSS
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // 1) Find the topmost sticker clicked (loop from end to start)
    let foundSticker = null;
    for (let i = stickers.length - 1; i >= 0; i--) {
      if (isInsideSticker(mouseX, mouseY, stickers[i])) {
        foundSticker = stickers[i];
        break;
      }
    }

    // If no sticker was clicked, unselect any selected
    if (!foundSticker) {
      selectedSticker = null;
      redrawMemeAndStickers();
      return;
    }

    // If we found a sticker, bring it to front by splicing & pushing
    const idx = stickers.indexOf(foundSticker);
    stickers.splice(idx, 1); // remove from array
    stickers.push(foundSticker); // add on top
    selectedSticker = foundSticker;
    redrawMemeAndStickers();

    // 2) Check if the user clicked the "delete" icon
    if (isOnDeleteIcon(mouseX, mouseY, selectedSticker)) {
      // Remove the sticker
      stickers.pop(); // since we just moved it to the end
      selectedSticker = null;
      redrawMemeAndStickers();
      return;
    }

    // 3) Check if the user clicked on the resize handle
    if (isOnResizeHandle(mouseX, mouseY, selectedSticker)) {
      isResizing = true;
      isDragging = false;
      return;
    }

    // 4) Otherwise, user is clicking inside the sticker => drag
    isDragging = true;
    isResizing = false;
    offsetX = mouseX - selectedSticker.x;
    offsetY = mouseY - selectedSticker.y;
  });

  // On mousemove: if dragging/resizing, update positions and cursor
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
      // Move sticker
      selectedSticker.x = mouseX - offsetX;
      selectedSticker.y = mouseY - offsetY;
      redrawMemeAndStickers();
    } else if (isResizing) {
      // Resize sticker
      const newWidth = mouseX - selectedSticker.x;
      const newHeight = mouseY - selectedSticker.y;
      if (newWidth > 20 && newHeight > 20) {
        selectedSticker.width = newWidth;
        selectedSticker.height = newHeight;
        redrawMemeAndStickers();
      }
    }

    // Update cursor style based on hover position
    if (isOnDeleteIcon(mouseX, mouseY, selectedSticker)) {
      canvas.style.cursor = "pointer";
    } else if (isOnResizeHandle(mouseX, mouseY, selectedSticker)) {
      canvas.style.cursor = "nwse-resize";
    } else if (isInsideSticker(mouseX, mouseY, selectedSticker)) {
      canvas.style.cursor = "move";
    } else {
      canvas.style.cursor = "default";
    }
  });

  // On mouseup: stop dragging/resizing
  canvas.addEventListener("mouseup", () => {
    isDragging = false;
    isResizing = false;
    canvas.style.cursor = "default";
  });

  // On mouseleave: also stop
  canvas.addEventListener("mouseleave", () => {
    isDragging = false;
    isResizing = false;
    canvas.style.cursor = "default";
  });
}

addStickers(canvas);