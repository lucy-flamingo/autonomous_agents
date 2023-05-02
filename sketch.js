
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
  t = new Target(mouseX,mouseY);

}

function draw() {
  background(0);
  pg.background(240);
  art.clear();

  //t.boundaries();
  t.update();
  //t.display();

  //v.seek(t.location,t.velocity);
  let target = v.wandering();
  v.arrive(target);
  v.update();
  v.display();

  art.shader(theShader);
  theShader.setUniform('tex0', pg);
  theShader.setUniform('u_resolution', [art.width,art.height]);
  art.rect(0,0,width,height);

  image(art,-width/2,-height/2,width,height);
}

class Target {
  constructor(x,y) {
    this.location = createVector(x,y); 
    this.velocity = createVector(random(15),random(15));
  }

  boundaries() {
    if (this.location.x < 0) {
      this.location.x = 0;
      this.velocity.x *= -1;
    }
    if (this.location.x > pg.width) {
      this.location.x = pg.width;
      this.velocity.x *= -1;
    }
    if (this.location.y < 0) {
      this.location.y = 0;
      this.velocity.y *= -1;
    }
    if (this.location.y > pg.height) {
      this.location.y = pg.height;
      this.velocity.y *= -1;
    }
  }

  update() {
    // this.location.add(this.velocity);
    this.location.x = map(mouseX,0,width,0,pg.width);
    this.location.y = map(mouseY,0,height,0,pg.height);
  }

  display() {
    pg.fill(0,255,255);
    pg.noStroke();
    //pg.ellipse(this.location.x,this.location.y,30,30);
  }
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

  // seek(target_loc,target_vel) {

  //   let target = target_loc.add(target_vel);

  //   let desired = p5.Vector.sub(target,this.location);
  //   desired.setMag(this.maxspeed);
  //   // desired.mult(-1);    //fleeing instead of seeking
  //   let steer = p5.Vector.sub(desired,this.velocity);
  //   steer.limit(this.maxforce);
  //   this.applyForce(steer);
  // }

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

  update() {

    // this.maxspeed = map(noise(this.location.x,this.location.y),0,1,5,15) + random();
    // this.maxforce = map(noise(this.location.x+100,this.location.y-100),0,1,0.2,0.8) + random(0.1);

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