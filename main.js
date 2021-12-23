class Receiver {
    constructor(x, y, r) {
       this.x = x;
       this.y = y;
       this.r = r;
    }
    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r, 0,2*Math.PI)
        ctx.lineWidth = 4;
        ctx.stroke();
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
        ctx.arc(this.x, this.y, this.r, 0,2*Math.PI)
        ctx.lineWidth = 4;
        ctx.stroke();
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
let receiver, transmitter;
let receivedMoleculeCount=0, receivedMoleculeElem;

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

function projectileFormation(){
    elem.innerHTML = " Please enter how many molecules you want to send from the transmitter."
    labelElem = document.createElement("input")
    labelElem.type="input"
    labelElem.id="projectileAmount"
    textDisplay.appendChild(labelElem);
    buttonElem = document.createElement("button")
    buttonElem.innerHTML = "Done"
    textDisplay.appendChild(br);
    textDisplay.appendChild(buttonElem);
    buttonElem.onclick = function(){
        if (labelElem.value == ""){
            alert("Not a valid value");
        } else if (labelElem.value>400){
            alert("Large values cause server to crash. Maximum value is set to 400.")
        } else {
            let projectileAmount = parseInt(labelElem.value);
            textDisplay.removeChild(elem);
            textDisplay.removeChild(labelElem);
            textDisplay.removeChild(buttonElem);
            textDisplay.removeChild(br)
            elem=document.createElement("p");
            textDisplay.insertBefore(elem, textDisplay.children[0]);
            elem.innerHTML="To start the animation click the button below; note that each time you clicked, new set of" +
                " projectiles will be thrown from the transmitter.";
            buttonElem = document.createElement("button")
            buttonElem.innerHTML = "Send Molecules"
            textDisplay.appendChild(br);
            textDisplay.appendChild(buttonElem);
            textDisplay.appendChild(br);
            let countText = document.createElement("p")
            countText.innerHTML = "Below you can see the received molecule count for the receiver";
            textDisplay.appendChild(countText)
            textDisplay.appendChild(receivedMoleculeElem)
            buttonElem.onclick = (()=>{
                sendProjectiles(projectileAmount);
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

function anim(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    transmitter.draw();
    receiver.draw();
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
            projectiles[i].dx *= -1;
        }
        if (projectiles[i].y<1 || projectiles[i].y>canvas.height ){
            projectiles[i].dy *= -1;
        }
        projectiles[i].x += projectiles[i].dx;
        projectiles[i].y += projectiles[i].dy;
        let transmitterDistance = Math.pow((projectiles[i].x-transmitter.x), 2)+Math.pow((projectiles[i].y-transmitter.y), 2)
        transmitterDistance = Math.sqrt(transmitterDistance);
        if (transmitterDistance < transmitter.r){
            projectiles[i].dx *=-1;
            projectiles[i].dy *=-1;
        }
        projectiles[i].x += projectiles[i].dx;
        projectiles[i].y += projectiles[i].dy;
        let receiverDistance = (projectiles[i].x-receiver.x)**2+(projectiles[i].y-receiver.y)**2
        receiverDistance = receiverDistance ** 0.5;
        if (receiverDistance<receiver.r){
            projectiles.splice(i, 1);
            receivedMoleculeCount+=1;
            receivedMoleculeElem.innerHTML = receivedMoleculeCount.toString();
        }
        projectiles[i].draw();
    }
    window.requestAnimationFrame(anim)

}
let clickEvent;
let drawnObject;
function clickAndDrag(){
    canvas.addEventListener('click', (e)=>{
        clickEvent=e;
        clickAndDragFunction()
        canvas.addEventListener('click', ()=>{
            canvas.removeEventListener('mousemove', mouseMove);
            if (drawnObject == "receiver"){
                projectileFormation()
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
    if (drawnObject=="transmitter"){
        transmitter = new Transmitter(centerX, centerY, radius);
        transmitter.draw()
    } else {
        receiver = new Receiver(centerX, centerY, radius);
        receiver.draw();
        transmitter.draw();
    }
}

function clickAndDragFunction(){
    canvas.addEventListener('mousemove', mouseMove)
}

document.addEventListener("DOMContentLoaded", function(event) {
    onLoad();
});