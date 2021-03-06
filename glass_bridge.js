import {defs, tiny} from './examples/common.js';
import {widgets} from '../tiny-graphics-widgets.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;


const glass_width = 6;
const{ Axis_Arrows } = defs

class Cube extends Shape {
    constructor() {
        super("position", "normal",);
        // Loop 3 times (for each axis), and inside loop twice (for opposing cube sides):
        this.arrays.position = Vector3.cast(
            [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
            [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]);
        this.arrays.normal = Vector3.cast(
            [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
            [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
            [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
        // Arrange the vertices into a square shape in texture space too:
        this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
            14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);

        this.initial_camera_location = Mat4.look_at(vec3(0, 10, 20), vec3(0, 0, 0), vec3(0, 1, 0));
    }
}

class Cube_Outline extends Shape {
    constructor() {
        super("position", "color");
        //  TODO (Requirement 5).
        // When a set of lines is used in graphics, you should think of the list entries as
        // broken down into pairs; each pair of vertices will be drawn as a line segment.
        // Note: since the outline is rendered with Basic_shader, you need to redefine the position and color of each vertex
        this.arrays.position = Vector3.cast(
            [-1, 1, 1], [1, 1, 1], [-1, 1, -1], [1, 1, -1], [-1, -1, 1], [1, -1, 1], [-1, -1, -1], [1, -1, -1], //horizontal
            [-1, 1, 1], [-1, 1, -1], [1, 1, 1], [1, 1, -1], [-1, -1, 1], [-1, -1, -1], [1, -1, 1], [1, -1, -1], //vertical
            [-1, 1, 1], [-1, -1, 1], [1, 1, 1], [1, -1, 1], [-1, 1, -1], [-1, -1, -1], [1, 1, -1], [1, -1, -1], //height

        );

        this.arrays.color = Vector3.cast(
            [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1],
            [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1],
            [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1]
        );

        this.indices = false;   //Do not make an indices list - instead use "this.indices = false
    }
}

class Cube_Single_Strip extends Shape {
    constructor() {
        super("position", "normal");
        // TODO (Requirement 6)
        this.arrays.position = Vector3.cast([-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, -1, -1]); //Upper 4 vertices
        this.arrays.normal = Vector3.cast([-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1], [-1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, -1, -1]);   //Lower 4 vertices
        this.indices.push(0, 1, 2, 0, 2, 3, 0, 3, 7, 0, 7, 4, 4, 7, 6, 4, 6, 5, 6, 5, 1, 1, 6, 2, 6, 2, 7, 2, 7, 3, 4, 5, 1, 4, 1, 0);
    }
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
  

class Base_Scene extends Scene {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();
        this.hover = this.swarm = false;
        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            'sphere' : new defs.Subdivision_Sphere(4),
            'cube': new Cube(),
            'outline': new Cube_Outline(),
            'strip' : new Cube_Single_Strip(),
            'axis' : new Axis_Arrows(),
        };

        // *** Materials
        this.materials = {
            sphere: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: .6, color: color(1, 1, 1, 1)}),
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: 1, color: hex_color("#ffffff")}),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
        
//         this.random_number2 = Math.floor(Math.random() * 10);
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.
        
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(this.camera_location);
//             program_state.set_camera(this.initial_camera_location);
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}

export class GlassBridge extends Base_Scene {

    constructor(){
        super();
        this.go_left();
        this.go_right();
        this.boxColors;
        this.inmotion = false;
        this.lastmotion = "none";
        this.stepstaken = 0;
        this.num_glasses = 100;
        this.ball_transform = Mat4.identity().times(Mat4.translation(0, 2.5, 6)).times(Mat4.scale(1.5, 1.5, 1.5));
        this.random_number = Number((Math.random() * Math.pow(10, this.num_glasses)));
        this.lives = 10;
        this.checkpoint = 10;
        this.ypos = 0;
        this.yvel = 0;
        this.grav = 0.7;
        this.height = 0;
        this.bouncestart = false;
        this.fallStart = false;
        this.lightup = false;
        this.time_left = 0;
        this.gameover = false;
        this.camera_location = Mat4.identity().times(Mat4.translation(0, -10, -30));
//         this.glass_color = hex_color("#C6F7FF", 0.8);
//         this.tempered_glass_color = hex_color("#60A8C1", 0.8);
        this.glass_color_list = [hex_color("#C6F7FF", 0.8)];
        this.tempered_glass_color_list = [hex_color("#60A8C1", 0.8)];
        this.offset = 0;
        

        this.ballPos = []; // keeps track of ith jump: -1 if left, 1 if right, 0 if not jumped yet
        
        this.shatterArgs = []; // holds shatter() arguments for persistence: z, side, time, color
        this.ps; // program_state

        this.posIndex = 0;
        this.isTemperedGlass = [];
        this.isOnTemperedGlass = true;

        // Random number generation
        this.randArr = [];
        for (let i = 0; i < 18; i++) {
            this.randArr.push(getRandomArbitrary(.3, 2));
        }
        this.randSign = [];
        for (let i = 0; i < 8; i++) {
            this.randSign.push(Math.random() < 0.5 ? -1 : 1);
        }
        this.rand1 = Math.random();
        this.rand2 = Math.random();
        this.rand3 = Math.random();
        
        this.doneRespawning = true;
    }

    shatter(z, side, context, program_state, t0, col) {
    // z = z pos of front end of panel
    // side = -1 for left, 1 for right
    
        let frag1 = (Mat4.translation(side*t0*this.randArr[0], -(t0**2), t0*this.randArr[1]))
            .times(Mat4.translation(side*8, 0, z-1))
            .times(Mat4.rotation(t0, -1, 1, -1))
            .times(Mat4.scale(1, 1, 1));
            //.times(Matrix.of([1, 0, .3, 0], [0, 1, .3, 0], [0, 0, 1, 0], [0, 0, 0, 1]));
        
        let frag2 = (Mat4.translation(t0*this.randArr[2]*this.randSign[0], -(t0**2), t0*this.randArr[3]))
            .times(Mat4.translation(side*6, 0, z-1))
            .times(Mat4.rotation(t0, -1, 0, 0))
            .times(Mat4.scale(1, 1, 1));
            //.times(Matrix.of([1, 0, .3, 0], [0, 1, .3, 0], [0, 0, 1, 0], [0, 0, 0, 1]));

        let frag3 = (Mat4.translation(-side*t0*this.randArr[4], -(t0**2), t0*this.randArr[5]))
            .times(Mat4.translation(side*4, 0, z-1))
            .times(Mat4.rotation(t0, -1, -1, 1))
            .times(Mat4.scale(1, 1, 1));
            //.times(Matrix.of([1, 0, -.3, 0], [0, 1, -.3, 0], [0, 0, 1, 0], [0, 0, 0, 1]));            

        let frag4 = (Mat4.translation(side*t0*this.randArr[6], -(t0**2), t0*this.randArr[7]*this.randSign[1]))
            .times(Mat4.translation(side*8, 0, z-3))
            .times(Mat4.rotation(t0, 0, 0, -1))
            .times(Mat4.scale(1, 1, 1));
            //.times(Matrix.of([1, 0, .3, 0], [0, 1, .3, 0], [0, 0, 1, 0], [0, 0, 0, 1]));

        let frag5 = (Mat4.translation(t0*this.randArr[8]*this.randSign[2], -(t0**2), t0*this.randArr[9]*this.randSign[3]))
            .times(Mat4.translation(side*6, 0, z-3))
            .times(Mat4.rotation(t0, this.rand1, this.rand2, this.rand3))
            .times(Mat4.scale(1, 1, 1))

        let frag6 = (Mat4.translation(-side*t0*this.randArr[10], -(t0**2), t0*this.randArr[11]*this.randSign[4]))
            .times(Mat4.translation(side*4, 0, z-3))
            .times(Mat4.rotation(t0, 0, 0, 1))
            .times(Mat4.scale(1, 1, 1))
            //.times(Matrix.of([1, 0, -.3, 0], [0, 1, -.3, 0], [0, 0, 1, 0], [0, 0, 0, 1]));            

        let frag7 = (Mat4.translation(side*t0*this.randArr[12], -(t0**2), -t0*this.randArr[13]))
            .times(Mat4.translation(side*8, 0, z-5))
            .times(Mat4.rotation(t0, 1, 1, -1))
            .times(Mat4.scale(1, 1, 1))
            //.times(Matrix.of([1, 0, .3, 0], [0, 1, .3, 0], [0, 0, 1, 0], [0, 0, 0, 1]));
        
        let frag8 = (Mat4.translation(t0*this.randArr[14]*this.randSign[5], -(t0**2), -t0*this.randArr[15]))
            .times(Mat4.translation(side*6, 0, z-5))
            .times(Mat4.rotation(t0, 1, 0, 0))
            .times(Mat4.scale(1, 1, 1))
            //.times(Matrix.of([1, 0, .3, 0], [0, 1, .3, 0], [0, 0, 1, 0], [0, 0, 0, 1]));

        let frag9 = (Mat4.translation(-side*t0*this.randArr[16], -(t0**2), -t0*this.randArr[17]))
            .times(Mat4.translation(side*4, 0, z-5))
            .times(Mat4.rotation(t0, 1, 1, 1))
            .times(Mat4.scale(1, 1, 1))
            //.times(Matrix.of([1, 0, -.3, 0], [0, 1, -.3, 0], [0, 0, 1, 0], [0, 0, 0, 1]));
       

        this.shapes.cube.draw(context, program_state, frag1, this.materials.plastic.override({color:col}));
        this.shapes.cube.draw(context, program_state, frag2, this.materials.plastic.override({color:col}));
        this.shapes.cube.draw(context, program_state, frag3, this.materials.plastic.override({color:col}));
        this.shapes.cube.draw(context, program_state, frag4, this.materials.plastic.override({color:col}));
        this.shapes.cube.draw(context, program_state, frag5, this.materials.plastic.override({color:col}));
        this.shapes.cube.draw(context, program_state, frag6, this.materials.plastic.override({color:col}));
        this.shapes.cube.draw(context, program_state, frag7, this.materials.plastic.override({color:col}));
        this.shapes.cube.draw(context, program_state, frag8, this.materials.plastic.override({color:col}));
        this.shapes.cube.draw(context, program_state, frag9, this.materials.plastic.override({color:col}));
         
    }

    go_left() {
        if(this.inmotion || this.gameover || !this.doneRespawning){
            return;
        }
        if(!this.ball_transform){
            return;
        }
        this.inmotion = true;
        if(this.lastmotion == "none"){
            this.ball_transform = this.ball_transform.times(Mat4.translation(-3.5, 0, -5));
            this.lastmotion = "left";
        }
        else if(this.lastmotion == "left"){
            this.ball_transform = this.ball_transform.times(Mat4.translation(0, 0, -6));
        }
        else{
            this.ball_transform = this.ball_transform.times(Mat4.translation(-7, 0, -6));
            this.lastmotion = "left";
        }


        if(this.isTemperedGlass[this.posIndex] == -1){
            this.isOnTemperedGlass = true;
        }else{
            this.isOnTemperedGlass = false;
            this.doneRespawning = false;
        }

        if(!this.isOnTemperedGlass){
            //this.inmotion = false;
            this.fallThrough();
            this.lives--;
            if(this.lives == 0){
                this.gameover = true;
            }
        }else{
            this.inmotion = false;
            this.bounce();
        }
//         this.bounce();
        this.inmotion = true;
        this.stepstaken += 1;
        this.ballPos.push(-1);
        if(this.isTemperedGlass == -1) {
            this.shatterArgs.push([(this.stepstaken-1)*(-9)+1, 
                                    this.isTemperedGlass[this.stepstaken-1],
                                    this.ps.animation_time/1000,
                                    this.tempered_glass_color_list[Math.floor(this.stepstaken/10)]]);
        } else {
            this.shatterArgs.push([(this.stepstaken-1)*(-9)+1, 
                                    this.isTemperedGlass[this.stepstaken-1],
                                    this.ps.animation_time/1000,
                                    this.glass_color_list[Math.floor(this.stepstaken/10)]]);
        }
        this.posIndex++;
    }

    go_right(){
        if(this.inmotion || this.gameover || !this.doneRespawning){
            return;
        }
        if(!this.ball_transform){
            return;
        }
        this.inmotion = true;
        if(this.lastmotion == "none"){
            this.ball_transform = this.ball_transform.times(Mat4.translation(3.5, 0, -5));
            this.lastmotion = "right";
        }
        else if(this.lastmotion == "left"){
            this.ball_transform = this.ball_transform.times(Mat4.translation(7, 0, -6));
            this.lastmotion = "right";
        }
        else{
            this.ball_transform = this.ball_transform.times(Mat4.translation(0, 0, -6));
        }

        if(this.isTemperedGlass[this.posIndex] == 1){
            this.isOnTemperedGlass = true;
        }else{
            this.isOnTemperedGlass = false;
            this.doneRespawning = false;
        }

        if(!this.isOnTemperedGlass){
            //this.inmotion = false;
            this.fallThrough();
            this.lives--;
            if(this.lives == 0){
                this.gameover = true;
            }
        }else{
            this.inmotion = false;
            this.bounce();
        }
//         this.bounce();
        this.inmotion = true;
        this.stepstaken += 1;
        this.ballPos.push(1);

        if(this.isTemperedGlass == 1) {
            this.shatterArgs.push([(this.stepstaken-1)*(-9)+1, 
                                    this.isTemperedGlass[this.stepstaken-1],
                                    this.ps.animation_time/1000,
                                    this.tempered_glass_color_list[Math.floor(this.stepstaken/10)]]);
        } else {
            this.shatterArgs.push([(this.stepstaken-1)*(-9)+1, 
                                    this.isTemperedGlass[this.stepstaken-1],
                                    this.ps.animation_time/1000,
                                    this.glass_color_list[Math.floor(this.stepstaken/10)]]);
        }
        this.posIndex++;
    }

    bounce(){
        console.log("bounce");
        if(!this.ball_transform){
            return;
        }
        if(!this.bouncestart){
            this.ypos = 0;
            this.yvel = 4;
            this.bouncestart = true;
            this.height = 4;
        }
        this.yvel -= this.grav;
        this.ypos += this.yvel;
        if(this.ypos <= 0){
            if(this.height == 4){
                this.lightup = true;
            }
            this.height = this.height/1.75;
            this.yvel = this.height;
            this.ypos = this.height;
            if(this.height <= 0.02){
                this.yvel = 0;
                this.height = 0;
                this.ypos = 0;
                this.bouncestart = false;
                this.inmotion = false;
                this.doneRespawning = true;
            }
            else{
                this.ypos = this.height;
            }
        }
    }

    fallThrough(){
        console.log("fallThrough");
        if(!this.ball_transform){
            return;
        }
        if(!this.fallStart){
            this.ypos = 0;
            this.yvel = 4;
            this.fallStart = true;
            this.height = 4;
        }
        //this.inmotion = false;
        this.yvel -= this.grav;
        this.ypos += this.yvel;
        if(this.ypos < -600){

            this.ypos = 0;
            this.inmotion = false;
            this.fallStart = false;
            this.respawn();
        }

        return;
    }

    respawn() {
        console.log("In respawn")
        if (this.isOnTemperedGlass == false) {
            console.log("here")
            if (this.lastmotion == "left"){
                this.ball_transform = this.ball_transform.times(Mat4.translation(7, 0, 0));
                this.lastmotion = "right";
            }
            else if (this.lastmotion == "right") {
                this.ball_transform = this.ball_transform.times(Mat4.translation(-7, 0, 0));
                this.lastmotion = "left";
            }
            this.bounce();
            this.isOnTemperedGlass = true;
        }
    }

    make_control_panel() {
        // Left and right movement
        this.key_triggered_button("Go left", ["n"], this.go_left);
        this.key_triggered_button("Go right", ["m"], this.go_right);
        this.new_line();

        this.live_string(life => life.textContent = "lives: " + this.lives);
        this.new_line();

        this.live_string(steps => steps.textContent = "steps: " + this.stepstaken);
        this.new_line();

        this.live_string(time => time.textContent = "time: " + this.time_left);


        /*
        this.key_triggered_button("Outline", ["o"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            this.draw_outline = !(this.draw_outline);
        });
        this.key_triggered_button("Sit still", ["m"], () => {
            // TODO:  Requirement 3d:  Set a flag here that will toggle your swaying motion on and off.
            this.is_still = !(this.is_still)
        });
        */
    }


    draw_bridge(context, program_state, frame_transform, frame_color, t){
        let scale_factor = 1000;
        let glass_width = 6;
//         const glass_color = hex_color("#C6F7FF", 0.8);
//         const tempered_glass_color = hex_color("#60A8C1", 0.8);
        const arrived_checkPoint = false;
        
        frame_transform = frame_transform.times(Mat4.scale(1, 1, scale_factor));
        frame_transform = frame_transform.times(Mat4.translation(-10, 0, -1));
        
        this.shapes.cube.draw(context, program_state, frame_transform, this.materials.plastic.override({color:frame_color}));
        this.shapes.cube.draw(context, program_state, frame_transform.times(Mat4.translation(2 + glass_width, 0, 0)), this.materials.plastic.override({color:frame_color}));

        frame_transform = Mat4.identity();
        frame_transform = frame_transform.times(Mat4.scale(1, 1, scale_factor));
        frame_transform = frame_transform.times(Mat4.translation(10, 0, -1));

        this.shapes.cube.draw(context, program_state, frame_transform, this.materials.plastic.override({color:frame_color}));
        this.shapes.cube.draw(context, program_state, frame_transform.times(Mat4.translation(-(2 + glass_width), 0, 0)), this.materials.plastic.override({color:frame_color}));

        let left_glass_transform = Mat4.identity();
        let right_glass_transform = Mat4.identity();

        left_glass_transform = left_glass_transform.times(Mat4.translation(-glass_width, 0 , 0));
        left_glass_transform = left_glass_transform.times(Mat4.scale(glass_width / 2, 1, glass_width / 2));
        left_glass_transform = left_glass_transform.times(Mat4.translation(0, 0, -1));

        right_glass_transform = right_glass_transform.times(Mat4.translation(glass_width, 0 , 0));
        right_glass_transform = right_glass_transform.times(Mat4.scale(glass_width / 2, 1, glass_width / 2));
        right_glass_transform = right_glass_transform.times(Mat4.translation(0, 0, -1));

        let left_deco_transform = Mat4.identity();
        let right_deco_transform = Mat4.identity();
        left_deco_transform = left_deco_transform.times(Mat4.translation(-12, 0, -3));
        right_deco_transform = right_deco_transform.times(Mat4.translation(12, 0, -3));
        let period = 2;
        const color_change = (1 + Math.sin(Math.PI / period * t)) / 2;
        let deco_color = color(0.7, color_change, color_change, 1);
        let color_index = 0;
 
        //draw glass and decorations
        for(let i = 0; i < this.num_glasses; i++){
            let ith_digit_char = String(this.random_number).charAt((i + 2) % 16);
            let ith_digit_int = Number(ith_digit_char);
            if(i != 0 && i % this.checkpoint == 0){
//                 console.log("i : " + i + ", this.checkpoint : " + this.checkpoint);
                color_index++;
                this.change_glass_color();
            }
            //console.log("i : " + i + " ith_digit_int : " + ith_digit_int);
            if(ith_digit_int % 2 == 0){
                this.shapes.cube.draw(context, program_state, left_glass_transform, this.materials.plastic.override({color:this.tempered_glass_color_list[color_index]}));
                this.isTemperedGlass.push(-1);
                if(this.ballPos[i] == null || this.ballPos[i] != 1) { // reg. glass on right
                    this.shapes.cube.draw(context, program_state, right_glass_transform, this.materials.plastic.override({color:this.glass_color_list[color_index]}));
                } else {
                    
                    this.shatter(this.shatterArgs[i][0], -this.shatterArgs[i][1], 
                                context, program_state, t-this.shatterArgs[i][2],
                                this.shatterArgs[i][3]);

                }
            }else { // reg. glass on left
                this.isTemperedGlass.push(1);
                if(this.ballPos[i] == null || this.ballPos[i] != -1) {
                    //this.isOnTemperedGlass = true;
                    this.shapes.cube.draw(context, program_state, left_glass_transform, this.materials.plastic.override({color:this.glass_color_list[color_index]}));
                } else {
                    
                    this.shatter(this.shatterArgs[i][0], -this.shatterArgs[i][1], 
                                 context, program_state, t-this.shatterArgs[i][2],
                                 this.shatterArgs[i][3]);
                }
                this.shapes.cube.draw(context, program_state, right_glass_transform, this.materials.plastic.override({color:this.tempered_glass_color_list[color_index]}));
            }
            
            this.shapes.sphere.draw(context, program_state, left_deco_transform, this.materials.sphere.override({color: deco_color}));
            this.shapes.sphere.draw(context, program_state, right_deco_transform, this.materials.sphere.override({color: deco_color}));
            left_glass_transform = left_glass_transform.times(Mat4.translation(0, 0, -3));
            right_glass_transform = right_glass_transform.times(Mat4.translation(0, 0, -3));
            left_deco_transform = left_deco_transform.times(Mat4.translation(0, 0, -9));
            right_deco_transform = right_deco_transform.times(Mat4.translation(0, 0, -9));
        }
    }

    change_glass_color(){
        this.glass_color_list.push(color(Math.random(), Math.random(), Math.random(), 0.8));
        this.tempered_glass_color_list.push(color(Math.random(),Math.random(),Math.random(),0.8));
//         this.glass_color = color(1, 0, 0, 1);
    }

    display(context, program_state) {
        this.ps = program_state;
        const t = program_state.animation_time/1000;
        //console.log(Math.floor(t));
        if(this.lastmotion == "none"){
            this.offset = Math.floor(t);
        }
        this.time_left = 60 - Math.floor(t) + this.offset;
        if(this.lastmotion != "none"){
            document.getElementById("title").style.display = "none";
            document.getElementById("timediv").style.display = "block";
            document.getElementById("time").innerHTML = this.time_left;
        }
        if(this.time_left <= 0 || this.gameover){
            this.time_left = 0;
            this.gameover = true;
            document.getElementById("timediv").style.display = "none";
            document.getElementById("gameover").style.display = "block";
            document.getElementById("steps").innerHTML = this.stepstaken + " steps";
            document.getElementById("lives").innerHTML = this.lives + " lives";
            document.getElementById("score").innerHTML = this.stepstaken*this.lives;
            return;
        }
        const dt = program_state.delta_time/1000;
        super.display(context, program_state);
        const bridge_frame_color = hex_color("#F700FF");

        const blue = hex_color("#1a9ffa");
//         let num_glasses = 100;

        let frame_transform = Mat4.identity();

        //program_state.set_camera(this.initial_camera_location);

        this.draw_bridge(context, program_state, frame_transform, bridge_frame_color, t, dt);
        let platform_transform = Mat4.identity();
        platform_transform = platform_transform.times(Mat4.translation(0, 0, 11)).times(Mat4.scale(11, 1, 11));
        this.shapes.cube.draw(context, program_state, platform_transform, this.materials.plastic.override({color: hex_color("#FFD700")}));
        let ball_transform_dynamic = this.ball_transform;
        //console.log("ypos: " + this.ypos);
        //console.log("yvel: " + this.yvel);
        if(this.ypos !== 0){
            ball_transform_dynamic = ball_transform_dynamic.times(Mat4.translation(0, this.ypos, 0));
            if(this.isOnTemperedGlass){
                this.bounce();
            }else{
                this.fallThrough();
            }

        }

        
        this.shapes.sphere.draw(context, program_state, ball_transform_dynamic, this.materials.sphere);
        let desired = this.camera_location;
        if(this.inmotion){
            if(this.fallStart){
                desired = desired.times(Mat4.translation(0, 0, 0.2));
            }
            else{
                desired = desired.times(Mat4.translation(0, 0, 0.3));
            }
            this.camera_location = desired;
        }
        if (this.doneRespawning == false) {
            //this.respawn();
        }
        program_state.set_camera(desired.map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1)));
        this.shapes.axis.draw(context, program_state, Mat4.identity(), this.materials.plastic);
    }

}