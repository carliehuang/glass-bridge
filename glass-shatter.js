import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

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
            'cube': new defs.Cube()
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
        this.random_number = Math.floor(Math.random() * 1000);
//         this.random_number2 = Math.floor(Math.random() * 10);
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

export class GlassParticle {

    constructor(
        position,
        velocity,
        gravityEffect,
        lifeLength,
        //rotation, 
        scale,
        color
    ) {
        this.position = position;
        this.velocity = velocity;
        this.gravityEffect = gravityEffect;
        this.gravity = -50;                     //G 
        this.lifeLength = lifeLength;
        //this.rotation = rotation;
        this.scale = scale;
        this.color = color;
        this.elapsedTime = 0;
    }

    update(program_state) {
        const t = program_state.t;
        //Alter the y coord
        this.velocity[1] += this.gravity * gravityEffect * t;

        let change = vec3(this.velocity[0]. this.velocity[1], this.velocity[2]);
        change = change.times(t);

        //Update to the new position
        this.position = this.position.plus(change);
        this.elapsedTime += t;

        return this.elapsedtime < this.lifeLength;

    }    
    
    draw(context, program_state) {
        const viewMatrix = program_state.camera_inverse;
        let model_transform = Mat4.identity()
        model_transform = model_transform.times(this.position[0], this.position[1], this.position[2]);
        model_transform = model_transform.times(Mat4.rotation(((2* Math.PI) / 360) * this.rotation, 0, 0, 1));
        model_transform = model_transform.times(Mat4.scale(this.scale, this.scale, this.scale))
    
        this.shape.draw(context, program_state, model_transform)
    }

}

export class ParticleMaster extends Base_Scene{
    constructor(
        pps,
        averageSpeed,
        gravityComplient,
        averageLifeLength,
        averageScale
    ) {
        super();
        this.pps = pps;
        this.averageSpeed = averageSpeed;
        this.gravityComplient = gravityComplient;
        this.averageLifeLength = lifeLength;
        this.averageScale = averageScale;
        this.shapes = {
            square: new defs.Square()
        }
        this.allParticles = [];
        this.color = 'white';
        
    }

    generateParticles(times, pos) {
        velocity = vec3(.5, 1, .5);
        velocity.normalize();
        if (this.allParticles < 100) {
            num = this.pps * times;
            for(let i = 0; i < num; i++) {
                this.emitParticles(pos, velocity)
            }
        }
    }

    emitParticles(pos, velocity){
        velocity.scale(this.averageSpeed);
        this.allParticles.push(new Particle(
            position,
            velocity,
            this.gravityComplient,
            this.averageLifeLength,   
            this.averageScale,
            this.color)
        )
    }

    draw(context, program_state) {
        for (let i = 0; i < this.allParticles.length; i++) {
            if(!this.allParticles[i].update(program_state)) {
                this.allParticles.splice(i--, 1);
            } 
            else {
                this.allParticles[i].draw(context, program_state);
            }
        }
    }

    display(context, program_state) {
        super.display(context, program_state);
        const bridge_frame_color = hex_color("#F700FF");

        const blue = hex_color("#1a9ffa");
        let num_glasses = 100;

        let frame_transform = Mat4.identity();

        //program_state.set_camera(this.initial_camera_location);

        this.draw_bridge(context, program_state, frame_transform, bridge_frame_color, num_glasses);
        
        
    }
}
