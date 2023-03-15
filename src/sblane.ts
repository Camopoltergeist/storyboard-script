import { SpriteMaterial } from "three";
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

	addNote(time: number, snap: number){
		const noteSprite = new SBNote(this.noteMaterials[snap], time);
		noteSprite.createDefaultNoteAnimation();

		this.notes.push(noteSprite);
		this.add(noteSprite);
	}
}