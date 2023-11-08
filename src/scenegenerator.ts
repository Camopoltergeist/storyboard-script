import { Scene, SpriteMaterial } from "three";
import { Playfield } from "./playfield";

import noteData from "./murasame.json";
import { ChartTime, TimingPoint } from "./timing";

type Note = { chartTime: ChartTime, lane: number };

const notes: Note[] = [];
const timingPoints: TimingPoint[] = [];
let lastBeat = 0;

export function generateScene(noteMaterials: SpriteMaterial[]): Scene {
	const scene = new Scene();

	const playfield = createPlayfield(noteMaterials, 0, lastBeat);
	scene.add(playfield);

	return scene;
}

function createPlayfield(noteMaterials: SpriteMaterial[], startBeat: number, endBeat: number, timingPoint: TimingPoint = timingPoints[0]): Playfield {
	const rangeNotes = getNotesInRange(startBeat, endBeat, timingPoint);
	const playfield = new Playfield(noteMaterials);

	for (const note of rangeNotes) {
		playfield.addNote(note.lane, note.chartTime.time, note.chartTime.snap);
	}

	return playfield;
}

function getNotesInRange(startBeat: number, endBeat: number, timingPoint: TimingPoint = timingPoints[0]): Note[] {
	return notes.filter((note) => {
		return note.chartTime.timingPoint === timingPoint &&
			note.chartTime.beat >= startBeat &&
			note.chartTime.beat < endBeat;
	});
}

function parseChart() {
	const timingPoint = noteData.timingPoints[0];
	timingPoints.push(new TimingPoint(timingPoint.bpm, timingPoint.time));

	for (const note of noteData.notes) {
		const chartTime = new ChartTime(timingPoints[0], note.beat);

		notes.push({
			chartTime,
			lane: note.lane
		});
	}

	lastBeat = notes[notes.length - 1].chartTime.beat + 1;
}

export function getTimingPoints(): TimingPoint[] {
	return timingPoints;
}

parseChart();