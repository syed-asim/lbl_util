document.addEventListener('DOMContentLoaded', function () {
  hideLoader();
});

fabric.textureSize = 5000;
var canvas = (this.__canvas = new fabric.Canvas("c"));
const imageUpload = document.getElementById("imageUpload");

const outputImage = document.getElementById('outputImage');

// Event listener for file input change
imageUpload.addEventListener("change", handleImageUpload);

const maxWidth = 500;
const maxHeight = 500;
let isDrawing = false;
let rect;
let imgSize = {};
let words = [];
let symbols = [];

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (file) {
    showLoader();
    // Create a FileReader to read the image
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
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
            const filter = new fabric.Image.filters.Sepia();
            image.filters.push(filter);

            // var filter1 = new fabric.Image.filters.Noise({
            //   noise: -100
            // });
            // image.filters.push(filter1);

            image.applyFilters();

            // Set the image as the canvas background
            canvas.setBackgroundImage(image, canvas.renderAll.bind(canvas));

            // Add Tesseract.js code for text recognition
            let imgg = canvas.toDataURL();
            recognizeText(imgg);

            canvas.clear();
            let cont = document.getElementById("c-container");
            cont.style.width = width;
            cont.style.height = height;
            cont.style.backgroundImage = 'url("' + imgg + '")';
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
    // You can use the recognized text as needed, e.g., display it on the page.
    displayRecognizedText(data);
    hideLoader();
  });
}

function displayRecognizedText(data) {
  // Here, you can display the recognized text on the webpage or perform any other actions with it.
  // For example, you can add a <div> element to display the text.
  const textContainer = document.createElement('div');
  textContainer.textContent = data.text;
  //document.body.appendChild(textContainer);

  let strokes = ["red", "green", "blue"];

  data.symbols.forEach(symbol => {
    let startX = symbol.bbox.x0;
    let startY = symbol.bbox.y0;
    let width = symbol.bbox.x1 - startX;
    let height = symbol.bbox.y1 - startY;
    symbols.push({ x: startX, y: startY, width: width, height: height, text: symbol.text });
  });

  data.words.forEach((word, i) => {
    let startX = word.bbox.x0;
    let startY = word.bbox.y0;
    let width = word.bbox.x1 - startX;
    let height = word.bbox.y1 - startY;
    words.push({ x: startX, y: startY, width: width, height: height, text: word.text });

    //addRectangle(startX, startY, width, height, "rect",strokes[i % 3], true);

  });
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
  const selectedObjects = canvas.getActiveObjects();
  if (selectedObjects && selectedObjects.length > 0) {
    return;
  }
  isDrawing = true;

  const pointer = canvas.getPointer(event.e);
  const startLeft = pointer.x;
  const startTop = pointer.y;

  rect = addRectangle(startLeft, startTop, 0, 0, "rect", "black");
  rect.startLeft = startLeft;
  rect.startTop = startTop;

});


// Event listener for mouse move
canvas.on("mouse:move", (event) => {
  if (!isDrawing) return;

  const pointer = canvas.getPointer(event.e);
  let currentLeft = pointer.x;
  let currentTop = pointer.y;

  if (currentLeft < rect.startLeft) {
    rect.left = currentLeft;
  }
  if (currentTop < rect.top) {
    rect.top = currentTop;
  }

  if (rect.left - currentLeft > 10) {

    console.log(rect.left - currentLeft);
  }

  rect.set({
    width: Math.abs(currentLeft - rect.startLeft),
    height: Math.abs(currentTop - rect.startTop)
  });
  canvas.renderAll();
});

// Event listener for mouse up
canvas.on("mouse:up", () => {
  isDrawing = false;
  // let symbols = findInRectangle(rect, words);
  // showSelectedText(symbols);
});
canvas.on({
  'selection:updated': HandleElement,
  'selection:created': HandleElement
});

function HandleElement(e) {
  if (e.selected.length > 1) return;
  if (e.selected[0].get("type")) {
    let txt = findInRectangle(e.selected[0], words);
    console.log(txt);
    showSelectedText(txt);
  }
}

function addRectangle(startX, startY, width, height, type = "rect", stroke = 'transparent', lockMovement = false) {
  rect = new fabric.Rect({
    left: startX,
    top: startY,
    width: width,
    height: height,
    fill: "transparent",
    stroke: stroke,
    strokeWidth: 2
  });
  rect.set("type", type);
  rect.setControlsVisibility({ mtr: false });
  if (lockMovement) {
    rect.lockMovementX = true;
    rect.lockMovementY = true;
  }
  canvas.add(rect);
  canvas.renderAll();

  return rect;

}


// Function to check if two rectangles overlap
function isOverlap(rect, item) {
  return (
    rect.left < item.x + item.width &&
    rect.left + rect.width > item.x &&
    rect.top < item.y + item.height &&
    rect.top + rect.height > item.y
  );
}

// Find words (symbols) that overlap with the user-drawn rectangle
function findInRectangle(rectangle, items) {
  const overlappingData = [];

  for (const item of items) {
    if (isOverlap(rectangle, item)) {
      overlappingData.push(item.text);
    }
  }

  return overlappingData;
}

function showSelectedText(symbols) {
  document.getElementById("symbols").innerHTML = symbols.join(" ");
}

// Function to show the loader
function showLoader() {
  const loader = document.getElementById('overlay');
  loader.style.display = 'block';
}

// Function to hide the loader
function hideLoader() {
  const loader = document.getElementById('overlay');
  loader.style.display = 'none';
}

// Call showLoader when starting processing
showLoader();


