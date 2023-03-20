import { PerspectiveCamera, Scene, SpriteMaterial } from "three";
import { Playfield } from "./playfield";

import noteData from "./murasame.json";
import { updateAnimations } from "./animations";

export class TimelineController{
	readonly scene: Scene;
	readonly camera: PerspectiveCamera;

	readonly playfield: Playfield;

	constructor(noteMaterials: SpriteMaterial[]){
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(57, 16 / 9, 0.01, 1000);

		this.camera.translateZ(10);

		this.playfield = new Playfield(noteMaterials);

		this.playfield.position.y = -4;
		this.playfield.position.z = 1;

		for(const note of noteData){
			this.playfield.addNote(note.lane, note.time, note.snap);
		}

		this.scene.add(this.playfield);
	}

	update(time: number){
		updateAnimations(time);
		this.playfield.updateNotePositions(time);
	}
}