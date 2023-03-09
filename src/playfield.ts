import { Camera, Object3D, SpriteMaterial } from "three";
import { AnimatorNumber } from "./animator";
import { SBAble } from "./sbable";
import { SBLane } from "./sblane";

export class Playfield extends Object3D implements SBAble{
	private readonly lanes: SBLane[];
	readonly animators: AnimatorNumber[] = [];

	constructor(noteMaterials: SpriteMaterial[], laneWidth = 1){
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
			ret += lane.toSBString();
		}

		return ret;
	}
}

