
let theShader;
let art;
function preload(){
  theShader = loadShader('shader.vert', 'shader.frag');
}
let seed;

let v; //vehicle
let t;

function setup() {
  seed = floor(random(1000));
  randomSeed(seed);
  size = windowWidth > windowHeight ? windowHeight : windowWidth;
  size *= 0.9;
  createCanvas(size, size, WEBGL);
  pixelDensity(2);
  noStroke();

  art = createGraphics(size,size,WEBGL);
  pg = createGraphics(2048,2048);
  pg.background(240);


  v = new Vehicle(pg.width/2,pg.height/2);
  t = createVector(pg.width/2,pg.height/2);

}

function draw() {
  background(0);
  art.clear();

  t.x = map(mouseX,0,width,0,pg.width);
  t.y = map(mouseY,0,height,0,pg.height);

  v.seek(t);
  v.update();
  v.display();

  console.log(mouseX);
  
  art.shader(theShader);
  theShader.setUniform('tex0', pg);
  theShader.setUniform('u_resolution', [art.width,art.height]);
  art.rect(0,0,width,height);

  image(art,-width/2,-height/2,width,height);
}



class Vehicle {
  constructor(x,y) {
    this.location = createVector(x,y); 
    this.velocity = createVector(0,0);
    this.acceleration = createVector(0,0);
    this.maxspeed = 5;
    this.maxforce = 0.2;
  }

  seek(target) {
    let desired = p5.Vector.sub(target,this.location);
    desired.setMag(this.maxspeed);
    let steer = p5.Vector.sub(desired,this.velocity);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.location.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    pg.fill(255,0,0);
    pg.noStroke();
    pg.ellipse(this.location.x,this.location.y,20,20);
  }

}



//////GENERAL FUNCTIONS//////


function doubleClicked() {
    let fs = fullscreen();
    fullscreen(!fs);
}

function windowResized() {
  size = windowWidth > windowHeight ? windowHeight : windowWidth;
  size *= 0.9;
  resizeCanvas(size,size);  
  art.resizeCanvas(size,size);
}

function exportHighRes() {
  art.resizeCanvas(5000,5000);
  draw();
  save(art, seed.toString(), 'png');
  art.resizeCanvas(size,size);
  draw();
}

function keyReleased() {
  if (key == 'e' || key == 'E') exportHighRes();
}