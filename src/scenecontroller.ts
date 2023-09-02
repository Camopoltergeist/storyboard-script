import { PerspectiveCamera, Scene, SpriteMaterial, Texture } from "three";

import { updateAnimations } from "./animations";
import { BackgroundImage } from "./backgroundimage";
import { generateScene } from "./scenegenerator";
import { Playfield } from "./playfield";


export class SceneController{
	readonly scene: Scene;
	readonly camera: PerspectiveCamera;

	readonly background: BackgroundImage;

	constructor(noteMaterials: SpriteMaterial[], backgroundTexture: Texture){
		this.scene = generateScene(noteMaterials);
		this.camera = new PerspectiveCamera(57, 16 / 9, 0.01, 1000);

		this.camera.translateZ(10);

		this.background = new BackgroundImage(backgroundTexture);
	}

	update(time: number){
		updateAnimations(time);
		this.scene.traverse((object3d) => {
			if (object3d instanceof Playfield) {
				object3d.updateNotePositions(time);
			}
		});
	}
}
