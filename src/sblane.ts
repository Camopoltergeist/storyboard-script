import { SpriteMaterial, Vector3 } from "three";
import { degToRad, inverseLerp, lerp } from "three/src/math/MathUtils";
import { SBSprite } from "./sbable";
import { SBNote } from "./sbnote";

export class SBLane extends SBSprite{
	private readonly notes: SBNote[];
	private readonly noteMaterials: SpriteMaterial[];

	startPos: Vector3 = new Vector3(0, 5, 0);
	endPos: Vector3 = new Vector3(0, 0, 0);

	duration: number = 1000;
	fadeInTime: number = 100;

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
		const noteSprite = new SBNote(this.noteMaterials[snap], time, this.duration, this);

		this.notes.push(noteSprite);
		this.add(noteSprite);
	}

	private getNotePosition(trackPos: number): Vector3{
		const pos = this.endPos.clone();
		pos.lerp(this.startPos, trackPos);

		return pos;
	}

	updateNotes(time: number){
		for(const note of this.notes){
			this.updateNoteVisibility(time, note);

			if(!note.visible){
				continue;
			}

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
		note.visible = time > note.time - this.duration && time < note.time;
	}

	private updateNoteTransparency(time: number, note: SBNote){
		const startTime = note.time - this.duration;

		const opacity = inverseLerp(startTime, startTime + this.fadeInTime, time);
		note.material.opacity = opacity;
	}
}