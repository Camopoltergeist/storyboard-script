import { Camera, SpriteMaterial } from "three";
import { degToRad } from "three/src/math/MathUtils";
import { SBSprite } from "./sbable";
import { SBNote } from "./sbnote";

export class SBLane extends SBSprite{
	private readonly notes: SBNote[];
	private readonly noteMaterials: SpriteMaterial[];

	constructor(noteRotation: number, noteMaterials: SpriteMaterial[]){
		const noteMaterialsCopy = [];
		
		for(const material of noteMaterials){
			const materialCopy = material.clone();
			materialCopy.rotation = degToRad(noteRotation);
			noteMaterialsCopy.push(materialCopy);
		}
		
		super(noteMaterialsCopy[0]);
		this.noteMaterials = noteMaterialsCopy;
		this.notes = [];
	}

	generateKeyframes(camera: Camera, time: number){
		if(!this.visible){
			return;
		}

		super.generateKeyframes(camera, time);

		for(const note of this.notes){
			note.generateKeyframes(camera, time);
		}
	}

	addNote(time: number){
		const noteSprite = new SBNote(this.noteMaterials[1], time);
		noteSprite.createDefaultNoteAnimation();

		this.notes.push(noteSprite);
		this.add(noteSprite);
	}

	toSBString(){
		let ret = super.toSBString();

		for(const note of this.notes){
			ret += note.toSBString();
		}

		return ret;
	}
}