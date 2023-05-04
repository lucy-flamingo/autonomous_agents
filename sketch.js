
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

}

function draw() {
  background(0);
  pg.background(240);
  art.clear();

  // let target = v.wandering();

  let desire = v.flow();

  v.seek_d(desire);
  // v.arrive(target);
  v.boundaries();
  v.update();
  v.display();

  art.shader(theShader);
  theShader.setUniform('tex0', pg);
  theShader.setUniform('u_resolution', [art.width,art.height]);
  art.rect(0,0,width,height);

  image(art,-width/2,-height/2,width,height);
}

class Vehicle {
  constructor(x,y) {
    this.location = createVector(x,y); 
    this.velocity = createVector(random(-1,1),random(-1,1));
    this.acceleration = createVector(0,0);
    this.maxspeed = 5;
    this.maxforce = 0.2;
  }

  seek(target) {
    let desired = p5.Vector.sub(target,this.location);
    desired.setMag(this.maxspeed);
    // desired.mult(-1);    //fleeing instead of seeking
    let steer = p5.Vector.sub(desired,this.velocity);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  }

  seek_d(desired) {
    desired.setMag(this.maxspeed);
    let steer = p5.Vector.sub(desired,this.velocity);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  }

  seek(target_loc,target_vel) {

    let target = target_loc.add(target_vel);

    let desired = p5.Vector.sub(target,this.location);
    desired.setMag(this.maxspeed);
    // desired.mult(-1);    //fleeing instead of seeking
    let steer = p5.Vector.sub(desired,this.velocity);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  }

  wandering() {
    let v = this.velocity.copy();
    v.normalize();
    let stepR = 100; 
    v.mult(stepR);

    let t1 = this.location.copy();
    t1.add(v);

    pg.fill(0,0,255);
    pg.noStroke();
    pg.ellipse(t1.x,t1.y,20,20);
    
    let wanderR = 50;
    pg.noFill();
    pg.stroke(0);
    pg.ellipse(t1.x,t1.y,wanderR*2,wanderR*2);

    let a = random(TWO_PI);
    let t2 = createVector(0,0);
    t2.x = t1.x + wanderR*cos(a);
    t2.y = t1.y + wanderR*sin(a);

    pg.fill(0,255,0);
    pg.noStroke();
    pg.ellipse(t2.x,t2.y,20,20);

    return t2;
  }

  flow() {
    let xo = this.location.x;
    let yo = this.location.y;
    let a = map(noise(xo,yo),0,1,0,TWO_PI); 

    return createVector(cos(a), sin(a));
  }

  arrive(target) {
    let desired = p5.Vector.sub(target,this.location);
    let d = desired.mag(); 
    desired.normalize(); //normalize the vector

    if (d < 100) { // let the speed slow down when it gets closer to the target
      let m = map(d,0,100,0,this.maxspeed);
      desired.mult(m);
    } else {
      desired.mult(this.maxspeed);
    }

    let steer = p5.Vector.sub(desired,this.velocity);
    steer.limit(this.maxforce);
    this.applyForce(steer);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  boundaries() {
    if (this.location.x < 75) {
      let desired = createVector(this.maxspeed,this.velocity.y);
      let steer = p5.Vector.sub(desired,this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
    if (this.location.x > pg.width - 75) {
      let desired = createVector(-this.maxspeed,this.velocity.y);
      let steer = p5.Vector.sub(desired,this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
    if (this.location.y < 75) {
      let desired = createVector(this.velocity.x,this.maxspeed);
      let steer = p5.Vector.sub(desired,this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
    if (this.location.y > pg.height - 75) {
      let desired = createVector(this.velocity.x,-this.maxspeed);
      let steer = p5.Vector.sub(desired,this.velocity);
      steer.limit(this.maxforce);
      this.applyForce(steer);
    }
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


/////////////////////////////
//////GENERAL FUNCTIONS//////
/////////////////////////////

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