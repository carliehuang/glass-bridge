import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

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
            'strip' : new Cube_Single_Strip()
        };

        // *** Materials
        this.materials = {
            sphere: new Material(new defs.Phong_Shader(),
                {ambient: 1, diffusivity: .6, color: color(1, 1, 1, 1)}),
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };
        // The white material and basic shader are used for drawing the outline.
        this.white = new Material(new defs.Basic_Shader());
    }

    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.
        
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.translation(0, -10, -30));
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
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */
    constructor(){
        super();
        this.set_colors();
        this.boxColors;
        this.draw_outline = false;
        this.is_still = false;
    }

    set_colors() {
        // TODO:  Create a class member variable to store your cube's colors.
        // Hint:  You might need to create a member variable at somewhere to store the colors, using `this`.
        // Hint2: You can consider add a constructor for class Assignment2, or add member variables in Base_Scene's constructor.
        this.boxColors = [color(Math.random(), Math.random(), Math.random(), 1.0),
                          color(Math.random(), Math.random(), Math.random(), 1.0),
                          color(Math.random(), Math.random(), Math.random(), 1.0),
                          color(Math.random(), Math.random(), Math.random(), 1.0),
                          color(Math.random(), Math.random(), Math.random(), 1.0),
                          color(Math.random(), Math.random(), Math.random(), 1.0),
                          color(Math.random(), Math.random(), Math.random(), 1.0),
                          color(Math.random(), Math.random(), Math.random(), 1.0)];
    }

    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("Change Colors", ["c"], this.set_colors);
        // Add a button for controlling the scene.
        this.key_triggered_button("Outline", ["o"], () => {
            // TODO:  Requirement 5b:  Set a flag here that will toggle your outline on and off
            this.draw_outline = !(this.draw_outline);
        });
        this.key_triggered_button("Sit still", ["m"], () => {
            // TODO:  Requirement 3d:  Set a flag here that will toggle your swaying motion on and off.
            this.is_still = !(this.is_still)
        });
    }


    draw_bridge(context, program_state, frame_transform, glass_transform, frame_color, num_glasses){
        const t = program_state.animation_time / 1000, dt = program_state.animation_delta_time / 1000;
        let scale_factor = 1000;
        let glass_width = 6;
        const glass_color = hex_color("#C6F7FF");
        const tempered_glass_color = hex_color("#824300");
        

        frame_transform = frame_transform.times(Mat4.scale(1, 1, scale_factor));
        frame_transform = frame_transform.times(Mat4.translation(-10, 0, -1));

        

        this.shapes.cube.draw(context, program_state, frame_transform, this.materials.plastic.override({color:frame_color}));
        this.shapes.cube.draw(context, program_state, frame_transform.times(Mat4.translation(2 + glass_width, 0, 0)), this.materials.plastic.override({color:frame_color}));

        frame_transform = Mat4.identity();
        frame_transform = frame_transform.times(Mat4.scale(1, 1, scale_factor));
        frame_transform = frame_transform.times(Mat4.translation(10, 0, -1));

        this.shapes.cube.draw(context, program_state, frame_transform, this.materials.plastic.override({color:frame_color}));
        this.shapes.cube.draw(context, program_state, frame_transform.times(Mat4.translation(-(2 + glass_width), 0, 0)), this.materials.plastic.override({color:frame_color}));

        glass_transform = glass_transform.times(Mat4.translation(-glass_width, 0 , 0));
        glass_transform = glass_transform.times(Mat4.scale(glass_width / 2, 1, glass_width / 2));
        glass_transform = glass_transform.times(Mat4.translation(0, 0, -1));

        let deco_transform = Mat4.identity();
        deco_transform = deco_transform.times(Mat4.translation(-12, 0, -3));
        let period = 2;
        const color_change = (1 + Math.sin(Math.PI / period * t)) / 2;
        let deco_color = color(1, color_change, color_change, 1);

        //left bridge 
        for(let i = 0; i < num_glasses; i++){
            this.shapes.cube.draw(context, program_state, glass_transform, this.materials.plastic.override({color:glass_color}));
            this.shapes.sphere.draw(context, program_state, deco_transform, this.materials.sphere.override({color: deco_color}));
            glass_transform = glass_transform.times(Mat4.translation(0, 0, -3));
            deco_transform = deco_transform.times(Mat4.translation(0, 0, -9));
//             if(i % 2 == 0){
//                 this.draw_glass(context, program_state, model_transform);
//             }
        }

        //right bridge 
        glass_transform = Mat4.identity();
        deco_transform = Mat4.identity();
        deco_transform = deco_transform.times(Mat4.translation(12, 0, -3));

        glass_transform = glass_transform.times(Mat4.translation(glass_width, 0 , 0));
        glass_transform = glass_transform.times(Mat4.scale(glass_width / 2, 1, glass_width / 2));
        glass_transform = glass_transform.times(Mat4.translation(0, 0, -1));
        for(let i = 0; i < num_glasses; i++){
            this.shapes.cube.draw(context, program_state, glass_transform, this.materials.plastic.override({color:glass_color}));
            this.shapes.sphere.draw(context, program_state, deco_transform, this.materials.sphere.override({color: deco_color}));
            glass_transform = glass_transform.times(Mat4.translation(0, 0, -3));
            deco_transform = deco_transform.times(Mat4.translation(0, 0, -9));
//             if(i % 2 == 0){
//                 this.draw_glass(context, program_state, model_transform);
//             }
        }

        //draw decorations



        


    }

    display(context, program_state) {
        super.display(context, program_state);
        const bridge_frame_color = hex_color("#F700FF");

        const blue = hex_color("#1a9ffa");
        let num_glasses = 30;

        let frame_transform = Mat4.identity();
        let glass_transform = Mat4.identity();

        //program_state.set_camera(this.initial_camera_location);

        this.draw_bridge(context, program_state, frame_transform, glass_transform, bridge_frame_color, num_glasses);
        
        
    }
}