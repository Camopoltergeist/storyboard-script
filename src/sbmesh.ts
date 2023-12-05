import { Camera, LineSegments, Mesh, MeshBasicMaterial, Object3D, Vector3 } from "three";
import { SBPositionKeyframe } from "./sbkeyframe";
import { SBObject } from "./sbobject";
import { SBAble } from "./sbable";

export class SBMesh extends Object3D implements SBAble {
	readonly mesh: Mesh | LineSegments;
	readonly sbLines: SBObject[] = [];
	readonly startTime: number;
	readonly endTime: number;

	constructor(mesh: Mesh | LineSegments, textureName: string, startTime: number = 0, endTime: number = Infinity) {
		super();

		this.mesh = mesh;
		this.startTime = startTime;
		this.endTime = endTime;

		if (this.mesh instanceof Mesh) {
			(this.mesh.material as MeshBasicMaterial).wireframe = true;
		}

		const geometry = mesh.geometry;
		const vertexCount = geometry.index === null ? geometry.attributes.position.count : geometry.index.count;

		if(vertexCount % 2 !== 0){
			throw new Error("Can't create SBGroup from Mesh: Vertex count is not divisible by 2!");
		}

		for(let i = 0; i < vertexCount; i += 2){
			this.sbLines.push(new SBObject(textureName, false));
		}

		this.add(mesh);
	}

	generateKeyframes(camera: Camera, time: number){
		for(let i = 0; i < this.sbLines.length; i++){
			this.generateKeyframe(camera, time, i);
		}
	}

	clearKeyframes(): void {
		for (const line of this.sbLines) {
			line.clearKeyframes();
		}
	}

	getEndTime(): number {
		return this.endTime;
	}

	getStartTime(): number {
		return this.startTime;
	}

	private generateKeyframe(camera: Camera, time: number, childIndex: number){
		const child = this.sbLines[childIndex];
		const geometry = this.mesh.geometry;

		let lineStart: Vector3;
		let lineEnd: Vector3;

		const posArray: Float32Array = (geometry.attributes.position as any).array;
		
		if(geometry.index === null){
			const posIndex = childIndex * 2 * 3;

			const startX = posArray[posIndex + 0];
			const startY = posArray[posIndex + 1];
			const startZ = posArray[posIndex + 2];

			const endX = posArray[posIndex + 3];
			const endY = posArray[posIndex + 4];
			const endZ = posArray[posIndex + 5];

			lineStart = new Vector3(startX, startY, startZ);
			lineEnd = new Vector3(endX, endY, endZ);
		}
		else{
			const posIndex = childIndex * 2;
			const startIndex = geometry.index.array[posIndex] * 3;
			const endIndex = geometry.index.array[posIndex + 1] * 3;

			const startX = posArray[startIndex + 0];
			const startY = posArray[startIndex + 1];
			const startZ = posArray[startIndex + 2];

			const endX = posArray[endIndex + 0];
			const endY = posArray[endIndex + 1];
			const endZ = posArray[endIndex + 2];

			lineStart = new Vector3(startX, startY, startZ);
			lineEnd = new Vector3(endX, endY, endZ);
		}

		lineStart.applyMatrix4(this.mesh.matrixWorld);
		lineEnd.applyMatrix4(this.mesh.matrixWorld);

		const kf = SBPositionKeyframe.fromLine(camera, time, lineStart, lineEnd);
		child.posKeyframes.push(kf);
	}

	toSBString(): string{
		let ret = "";

		for(const child of this.sbLines){
			ret += child.toSBString();
		}

		return ret;
	}
}