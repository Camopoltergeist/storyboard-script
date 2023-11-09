import { Object3D, SpriteMaterial } from "three";
import { SBLane } from "./sblane";
import { FrameState } from "./scenecontroller";
import { lerp } from "three/src/math/MathUtils";

export class Playfield extends Object3D {
	private readonly lanes: SBLane[];

	set width(value: number) {
		const totalWidth = value * this.lanes.length;
		const halfWidth = totalWidth / 2;

		for (let i = 0; i < this.lanes.length; i++) {
			const lane = this.lanes[i];

			lane.position.x = -halfWidth + i * value + value / 2;
			this.add(lane);
		}
	}

	set length(value: number) {
		for (const lane of this.lanes) {
			lane.length = value;
		}
	}

	set duration(value: number) {
		for (const lane of this.lanes) {
			lane.duration = value;
		}
	}

	constructor(noteMaterials: SpriteMaterial[]){
		super();

		this.lanes = [
			new SBLane(0, noteMaterials),
			new SBLane(90, noteMaterials),
			new SBLane(-90, noteMaterials),
			new SBLane(180, noteMaterials),
		];

		this.width = 0.9;
		this.duration = 1000;
	}

	addNote(lane: number, time: number, snap: number){
		this.lanes[lane].addNote(time, snap);
	}

	updateNotePositions(frameState: FrameState){
		for(const lane of this.lanes){
			lane.updateNotes(frameState);

			const maxRot = 45;
			// const nextRot = lerp(maxRot, 0, Math.min(1, frameState.beatT * 5));

			const nextRot = lerp(360, 0, frameState.beatT);

			lane.noteRotation = nextRot;
		}
	}
}

