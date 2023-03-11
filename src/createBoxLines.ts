import { BufferGeometry, Vector3 } from "three";

export function createBoxLines(): BufferGeometry{
	const geometry = new BufferGeometry();

	const points = [
		new Vector3(-0.5, -0.5, -0.5),
		new Vector3(0.5, -0.5, -0.5),
		new Vector3(0.5, 0.5, -0.5),
		new Vector3(-0.5, 0.5, -0.5),

		new Vector3(-0.5, -0.5, 0.5),
		new Vector3(0.5, -0.5, 0.5),
		new Vector3(0.5, 0.5, 0.5),
		new Vector3(-0.5, 0.5, 0.5),
	];

	const indices = [
		0, 1,
		1, 2,
		2, 3,
		3, 0,

		4, 5,
		5, 6,
		6, 7,
		7, 4,

		0, 4,
		1, 5,
		2, 6,
		3, 7
	];

	geometry.setFromPoints(points);
	geometry.setIndex(indices);

	return geometry;
}