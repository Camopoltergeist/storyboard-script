import { Texture, TextureLoader } from "three";

import receptor from "./resources/receptor.png";
import note4 from "./resources/red.png";
import note8 from "./resources/blue.png";
import note16 from "./resources/green.png";

export async function loadNoteTextures(): Promise<Texture[]>{
	const loader = new TextureLoader();

	const texturePromises = [
		loader.loadAsync(receptor),
		loader.loadAsync(note4),
		loader.loadAsync(note8),
		loader.loadAsync(note16)
	];

	return Promise.all(texturePromises);
}
