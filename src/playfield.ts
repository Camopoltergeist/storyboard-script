import { Camera, Object3D, SpriteMaterial } from "three";
import { SBAble } from "./sbable";
import { SBLane } from "./sblane";

export class Playfield extends Object3D implements SBAble{
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

	generateKeyframes(camera: Camera, time: number){
		if(!this.visible){
			return;
		}

		for(const lane of this.lanes){
			lane.generateKeyframes(camera, time);
		}
	}

	addNote(lane: number, time: number, snap: number){
		this.lanes[lane].addNote(time, snap);
	}

	toSBString(){
		let ret = "";

		for(const lane of this.lanes){
			ret += lane.toSBString();
		}

		return ret;
	}
}

