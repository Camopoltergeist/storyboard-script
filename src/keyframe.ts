import { Vector2 } from "three";

export class Keyframe{
	time: number;
	position: Vector2;
	rotation: number;
	length: number;

	constructor(time: number, pos: Vector2, rot: number, length: number){
		this.time = time;
		this.position = pos;
		this.rotation = rot;
		this.length = length;
	}
}