let canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
w = canvas.width;
h = canvas.height;

var prevX = 0;
var currX = 0;
var prevY = 0;
var currY = 0;
var flag = false;

canvas.addEventListener(
    "mousemove",
    function(e) {
        findxy(e);
    },
    false
);
canvas.addEventListener(
    "mousedown",
    function(e) {
        findxy(e);
    },
    false
);
canvas.addEventListener(
    "mouseup",
    function(e) {
        findxy(e);
    },
    false
);
canvas.addEventListener(
    "mouseout",
    function(e) {
        findxy(e);
    },
    false
);

function draw() {
    ctx.moveTo(prevX, prevY); // positions drawing cursor
    ctx.lineTo(currX, currY);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function findxy(e) {
    if (e.type == "mousedown") {
        prevX = currX;
        prevY = currY;
        currX = e.offsetX;
        currY = e.offsetY;
        flag = true;
    }
    if (e.type == "mouseup" || e.type == "mouseout") {
        flag = false;
        var dataURL = canvas.toDataURL();
        var signature = document.getElementById("signature");
        signature.value = dataURL;
        console.log("dataURL: ", dataURL);
        var img = new Image();
        img.src = dataURL;
    }
    if (e.type == "mousemove") {
        if (flag) {
            prevX = currX;
            prevY = currY;
            currX = e.offsetX;
            currY = e.offsetY;
            draw();
            // sets the value of the hidden input field 'signature' to what users have drawn
        }
    }
}

// touch Event for mobile signing - copied from the bencentra site
canvas.addEventListener(
    "touchstart",
    function(e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    },
    false
);

canvas.addEventListener(
    "touchend",
    function(e) {
        var mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    },
    false
);

canvas.addEventListener(
    "touchmove",
    function(e) {
        var touch = e.touches[0];
        var mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    },
    false
);

// Prevent scrolling when touching the canvas
document.body.addEventListener(
    "touchstart",
    function(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    },
    false
);
document.body.addEventListener(
    "touchend",
    function(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    },
    false
);
document.body.addEventListener(
    "touchmove",
    function(e) {
        if (e.target == canvas) {
            e.preventDefault();
        }
    },
    false
);
