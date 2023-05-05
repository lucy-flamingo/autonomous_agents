
let theShader;
let art;
function preload(){
  theShader = loadShader('shader.vert', 'shader.frag');
}
let seed;

// flocking 
// different rules for seek and approach and bounde 
// boids with different steering behaviors in the same flock 

let t;
let boids = []; 

function setup() {
  seed = floor(random(1000));
  randomSeed(seed);
  noiseSeed(seed);
  size = windowWidth > windowHeight ? windowHeight : windowWidth;
  size *= 0.9;
  createCanvas(size, size, WEBGL);
  pixelDensity(2);
  noStroke();

  art = createGraphics(size,size,WEBGL);
  pg = createGraphics(1000,1000);
  pg.background(240);

  let n = 500; 
  for (let i = 0; i < n; i++) {
    v = new Boid(random(pg.width),random(pg.height));
    boids.push(v);
  }

}

function draw() {
  background(0);
  pg.background(230);
  art.clear();


  for (let v of boids) {
    v.applyRules(boids)
    v.boundaries_flow();
    v.update();
    v.display();
  }

  art.shader(theShader);
  theShader.setUniform('tex0', pg);
  theShader.setUniform('u_resolution', [art.width,art.height]);
  art.rect(0,0,width,height);

  image(art,-width/2,-height/2,width,height);
}

class Boid {
  constructor(x,y) {
    this.location = createVector(x,y); 
    this.velocity = createVector(random(-1,1),random(-1,1));
    this.acceleration = createVector(0,0);
    this.maxspeed = 5;
    this.maxforce = 0.2;
    // this.r = random(15,40); 
    this.r = 20;
  }

  //functions for creating targets and desires

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

  flow_field() {
    let xo = floor(this.location.x/10);
    let yo = floor(this.location.y/10);
    let to = frameCount/100;
    let a = map(noise(xo/10,yo/10,to),0,1,0,0.5*TWO_PI); 

    a += PI/2;

    let desired = createVector(cos(a), sin(a));

    return this.steer_to_desire(desired);
  }

  //functions creating forces 
  seek(target) {
    let desired = p5.Vector.sub(target,this.location);
    //desired.mult(-1);    //fleeing instead of seeking
    return this.steer_to_desire(desired);
  }

  separate(boids) {
    let d_sep = this.r*3; 
    let count = 0;
    let sum = createVector(0,0);
    for (let other of boids) {
      let d = this.location.dist(other.location);
      if ((d>0) && (d < d_sep)) {
        let diff = p5.Vector.sub(this.location,other.location);
        diff.normalize();
        diff.div(d);
        sum.add(diff);
        count += 1;
      }
    }

    if (count > 0) {
      sum.div(count);
    }

    return this.steer_to_desire(sum);
  }

  cohesion(boids) {
    let d_coh = 1000; 
    let count = 0;
    let sum = createVector(0,0);
    for (let other of boids) {
      let d = this.location.dist(other.location);
      if (d > d_coh) {
        let diff = p5.Vector.sub(this.location,other.location);
        diff.normalize();
        diff.div(d);
        sum.sub(diff);
        count += 1;
      }
    }

    if (count > 0) {
      sum.div(count);
    }

    return this.steer_to_desire(sum);
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

    return this.steer_to_desire(desired);
  }

  steer_to_desire(desired) {
    desired.setMag(this.maxspeed);
    let steer = p5.Vector.sub(desired,this.velocity);
    steer.limit(this.maxforce);
    return steer;
  }

  applyRules(boids) {

    let x = map(mouseX,0,width,0,pg.width);
    let y = map(mouseY,0,height,0,pg.height);

    let flow = this.flow_field(createVector(x,y)); 
    let separate = this.separate(boids);
    let cohesion = this.cohesion(boids);

    flow.mult(1.2);

    //this.applyForce(flow);
    this.applyForce(separate);
    this.applyForce(cohesion);
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

  boundaries_flow() {
    if (this.location.x < 0) {
      this.location.x = pg.width;
    }
    if (this.location.x > pg.width) {
      this.location.x = 0;
    }
    if (this.location.y < 0) {
      this.location.y = pg.height
    }
    if (this.location.y > pg.height) {
      this.location.y = 0;
    }     
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxspeed);
    this.location.add(this.velocity);
    this.acceleration.mult(0);
  }

  display() {
    pg.rectMode(CENTER);
    pg.fill(255,0,0);
    pg.noStroke();
    // pg.noFill();
    // pg.stroke(255,0,0);
    //pg.ellipse(this.location.x,this.location.y,this.r,this.r);

    let a = this.velocity.heading() + PI/2; 
    pg.push();
    pg.translate(this.location.x,this.location.y);
    pg.rotate(a);
    pg.rect(0,0,5,this.r);
    pg.pop();

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