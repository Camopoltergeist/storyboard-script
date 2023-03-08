import { Camera, Object3D, Sprite, SpriteMaterial } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { AnimatorNumber, constantPolation, Keyframe, linearPolation } from "./animator";
import { SBKeyframe } from "./sbkeyframe";
import { SBObject } from "./sbobject";

export class Playfield extends Object3D {
	private readonly lanes: Lane[];
	readonly animators: AnimatorNumber[] = [];

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

			lane.position.x = -halfWidth + i * laneWidth + laneWidth / 2;
			this.add(lane);
		}
	}

	updateAnimations(time: number): void {
		for(const animator of this.animators){
			animator.update(time);
		}

		for(const lane of this.lanes){
			lane.updateAnimations(time);
		}
	}

	generateKeyframes(camera: Camera, time: number){
		if(!this.visible){
			return;
		}

		for(const lane of this.lanes){
			lane.generateKeyframes(camera, time);
		}
	}

	addNote(lane: number, time: number){
		this.lanes[lane].addNote(time);
	}

	toSBString(){
		let ret = "";

		for(const lane of this.lanes){
			ret += lane.receptor.toSBString();
		}

		for(const lane of this.lanes){
			ret += lane.toSBString();
		}

		return ret;
	}
}

export class Lane extends Object3D{
	readonly receptor: SBSprite;
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

		this.receptor = new SBSprite(this.noteMaterials[0]);
		this.add(this.receptor);
	}

	updateAnimations(time: number){
		this.receptor.updateAnimations(time);

		for(const note of this.notes){
			note.updateVisibility(time);
			note.updateAnimations(time);
		}
	}

	generateKeyframes(camera: Camera, time: number){
		if(!this.visible){
			return;
		}

		this.receptor.generateKeyframes(camera, time);

		for(const note of this.notes){
			note.generateKeyframes(camera, time);
		}
	}

	addNote(time: number){
		const noteSprite = new Note(this.noteMaterials[1], time);
		const animator = new AnimatorNumber(noteSprite, "position.y");

		animator.addKeyframe(new Keyframe(time - 1000, 5, linearPolation, constantPolation));
		animator.addKeyframe(new Keyframe(time, 0, linearPolation, linearPolation));

		noteSprite.animators.push(animator);

		this.notes.push(noteSprite);
		this.add(noteSprite);
	}

	toSBString(){
		let ret = "";

		for(const note of this.notes){
			ret += note.toSBString();
		}

		return ret;
	}
}

class SBSprite extends Sprite{
	readonly animators: AnimatorNumber[] = [];
	readonly sbObject: SBObject;

	constructor(material: SpriteMaterial){
		super(material);

		this.sbObject = new SBObject(this.material.map?.userData.textureName, true);
	}

	updateAnimations(time: number): void {
		for(const animator of this.animators){
			animator.update(time);
		}
	}

	generateKeyframes(camera: Camera, time: number){
		if(!this.visible){
			return;
		}

		const kf = SBKeyframe.fromSprite(camera, time, this);

		this.sbObject.keyframes.push(kf);
	}

	toSBString(): string{
		return this.sbObject.toSBString();
	}
}

class Note extends SBSprite{
	readonly time: number;

	constructor(material: SpriteMaterial, time: number){
		super(material);

		this.time = time;
	}

	updateVisibility(currentTime: number){
		if(currentTime < this.time - 1000 || currentTime > this.time){
			this.visible = false;
		}
		else{
			this.visible = true;
		}
	}
}
