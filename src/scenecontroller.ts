import { PerspectiveCamera, Scene, SpriteMaterial, Texture } from "three";

import { updateAnimations } from "./animations";
import { BackgroundImage } from "./backgroundimage";
import { generateScene, getTimingPoints } from "./scenegenerator";
import { Playfield } from "./playfield";
import { TimingPoint } from "./timing";


export class SceneController{
	readonly scene: Scene;
	readonly camera: PerspectiveCamera;

	readonly background: BackgroundImage;
	readonly timingPoints: TimingPoint[];

	constructor(noteMaterials: SpriteMaterial[], backgroundTexture: Texture){
		this.scene = generateScene(noteMaterials);
		this.camera = new PerspectiveCamera(57, 16 / 9, 0.01, 1000);

		this.camera.translateZ(10);

		this.background = new BackgroundImage(backgroundTexture);

		this.timingPoints = getTimingPoints();
	}

	update(time: number) {
		const frameState = this.createFrameState(time);

		updateAnimations(time);
		this.scene.traverse((object3d) => {
			if (object3d instanceof Playfield) {
				object3d.updateNotePositions(frameState);
			}
		});
	}

	getCurrentTimingPoint(time: number): TimingPoint {
		let found = this.timingPoints[0];

		for (const tp of this.timingPoints) {
			if (tp.time > time) {
				break;
			}
			
			found = tp;
		}

		return found;
	}

	createFrameState(time: number): FrameState {
		return {
			time,
			timingPoint: this.getCurrentTimingPoint(time)
		}
	}
}

export type FrameState = {
	time: number,
	timingPoint: TimingPoint
};