class Receiver {
    constructor(x, y, r) {
       this.x = x;
       this.y = y;
       this.r = r;
    }
    draw(){
        ctx.beginPath()
        ctx.fillStyle = "white";
        ctx.arc(this.x, this.y, this.r, 0,2*Math.PI)
        ctx.lineWidth = 4;
        ctx.fill();
        ctx.stroke();
        ctx.font = "15px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText("Receiver", this.x, this.y);
    }
}

class Transmitter{
    constructor(x, y, r){
        this.x = x;
        this.y = y;
        this.r = r;
    }
    draw(){
        ctx.beginPath()
        ctx.fillStyle = "white";
        ctx.arc(this.x, this.y, this.r, 0,2*Math.PI)
        ctx.lineWidth = 4;
        ctx.fill();
        ctx.stroke();
        ctx.font = "15px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText("Transmitter", this.x, this.y);
    }
}

class Arrow{
    constructor(begin_x, begin_y, end_x, end_y){
        this.begin_x = begin_x;
        this.begin_y = begin_y;
        this.end_x = end_x
        this.end_y = end_y;
    }

    draw(){
        ctx.beginPath()
        var headlen = 10;
        var dx = this.end_x -  this.begin_x;
        var dy = this.end_y -  this.begin_y;
        var angle = Math.atan2(dy, dx);
        ctx.moveTo(this.begin_x, this.begin_y);
        ctx.lineTo(this.end_x, this.end_y);
        ctx.lineTo(this.end_x - headlen * Math.cos(angle - Math.PI / 6), this.end_y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(this.end_x, this.end_y);
        ctx.lineTo(this.end_x - headlen * Math.cos(angle + Math.PI / 6), this.end_y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
    }

    calculateOrientation(){
        return -Math.round(Math.atan((this.end_y-this.begin_y)/ (this.end_x - this.begin_x))*100)/100;
    }

    calculateIntensity(){
        return Math.round(Math.sqrt(Math.pow(this.end_y-this.begin_y, 2) + Math.pow(this.end_x-this.begin_x, 2)))
    }

    calculateCanvasSections(){
        let m;
        if ((this.end_x - this.begin_x) === 0 ){
            m = 9999999;
        } else {
            m = ((this.end_y-this.begin_y)/ (this.end_x - this.begin_x));
        }
        let b = this.end_y - this.end_x*m
        let left_x, left_y, right_x, right_y;

        if (b >= 0 && b<=canvas.height){
            left_x = 0;
            left_y = b;
        }

        if (b<0){
            left_x = -b / m;
            left_y = 0;
        }

        if (b>canvas.height){
            left_x = (canvas.height-b) / m;
            left_y = canvas.height;
        }

        if (m*canvas.width+b >= 0 && m*canvas.width+b<=canvas.height){
            right_x = canvas.width;
            right_y = m*canvas.width+b;
        }

        if (m*canvas.width + b < 0 ){
            right_x = -b / m;
            right_y = 0;
        }

        if (m*canvas.width + b > canvas.height){
            right_x = (canvas.height-b) / m;
            right_y = canvas.height;
        }

        if ((Math.pow((this.begin_x - left_x),2)+Math.pow((this.begin_y - left_y),2))<=(Math.pow((this.end_x - left_x),2)+Math.pow((this.end_y - left_y),2))){
            return {
                source: {
                    x: left_x,
                    y: left_y,
                },
                to : {
                    x: right_x,
                    y: right_y,
                }
            }
        } else {
            return {
                to: {
                    x: left_x,
                    y: left_y,
                },
                source : {
                    x: right_x,
                    y: right_y,
                }
            }
        }

    }
}

class Projectile {
    constructor(x, y, dx, dy) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.opacity= true;
    }
    draw(){
        if (this.opacity){
            ctx.fillStyle = "rgba(0,0,0,1)";
        }   else {
            ctx.fillStyle = "rgba(0,0,0,0)";
        }
        ctx.fillRect(this.x, this.y, 2, 2);
    }
}

let elem, labelElem, buttonElem, canvas, textDisplay, ctx, h1;
let br = document.createElement("br");
let receiver, transmitter, arrow;
let receivedMoleculeCount=0, receivedMoleculeElem;
let gradientStatus = false;
let singleProjectionSource = false;

let biasX = 0;
let biasY = 0;

receivedMoleculeElem = document.createElement("p");
receivedMoleculeElem.id = "receivedCount";
receivedMoleculeElem.innerHTML = receivedMoleculeCount.toString();

function onLoad(){
    h1 = document.getElementById("heading");
    h1.style.position="absolute";
    h1.style.top="10%"
    h1.style.left = "30px"
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext("2d");
    textDisplay = document.getElementById('textDisplay')
    canvas.style.position = "absolute"
    canvas.width =800;
    canvas.height=window.innerHeight*11/20;
    canvas.style.borderStyle = "solid"
    textDisplay.style.position = "fixed"
    canvas.style.top = "20%";
    canvas.style.left = "30px"
    textDisplay.style.top = "19%";
    textDisplay.style.left = "850px";
    elem = document.createElement("p");
    textDisplay.appendChild(elem);
    elem.innerHTML = "Please click for the transmitter center, move your mouse to adjust size then click for finalize" +
        " size.";
    drawnObject="transmitter"
    clickAndDrag()
}

function insertNewLine(textDisplay){
    let brNew = document.createElement("br")
    textDisplay.appendChild(brNew);
}

function removeAllElements(textDisplay){
    let totalLength = textDisplay.childNodes.length;
    for (let i = 0; i <totalLength; i ++) {
        textDisplay.removeChild(textDisplay.childNodes[0]);
        }
}

function removeAllElementsExceptFirstOne(textDisplay){
    let totalLength = textDisplay.childNodes.length;
    for (let i = 0; i <totalLength-1; i ++) {
        textDisplay.removeChild(textDisplay.childNodes[1]);
    }
}

function insertText(textDisplay, textLine){
    let text = document.createElement("p");
    text.innerHTML = textLine
    textDisplay.appendChild(text)
}

function insertButton(textDisplay, buttonName){
    let buttonElem = document.createElement("button");
    buttonElem.innerHTML = buttonName;
    textDisplay.appendChild(buttonElem);
    return buttonElem;
}

function calculateClosestDistance(t, r){
    let distance = Math.pow((t.x-r.x), 2) + Math.pow((t.y-r.y), 2)
    distance = Math.sqrt(distance)
    return distance - t.r - r.r
}

function calculateGradientSession(){
    gradientStatus = true;
    removeAllElements(textDisplay);
    insertText(textDisplay, "Please click for the gradient orientation, depending on the selected length the insensity of the gradient will change.")
    canvas.addEventListener('click', (e)=>{
        clickEvent=e;
        clickAndDragArrowFunction()
        canvas.addEventListener('click', ()=>{
            canvas.removeEventListener('mousemove', mouseMoveArrow);
            sourceOptions();
        }, {once: true})
    } , {once: true})
}

let stopAnimation = false;
function resetAll(){
    receivedMoleculeCount = 0;
    gradientStatus = false;
    removeAllElements(textDisplay);
    stopAnimation = true;
    projectiles = [];
    biasX = 0;
    biasY = 0;
    onLoad();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let stopAnimationatSurface = false;
function resetSurface(){
    receivedMoleculeCount = 0;
    receivedMoleculeElem.innerHTML = receivedMoleculeCount.toString();
    removeAllElements(textDisplay);
    stopAnimationatSurface=true;
    biasX = 0;
    biasY = 0;
    projectiles = [];
    singleProjectionSource = false;
    sourceOptions();
}

let stopAnimationatGradient = false;
function resetGradient(){
    receivedMoleculeCount = 0;
    removeAllElements(textDisplay);
    receivedMoleculeElem.innerHTML = receivedMoleculeCount.toString();
    stopAnimationatGradient=true;
    biasX = 0;
    biasY = 0;
    projectiles = [];
    singleProjectionSource = false;
    gradientStatus =false;
    showButtons();
}

function drawGradientLines(){
    if (gradientStatus){
        let maxIntensity = Math.sqrt(Math.pow(canvas.width,2)+Math.pow(canvas.height,2))
        let begin_x = arrow.calculateCanvasSections().source.x;
        let begin_y = arrow.calculateCanvasSections().source.y;
        let end_x = arrow.calculateCanvasSections().to.x;
        let end_y = arrow.calculateCanvasSections().to.y;
        let toValueX = ((end_x  - begin_x) * arrow.calculateIntensity()/maxIntensity*2) + begin_x;
        let toValueY = ((end_y  - begin_y) * arrow.calculateIntensity()/maxIntensity*2) + begin_y;
        var grd = ctx.createLinearGradient(begin_x, begin_y, toValueX, toValueY);
        grd.addColorStop(0,"#7FFFD4");
        grd.addColorStop(1,"white");
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,canvas.width,canvas.height);
    }
}

function sourceOptions(){
    removeAllElements(textDisplay);
    insertText(textDisplay, "Please choose the projection source: ")
    singleProjection = insertButton(textDisplay, "Closest point to receiver on transmitter")
    textDisplay.appendChild(document.createTextNode( '\u00A0\u00A0' ));
    surfaceProjection = insertButton(textDisplay, "Entire transmitter surface");
    singleProjection.onclick = (()=>{
        singleProjectionSource = true;
        projectileFormation();
    })
    surfaceProjection.onclick = (()=>{
        projectileFormation();
    })
}

function projectileFormation(){
    removeAllElements(textDisplay);
    insertText(textDisplay, "Please enter how many molecules you want to send from the transmitter.")
    labelElem = document.createElement("input")
    labelElem.type="input"
    labelElem.id="projectileAmount"
    textDisplay.appendChild(labelElem);
    buttonElem = document.createElement("button")
    buttonElem.innerHTML = "Done"
    textDisplay.appendChild(br);
    textDisplay.appendChild(buttonElem);
    buttonElem.onclick = function(){
        if (labelElem.value === ""){
            alert("Not a valid value");
        } else if (labelElem.value>3500){
            alert("Large values cause server to crash. Maximum value is set to 3500.")
        } else {
            let projectileAmount = parseInt(labelElem.value);
            removeAllElements(textDisplay)
            insertNewLine(textDisplay);
            buttonElem = document.createElement("button")
            buttonElem.innerHTML = "Send Molecules"
            textDisplay.appendChild(buttonElem);
            textDisplay.appendChild(br);
            insertText(textDisplay,"Below you can see the received molecule count for the receiver")
            textDisplay.appendChild(receivedMoleculeElem)
            buttonElem.onclick = (()=>{
                stopAnimation = false;
                stopAnimationatSurface=false;
                stopAnimationatGradient =false;
                if (gradientStatus){
                    biasX = arrow.calculateIntensity() * (arrow.calculateCanvasSections().to.x - arrow.calculateCanvasSections().source.x) / canvas.width/1500;
                    biasY = arrow.calculateIntensity() * (arrow.calculateCanvasSections().to.y - arrow.calculateCanvasSections().source.y) / canvas.height/1500;
                }
                if (!singleProjectionSource){
                    sendProjectiles(projectileAmount);
                } else {
                    sendProjectilesFromSingleSource(projectileAmount);
                }
                textDisplay.removeChild(buttonElem);
                textDisplay.appendChild(br);
                textDisplay.removeChild(textDisplay.childNodes[0])
                let resetAllButton = insertButton(textDisplay, "Reset All");
                resetAllButton.onclick = resetAll;
                textDisplay.appendChild(document.createTextNode( '\u00A0\u00A0' ));
                let resetSurfaceButton = insertButton(textDisplay, "Reset Surface/Closest Point Choice")
                resetSurfaceButton.onclick = resetSurface;
                textDisplay.appendChild(document.createTextNode( '\u00A0\u00A0' ));
                let resetGradientButton = insertButton(textDisplay, "Reset Gradient Settings")
                resetGradientButton.onclick = resetGradient;
            })
        }
    }
}

let projectiles = [];

function sendProjectiles(projectileAmount){
    for (let i = 0; i < projectileAmount; i++) {
        let randomAngleMultiplier = 2*Math.PI * Math.random()
        let signMultiplier = Math.random() > 0.5 ? -1 : 1;
        let startingX = signMultiplier*Math.cos(randomAngleMultiplier)*transmitter.r + transmitter.x
        let startingY = signMultiplier*Math.sin(randomAngleMultiplier)*transmitter.r + transmitter.y
        projectiles.push(new Projectile(startingX, startingY, 1, 1))
    }
    anim();
}

function sendProjectilesFromSingleSource(projectileAmount){
    let distance = calculateClosestDistance(transmitter, receiver) + transmitter.r +receiver.r;
    let startingX = transmitter.x + (transmitter.r/distance)*(receiver.x - transmitter.x)
    let startingY = transmitter.y + (transmitter.r/distance)*(receiver.y - transmitter.y)
    for (let i = 0; i < projectileAmount; i++) {
        projectiles.push(new Projectile(startingX, startingY, 1, 1))
    }
    anim();
}

function anim(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (stopAnimation) {
        return;
    }
    if (stopAnimationatGradient) {
        transmitter.draw();
        receiver.draw();
        return;
    }
    drawGradientLines();
    transmitter.draw();
    receiver.draw();
    if (stopAnimationatSurface){
        return;
    }
    for (let i = 0; i < projectiles.length; i++) {
        let direction = Math.random() * 4;
        if (direction<1){
            projectiles[i].dx = 0;
            projectiles[i].dy = 1;
        } else if (direction<2) {
            projectiles[i].dx = 0;
            projectiles[i].dy = -1;
        } else if (direction<3) {
            projectiles[i].dx = 1;
            projectiles[i].dy = 0;
        }  else if (direction<4) {
            projectiles[i].dx = -1;
            projectiles[i].dy = 0;
        }
        if (projectiles[i].x<1 || projectiles[i].x>canvas.width ){
            projectiles[i].dx *= -5;
        } else {
            projectiles[i].dx = (projectiles[i].dx + biasX) * Math.abs(projectiles[i].dx);
        }
        if (projectiles[i].y<1 || projectiles[i].y>canvas.height ){
            projectiles[i].dy *= -5;
        }  else {
            projectiles[i].dy = (projectiles[i].dy + biasY)* Math.abs(projectiles[i].dy);
        }

        projectiles[i].x += projectiles[i].dx;
        projectiles[i].y += projectiles[i].dy;
        let transmitterDistance = Math.pow((projectiles[i].x-transmitter.x), 2)+Math.pow((projectiles[i].y-transmitter.y), 2)
        transmitterDistance = Math.sqrt(transmitterDistance);
        if (transmitterDistance < transmitter.r){
            projectiles[i].dx *=-5;
            projectiles[i].dy *=-5;
            projectiles[i].x += projectiles[i].dx;
            projectiles[i].y += projectiles[i].dy;
        }


        let receiverDistance = (projectiles[i].x-receiver.x)**2+(projectiles[i].y-receiver.y)**2
        receiverDistance = receiverDistance ** 0.5;
        if (receiverDistance<receiver.r){
            projectiles.splice(i, 1);
            receivedMoleculeCount+=1;
            receivedMoleculeElem.innerHTML = receivedMoleculeCount.toString();
        }
        try {
            projectiles[i].draw();
        } catch (e) {
            console.log(e);
        }

    }
    window.requestAnimationFrame(anim)
}

function showButtons(){
    removeAllElements(textDisplay);
    transmitterText = "Transmitter's radius is "+  Math.round(transmitter.r) + "px."
    receiverText = " Receiver's radius is "+ Math.round(receiver.r) + "px."
    closestDistanceText = " Closest surface distance is " +
        Math.round(calculateClosestDistance(transmitter, receiver)) + "px."
    insertText(textDisplay, transmitterText + receiverText+ closestDistanceText);
    insertText(textDisplay, "Do you want gradient to be enabled?")
    gradientEnabled = insertButton(textDisplay, "Yes")
    textDisplay.appendChild(document.createTextNode( '\u00A0\u00A0' ));
    gradientDisabled = insertButton(textDisplay, "No");
    gradientEnabled.onclick =  calculateGradientSession;
    gradientDisabled.onclick = sourceOptions;
}

let clickEvent;
let drawnObject;
function clickAndDrag(){
    canvas.addEventListener('click', (e)=>{
        clickEvent=e;
        clickAndDragFunction()
        canvas.addEventListener('click', ()=>{
            canvas.removeEventListener('mousemove', mouseMove);
            if (drawnObject === "receiver"){
                showButtons()
            }   else {
                drawnObject="receiver";
                elem.innerHTML = "Now repeat the same actions for the receiver.";
                clickAndDrag();
            }
        }, {once: true})
    } , {once: true})
}

function mouseMove(event){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let centerX = clickEvent.offsetX;
    let centerY = clickEvent.offsetY;
    let radius = Math.pow((event.offsetX-centerX),2)+Math.pow((event.offsetY-centerY),2)
    radius=Math.sqrt(radius);
    if (drawnObject==="transmitter"){
        transmitter = new Transmitter(centerX, centerY, radius);
        transmitter.draw()
    } else {
        receiver = new Receiver(centerX, centerY, radius);
        receiver.draw();
        transmitter.draw();
    }
}

function mouseMoveArrow(event){
    removeAllElementsExceptFirstOne(textDisplay);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let beginX = clickEvent.offsetX;
    let beginY = clickEvent.offsetY;
    let endX = event.offsetX;
    let endY = event.offsetY;
    arrow = new Arrow(beginX, beginY, endX, endY);
    drawGradientLines();
    transmitter.draw();
    receiver.draw();
    arrow.draw();
    insertText(textDisplay, "The gradient angle is " + arrow.calculateOrientation())
    insertText(textDisplay, "The gradient density is " + arrow.calculateIntensity())
}

function clickAndDragFunction(){
    canvas.addEventListener('mousemove', mouseMove)
}

function clickAndDragArrowFunction(){
    canvas.addEventListener('mousemove', mouseMoveArrow)
}

document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});