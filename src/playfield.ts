import { Object3D, SpriteMaterial } from "three";
import { SBLane } from "./sblane";

export class Playfield extends Object3D {
	private readonly lanes: SBLane[];

	constructor(noteMaterials: SpriteMaterial[], laneWidth = 0.9){
		super();

		this.lanes = [
			new SBLane(0, noteMaterials),
			new SBLane(90, noteMaterials),
			new SBLane(-90, noteMaterials),
			new SBLane(180, noteMaterials),
		];

		const totalWidth = laneWidth * this.lanes.length;
		const halfWidth = totalWidth / 2;

		for(let i = 0; i < this.lanes.length; i++){
			const lane = this.lanes[i];

			lane.position.x = -halfWidth + i * laneWidth + laneWidth / 2;
			this.add(lane);
		}
	}

	addNote(lane: number, time: number, snap: number){
		this.lanes[lane].addNote(time, snap);
	}
}

