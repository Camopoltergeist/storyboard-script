import { Camera, Vector2, Vector3 } from "three";

export class SBKeyframe{
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

	static fromLine(camera: Camera, time: number, lineStart: Vector3, lineEnd: Vector3, lineTextureLength: number = 128){
		const vpMat = camera.projectionMatrix.clone().multiply(camera.matrixWorldInverse);

		// Do projections
		const projStart = lineStart.clone().applyMatrix4(vpMat);
		const projEnd = lineEnd.clone().applyMatrix4(vpMat);

		// Convert to Vector2
		const v2Start = new Vector2(projStart.x, projStart.y);
		const v2End = new Vector2(projEnd.x, projEnd.y);

		// Do normalized device coordinate to storyboard coordinate conversion
		const sbStart = ndcToSbc(v2Start);
		const sbEnd = ndcToSbc(v2End);

		const scale = sbStart.distanceTo(sbEnd) / lineTextureLength;
		const rotation = sbEnd.sub(sbStart).angle();

		return new SBKeyframe(time, sbStart, rotation, scale);
	}

	toSBString(nextKeyframe: SBKeyframe): string{
		const retString =
		` M,0,${this.time},${nextKeyframe.time},${this.position.x},${this.position.y},${nextKeyframe.position.x},${nextKeyframe.position.y}\n` + 
		` R,0,${this.time},${nextKeyframe.time},${this.rotation},${nextKeyframe.rotation}\n` +
		` V,0,${this.time},${nextKeyframe.time},${this.length},1,${nextKeyframe.length},1\n`;

		return retString;
	}
}

const sbAspectRatio = 16 / 9;
const sbHeight = 480;
const sbWidth = sbAspectRatio * sbHeight;
const sbLeft = (640 - sbWidth) / 2;

// Normalized device coordinates to Storyboard coordinates
function ndcToSbc(input: Vector2): Vector2{
	const x = (input.x + 1) / 2 * sbWidth + sbLeft;
	const y = (1 - (input.y + 1) / 2) * sbHeight;

	return new Vector2(x, y)
}
