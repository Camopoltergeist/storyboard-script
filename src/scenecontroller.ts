import { PerspectiveCamera, Scene, SpriteMaterial, Texture } from "three";
import { Playfield } from "./playfield";

import noteData from "./murasame.json";
import { updateAnimations } from "./animations";
import { ChartTime, TimingPoint } from "./timing";
import { BackgroundImage } from "./backgroundimage";

type Note = {chartTime: ChartTime, lane: number};

const notes: Note[] = [];
const timingPoints: TimingPoint[] = [];

export class SceneController{
	readonly scene: Scene;
	readonly camera: PerspectiveCamera;

	readonly playfield: Playfield;
	readonly background: BackgroundImage;

	constructor(noteMaterials: SpriteMaterial[], backgroundTexture: Texture){
		this.scene = new Scene();
		this.camera = new PerspectiveCamera(57, 16 / 9, 0.01, 1000);

		this.camera.translateZ(10);

		this.playfield = new Playfield(noteMaterials);

		this.background = new BackgroundImage(backgroundTexture);

		this.playfield.position.y = -4;
		this.playfield.position.z = -1;

		for(const note of notes){
			this.playfield.addNote(note.lane, note.chartTime.time, note.chartTime.snap);
		}

		this.scene.add(this.playfield);
	}

	update(time: number){
		updateAnimations(time);
		this.playfield.rotation.y = time / 1000 * Math.PI;
		this.playfield.updateNotePositions(time);
	}
}

function parseChart(){
	const timingPoint = noteData.timingPoints[0];
	timingPoints.push(new TimingPoint(timingPoint.bpm, timingPoint.time));

	for(const note of noteData.notes){
		const chartTime = new ChartTime(timingPoints[0], note.beat);

		notes.push({
			chartTime,
			lane: note.lane
		});
	}
}

parseChart();