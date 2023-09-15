var canvas = (this.__canvas = new fabric.Canvas("c"));
const imageUpload = document.getElementById("imageUpload");

const outputImage = document.getElementById('outputImage');

// Event listener for file input change
imageUpload.addEventListener("change", handleImageUpload);

const maxWidth = 1000;
const maxHeight = 1000;
let isDrawing = false;
let rect;
let imgSize = {};

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function () {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          if (width > height) {
            width = maxWidth;
            height = maxWidth / aspectRatio;
          } else {
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }
        }

        // Resize the canvas to match the new dimensions
        canvas.setWidth(width);
        canvas.setHeight(height);

        // Create a fabric.Image object with the resized image
        const resizedImage = new fabric.Image.fromURL(
          e.target.result,
          function (image) {
            image.set({
              scaleX: canvas.width / image.width,
              scaleY: canvas.height / image.height
            });

            // Set the image as the canvas background
            canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas));

            // Add Tesseract.js code for text recognition
            recognizeText(e.target.result);
          }
        );
      };

      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

function recognizeText(imageDataURL) {
  Tesseract.recognize(
    imageDataURL,
    'eng+ara', // Language (you can change this to your desired language)
    { logger: info => console.log(info) } // Logger for debugging
  ).then(({ data }) => {
    console.log(`Deskew angle: ${data.rotate} degrees`);
    console.log(`Recognized Text: ${data.text}`);
    
    // You can use the recognized text as needed, e.g., display it on the page.
    displayRecognizedText(text);
  });
}

function displayRecognizedText(text) {
  // Here, you can display the recognized text on the webpage or perform any other actions with it.
  // For example, you can add a <div> element to display the text.
  const textContainer = document.createElement('div');
  textContainer.textContent = text;
  document.body.appendChild(textContainer);
}


function handleImageUpload1(event) {
  const file = event.target.files[0];
  if (file) {
    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;

      img.onload = function () {
        let width = img.width;
        let height = img.height;
        imgSize.width = img.width;
        imgSize.height = img.height;


        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          imgSize.aspectRatio = aspectRatio;
          if (width > height) {
            width = maxWidth;
            height = maxWidth / aspectRatio;
          } else {
            height = maxHeight;
            width = maxHeight * aspectRatio;
          }
        }

        // Resize the canvas to match the new dimensions
        canvas.setWidth(width);
        canvas.setHeight(height);
        imgSize.newWidth = width;
        imgSize.newHeight = height;

        // Create a fabric.Image object with the resized image
        const resizedImage = new fabric.Image.fromURL(
          e.target.result,
          function (image) {
            image.set({
              scaleX: canvas.width / image.width,
              scaleY: canvas.height / image.height
            });
            canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas));
          }
        );
      };

      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Add an event listener for keydown events on the document
document.addEventListener("keydown", function (event) {
  if (event.keyCode === 46 || event.key === "Delete") {
    // Check if there's a selected object
    const selectedObject = canvas.getActiveObject();

    if (selectedObject && selectedObject.type === "rect") {
      // Remove the selected rectangle from the canvas
      canvas.remove(selectedObject);
      canvas.renderAll();
    }
  }
});

// Event listener for mouse down
canvas.on("mouse:down", (event) => {
  isDrawing = true;

  const pointer = canvas.getPointer(event.e);
  const startX = pointer.x;
  const startY = pointer.y;

  rect = new fabric.Rect({
    left: startX,
    top: startY,
    width: 0,
    height: 0,
    fill: "transparent",
    stroke: "blue",
    strokeWidth: 2
  });
  rect.setControlsVisibility({ mtr: false });
  canvas.add(rect);
  canvas.renderAll();
});

// Event listener for mouse move
canvas.on("mouse:move", (event) => {
  if (!isDrawing) return;

  const pointer = canvas.getPointer(event.e);
  const currentX = pointer.x;
  const currentY = pointer.y;

  rect.set({
    width: currentX - rect.left,
    height: currentY - rect.top
  });

  canvas.renderAll();
});

// Event listener for mouse up
canvas.on("mouse:up", () => {
  isDrawing = false;
});

//Add();