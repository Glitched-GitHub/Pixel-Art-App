

//! Create Grid

var gridItems = document.querySelectorAll(".grid-item");
const canvasGrid = document.querySelector(".canvas-grid");
const gridSizeValue = document.querySelector("#grid-size-value");
const gridSizeSlider = document.querySelector(".grid-size-slider");
var gridSize = gridSizeSlider.value;


function createGrid() {

    gridSize = gridSizeSlider.value;

    canvasGrid.innerHTML = "";

    document.querySelector(":root").style.setProperty("--grid-size", gridSize);

    gridSizeValue.innerText = `Grid Size ${gridSize} x ${gridSize}`;

    for (var i = 0; i < gridSize ** 2; ++i) {

        const newGridItem = document.createElement("div");
        newGridItem.classList.add("grid-item");
        newGridItem.setAttribute("draggable", "false");
        canvasGrid.appendChild(newGridItem);
        
    }

    toggleGrid.setAttribute("data-toggle", "true");

    gridItems = document.querySelectorAll(".grid-item");
    createGridLines();
    createGridListeners();

}

function createGridLines() {

    gridItems.forEach((item, i) => {

        const col = (i % gridSize) + 1;
        const row = Math.floor(i / gridSize) + 1;

        // item.className = "grid-item";

        if (col === gridSize && row === gridSize) {

            item.classList.toggle("grid-border-corner");

        } else if (col === gridSize) {

            item.classList.toggle("grid-border-right");

        } else if (row === gridSize) {

            item.classList.toggle("grid-border-bottom");

        } else {

            item.classList.toggle("grid-border-default");
        }
    });
}

gridSizeSlider.addEventListener("change", createGrid);


//! Color Pickers (Brush, Background and Grid Border)

const getBrushColor = document.querySelector(".brush-color > input");
var brushColor = getBrushColor.value;

getBrushColor.addEventListener("input", () => {

    brushColor = getBrushColor.value;

});

const getBackgroundColor = document.querySelector(".background-color > input");

getBackgroundColor.addEventListener("input", () => {

    document.querySelector(":root").style.setProperty("--clr-canvas-background", getBackgroundColor.value);

});

const getGridBorderColor = document.querySelector(".grid-border-color > input");

getGridBorderColor.addEventListener("input", () => {

    document.querySelector(":root").style.setProperty("--clr-grid-border", getGridBorderColor.value);

});


//! Buttons

var brushButtons = document.querySelectorAll("button[data-active]");
var currentTool = "brushTool";

function switchTool(newTool) {
    
    for (i = 0; i < brushButtons.length; i++) {

        if (brushButtons[i].id === newTool && brushButtons[i].dataset.active === "false") {

            brushButtons[i].setAttribute("data-active", "true");
            currentTool = brushButtons[i].id;

        } else {

            if (brushButtons[i].id === newTool) {

                currentTool = "brushTool";

            }

            brushButtons[i].setAttribute("data-active", "false");
        }
    }
}

brushButtons.forEach(button => {

    button.addEventListener("click", () => {

        switchTool(button.id);

    });

});


//! Color Fill

function colorFill(e) {
    
    const oldColor = window.getComputedStyle(e.target).backgroundColor;
    const newColor = getBrushColor.value;

    //? Uncomment this if you want Color Fill to not work on grid items that are transparent/have no color 
    // if (oldColor === "rgba(0, 0, 0, 0)") {

    //     return

    // }

    const selectedIndex = Array.from(e.target.parentElement.children).indexOf(e.target);

    const checked = new Set();

    const connectedItems = [];

    const selectedRow = Math.floor(selectedIndex / gridSize);
    const selectedCol = selectedIndex % gridSize;
    
    dfs(selectedRow, selectedCol);

    for (let item of connectedItems) {

        gridItems[item].style.background = newColor;

    }

    function inBounds(row, col) {

        return row >= 0 && row < gridSize && col >= 0 && col < gridSize;

    }

    function dfs(row, col) {

        const index = row * gridSize + col;

        if (!inBounds(row, col) || checked.has(index) || window.getComputedStyle(gridItems[index]).backgroundColor !== oldColor) {

            return;

        }

        checked.add(index);

        connectedItems.push(index);

        const directions = [
            [-1, 0],  // Up
            [1, 0],   // Down
            [0, -1],  // Left
            [0, 1],   // Right
            [-1, -1], // Up-Left (diagonal)
            [-1, 1],  // Up-Right (diagonal)
            [1, -1],  // Down-Left (diagonal)
            [1, 1],   // Down-Right (diagonal)
        ];

        for (const [dx, dy] of directions) {

            dfs(row + dx, col +dy);

        }
    }
}


//! Toggle Grid

const toggleGrid = document.querySelector("#grid-toggle");

toggleGrid.addEventListener("click", () => {
    
    if (toggleGrid.dataset.toggle === "true") {
        
        toggleGrid.dataset.toggle = "false";
        
    } else {
        
        toggleGrid.dataset.toggle = "true";
        
    }
    
    createGridLines();
    
});


//! Clear Grid

const clearGrid = document.querySelector("#grid-clear");

clearGrid.addEventListener("click", () => {
    
    gridItems.forEach(gridItem => {
        
        gridItem.style.background = "transparent";
        
    });
});

//! Color Conversion

function rgbToHex(rgb) {

    rgbaValues = rgb.replace(/[rgba() ]/g, "").split(",");

    r = (+rgbaValues[0]).toString(16);
    g = (+rgbaValues[1]).toString(16);
    b = (+rgbaValues[2]).toString(16);

    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;

}

function rgbToHsl(rgb) {

    rgbaValues = rgb.replace(/[rgba() ]/g, "").split(",");

    r = (+rgbaValues[0]) / 255;
    g = (+rgbaValues[1]) / 255;
    b = (+rgbaValues[2]) / 255;

    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;

    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return [h,s,l];

}

function hslToHex(h,s,l) {
    s /= 100;
    l /= 100;
  
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c/2,
        r = 0,
        g = 0, 
        b = 0; 
  
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }

    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    return "#" + r + g + b;
}


//! Draw Functions

function createGridListeners() {

    canvasGrid.addEventListener("mousedown", gridClick);
    canvasGrid.addEventListener("mouseenter", gridEnter, true);
    canvasGrid.addEventListener("contextmenu", (e) => {

        e.preventDefault();

    });
}

function gridClick(e) {

    if (!e.target.classList.contains("grid-item")) return;

    if (e.buttons === 1) {
        //! Left Click

        switch (currentTool) {

            case "brushTool":

                e.target.style.background = brushColor;

                break;

            case "pickerTool":

                pickedColor = window.getComputedStyle(e.target).backgroundColor;

                if (pickedColor !== "rgba(0, 0, 0, 0)") {
        
                    brushColor = rgbToHex(pickedColor);
                    getBrushColor.value = brushColor;
        
                }

                break;
            
            case "fillTool":

                    colorFill(e);

                break;

            case "eraserTool":

                e.target.style.background = "transparent";

                break;

            case "lightenTool":

                if (window.getComputedStyle(e.target).backgroundColor !== "rgba(0, 0, 0, 0)") {

                    hsl = rgbToHsl(window.getComputedStyle(e.target).backgroundColor);

                    if (hsl[2] + 1 < 100) {

                        hsl[2] += 1;

                        e.target.style.background = hslToHex(hsl[0],hsl[1],hsl[2]);

                    }
                }

                break;

            case "darkenTool":

                if (window.getComputedStyle(e.target).backgroundColor !== "rgba(0, 0, 0, 0)") {

                    hsl = rgbToHsl(window.getComputedStyle(e.target).backgroundColor);

                    if (hsl[2] - 1 > 0) {

                        hsl[2] -= 1;
    
                        e.target.style.background = hslToHex(hsl[0],hsl[1],hsl[2]);

                    }
                }

                break;

        }


    } else if (e.buttons === 2) {
        //! right Click
        
        e.target.style.background = "transparent";

    } else if (e.buttons === 4) {
        //! Middle Click

        pickedColor = window.getComputedStyle(e.target).backgroundColor;

        console.log(pickedColor);

        if (pickedColor !== "rgba(0, 0, 0, 0)") {

            brushColor = rgbToHex(pickedColor);
            getBrushColor.value = brushColor;

        }
    }
}

function gridEnter(e) {
    
    if (!e.target.classList.contains("grid-item")) return;
    
    if (e.buttons === 1) {
        //! Left Click 

        switch (currentTool) {

            case "brushTool":

                e.target.style.background = brushColor;

                break;

            case "pickerTool":

                pickedColor = window.getComputedStyle(e.target).backgroundColor;

                if (pickedColor !== "rgba(0, 0, 0, 0)") {
        
                    brushColor = rgbaToHex(pickedColor);
                    getBrushColor.value = brushColor;
        
                }

                break;

            case "eraserTool":

                e.target.style.background = "transparent";

                break;

                case "lightenTool":

                if (window.getComputedStyle(e.target).backgroundColor !== "rgba(0, 0, 0, 0)") {

                    hsl = rgbToHsl(window.getComputedStyle(e.target).backgroundColor);

                    if (hsl[2] + 1 < 100) {

                        hsl[2] += 1;

                        e.target.style.background = hslToHex(hsl[0],hsl[1],hsl[2]);

                    }
                }

                break;

            case "darkenTool":

                if (window.getComputedStyle(e.target).backgroundColor !== "rgba(0, 0, 0, 0)") {

                    hsl = rgbToHsl(window.getComputedStyle(e.target).backgroundColor);

                    if (hsl[2] - 1 > 0) {

                        hsl[2] -= 1;
    
                        e.target.style.background = hslToHex(hsl[0],hsl[1],hsl[2]);

                    }
                }

                break;

        }

    } else if (e.buttons === 2) {
        //! right Click
        
        e.target.style.background = "transparent";

    } else if (e.buttons === 4) {
        //! Middle Click

        pickedColor = window.getComputedStyle(e.target).backgroundColor;

        if (pickedColor !== "rgba(0, 0, 0, 0)") {

            brushColor = rgbaToHex(pickedColor);
            getBrushColor.value = brushColor;

        }
    }
}

const controlsInfo = document.querySelector(".controls-info");
const controlsInfoBtn = document.querySelector(".controls-info-button");

controlsInfoBtn.addEventListener("click", () => {

    if (controlsInfoBtn.dataset.open === "true") {

        controlsInfoBtn.dataset.open = "false";
        controlsInfo.style.maxHeight = "0%";

    } else {

        controlsInfoBtn.dataset.open = "true";
        controlsInfo.style.maxHeight = "100%";

    }
});

const controls = document.querySelector(".controls");
const controlsMenuBtn = document.querySelector(".controls-menu-button");

controlsMenuBtn.addEventListener("click", () => {

    if (controlsMenuBtn.dataset.open === "true") {

        controlsMenuBtn.dataset.open = "false";
        controls.style.left = "-100%";

    } else {

        controlsMenuBtn.dataset.open = "true";
        controls.style.left = "0%";

    }
});

var maxWidth1162px = matchMedia("(max-width: 1162px)");

maxWidth1162px.addEventListener("change", () => {

    controlsMenuBtn.dataset.open = "false";

    if (maxWidth1162px.matches === true) {

        controls.style.left = "-100%";

    } else {

        controls.style.left = "auto";

    }
});


function start() {

    createGrid();
    
    //! Reset Color Inputs
    //* Without this the initial color after refreshing does not match 

    getBrushColor.value = "#000000";
    brushColor = getBrushColor.value;
    getBackgroundColor.value = "#ffffff";
    getGridBorderColor.value = "#404040";

}

start();