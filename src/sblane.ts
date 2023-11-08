import { Object3D, SpriteMaterial, Vector3 } from "three";
import { degToRad, inverseLerp } from "three/src/math/MathUtils";
import { SBSprite } from "./sbable";
import { SBNote } from "./sbnote";
import { SBAlpha } from "./sbkeyframe";

export class SBLane extends Object3D{
	private readonly notes: SBNote[];
	private readonly noteMaterials: SpriteMaterial[];
	private readonly receptorSprite: SBSprite;

	startPos: Vector3 = new Vector3(0, 1, 0);
	endPos: Vector3 = new Vector3(0, 0, 0);
	length: number = 5;

	duration: number = 1000;
	fadeInTime: number = 100;

	constructor(noteRotation: number, noteMaterials: SpriteMaterial[]){
		super();

		const noteMaterialsCopy = [];
		
		for(const material of noteMaterials){
			const materialCopy = material.clone();
			materialCopy.rotation = degToRad(noteRotation);
			noteMaterialsCopy.push(materialCopy);
		}

		this.receptorSprite = new SBSprite(noteMaterialsCopy[0]);
		this.receptorSprite.position.copy(this.endPos).multiplyScalar(this.length);
		this.add(this.receptorSprite);
		
		this.noteMaterials = noteMaterialsCopy;
		this.notes = [];
	}

	addNote(time: number, snap: number){
		const noteSprite = new SBNote(this.noteMaterials[snap], time, this.duration, this);

		this.setNoteAlphaKeyframes(noteSprite);
		this.notes.push(noteSprite);
		this.add(noteSprite);
	}

	private setNoteAlphaKeyframes(note: SBNote){
		const startTime = Math.max(note.time - this.duration, note.startTime);

		const startKf = new SBAlpha(startTime, 0);
		const endKf = new SBAlpha(startTime + this.fadeInTime, 1);

		note.sbObject.alphaKeyframes.push(startKf, endKf);
	}

	private getNotePosition(trackPos: number): Vector3{
		const pos = this.endPos.clone();
		const lengthPos = this.startPos.clone().multiplyScalar(this.length);
		pos.lerp(lengthPos, trackPos);

		return pos;
	}

	updateNotes(time: number){
		for(const note of this.notes){
			this.updateNoteVisibility(time, note);

			this.updateNoteTransparency(time, note);

			const trackPos = this.calculateTrackPosition(time, note.time);
			const nextPos = this.getNotePosition(trackPos);

			note.position.copy(nextPos);
		}
	}

	private calculateTrackPosition(time: number, noteTime: number): number{
		return (noteTime - time) / this.duration;
	}

	private updateNoteVisibility(time: number, note: SBNote){
		note.visible = time >= note.time - this.duration && time <= note.time;
	}

	private updateNoteTransparency(time: number, note: SBNote){
		const startTime = note.time - this.duration;

		// Limit opacity to 1
		const opacity = Math.min(inverseLerp(startTime, startTime + this.fadeInTime, time), 1);
		note.material.opacity = opacity;
	}
}