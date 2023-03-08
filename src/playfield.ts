import { Object3D, Sprite, SpriteMaterial } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { AnimatorNumber, constantPolation, Keyframe, linearPolation } from "./animator";

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

	updateAnimations(time: number): void {
		for(const lane of this.lanes){
			lane.updateAnimations(time);
		}
	}

	addNote(lane: number, time: number){
		this.lanes[lane].addNote(time);
	}
}

export class Lane extends Object3D{
	private readonly receptor: Sprite;
	private readonly notes: Note[];
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

	updateAnimations(time: number){
		for(const note of this.notes){
			note.updateAnimations(time);
		}
	}

	addNote(time: number){
		const noteSprite = new Note(this.noteMaterials[1]);
		const animator = new AnimatorNumber(noteSprite, "position.y");

		animator.addKeyframe(new Keyframe(time - 1000, 10, linearPolation, constantPolation));
		animator.addKeyframe(new Keyframe(time, 0, linearPolation, linearPolation));

		noteSprite.animators.push(animator);

		this.notes.push(noteSprite);
		this.add(noteSprite);
	}
}

class Note extends Sprite{
	readonly animators: AnimatorNumber[] = [];

	constructor(material: SpriteMaterial){
		super(material);
	}

	updateAnimations(time: number): void {
		for(const animator of this.animators){
			animator.update(time);
		}
	}
}