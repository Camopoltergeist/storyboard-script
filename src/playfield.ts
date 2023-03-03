import { Object3D, Sprite, SpriteMaterial } from "three";
import { degToRad } from "three/src/math/MathUtils";

export class Playfield extends Object3D {
	private lanes: Lane[];

	constructor(noteMaterials: SpriteMaterial[], laneWidth = 1){
		super();

		this.lanes = [
			new Lane(0, noteMaterials),
			new Lane(90, noteMaterials),
			new Lane(-90, noteMaterials),
			new Lane(180, noteMaterials),
		];

		const totalWidth = laneWidth * this.lanes.length;
		const halfWidth = totalWidth / 2;

		for(let i = 0; i < this.lanes.length; i++){
			const lane = this.lanes[i];

			lane.position.x = -halfWidth + i * laneWidth;
			this.add(lane);
		}
	}

	addNote(lane: number, time: number){
		this.lanes[lane].addNote(time);
	}
}

export class Lane extends Object3D{
	private receptor: Sprite;
	private notes: Sprite[];
	private readonly noteMaterials: SpriteMaterial[];

	constructor(noteRotation: number, noteMaterials: SpriteMaterial[]){
		super();

		const noteMaterialsCopy = [];

		for(const material of noteMaterials){
			const materialCopy = material.clone();
			materialCopy.rotation = degToRad(noteRotation);
			noteMaterialsCopy.push(materialCopy);
		}

		this.noteMaterials = noteMaterialsCopy;
		this.notes = [];

		this.receptor = new Sprite(this.noteMaterials[0]);
		this.add(this.receptor);
	}

	addNote(time: number){
		const noteSprite = new Sprite(this.noteMaterials[1]);
		noteSprite.position.y = time / 1000;

		this.notes.push(noteSprite);
		this.add(noteSprite);
	}
}