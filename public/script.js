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
