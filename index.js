const fs = require("fs");
const { fps, filePath } = require("./config.json");
const { spawn } = require("child_process");

const startTime = new Date().getTime() / 1000;

// Remove existing frames and output
fs.rmSync("./frames", { recursive: true, force: true });
fs.rmSync("./output", { recursive: true, force: true });

// Create new frames and output
fs.mkdirSync("./frames");
fs.mkdirSync("./output");

console.log("Hold on...");

// Spawn a child process to extract frames from the video using FFmpeg
const cp = spawn("ffmpeg", [
	"-i",
	filePath,
	"-filter:v",
	"fps=" + fps,
	"frames/%d.png",
]);

// Once frames are extracted, spawn another child process to convert frames to ASCII art using img2ascii
cp.on("close", () => {
	const img2asciiProcess = spawn("img2ascii");
	img2asciiProcess.on("close", () => {
		//osu format

		let q = `osu file format v14
[General]
AudioFilename: audio.mp3
AudioLeadIn: 0
PreviewTime: -1
Countdown: 0
SampleSet: None
StackLeniency: 0.7
Mode: 0
LetterboxInBreaks: 0
WidescreenStoryboard: 0
[Editor]
DistanceSpacing: 2.6
BeatDivisor: 16
GridSize: 4
TimelineZoom: 1
[Metadata]
Title:bad apple
TitleUnicode:bad apple
Artist:amogus
ArtistUnicode:amogus
Creator:o_init
Version:visualisation
Source:urmom
Tags:bad apple shit map touhou circles art
BeatmapID:3389374
BeatmapSetID:1660266
[Difficulty]
HPDrainRate:5
CircleSize:7
OverallDifficulty:0
ApproachRate:9
SliderMultiplier:1.4
SliderTickRate:1
[Events]
//Background and Video events
//Break Periods
//Storyboard Layer 0 (Background)
//Storyboard Layer 1 (Fail)
//Storyboard Layer 2 (Pass)
//Storyboard Layer 3 (Foreground)
//Storyboard Layer 4 (Overlay)
//Storyboard Sound Samples
[TimingPoints]
0,600,4,1,0,100,1,0
[HitObjects]
`;

		const frames = fs
			.readdirSync("./output/")
			.sort(
				(a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]),
			);

		frames.forEach((frame, index) => {
			let w = [];
			const asciiArt = fs.readFileSync("output/" + frame).toString();

			// keep only the borders of the ASCII art
			function clear(asciiArt) {
				const asciiArr = [...asciiArt];
				let lineLength =
					asciiArt.match("(.+\n)")?.[1].length || asciiArt.length;
				let clearedAscii = "";
				asciiArr.forEach((char, index) => {
					if (char === " ") {
						clearedAscii += " ";
						return;
					}
					if (
						asciiArr[index - 1] === char &&
						asciiArr[index - 1 - lineLength] === char &&
						asciiArr[index - lineLength] === char &&
						asciiArr[index + lineLength] === char &&
						asciiArr[index + 1] === char &&
						asciiArr[index + 1 + lineLength] === char
					) {
						clearedAscii += " ";
						return;
					}
					clearedAscii += char;
				});
				return clearedAscii;
			}

			let asciiChars = [...clear(asciiArt)];
			const positions = {};
			let lineLength =
				asciiChars.join("").match("(.+\n)")?.[1].length || asciiArt.length;
			let y = 1;

			asciiChars.forEach((char, index) => {
				positions[index] = [3 * ((index % lineLength) + 2) + 1, y * 5];
				if (char === "\n") y++;
			});

			asciiChars.forEach((char, index) => {
				if (char !== " " && char !== "\n" && char !== "\r") {
					w.push(positions[index]);
				}
			});

			q +=
				"\n" +
				w
					.map((pos) => pos + "," + index * (1000 / fps) + ",1,0,0:0:0:0:")
					.join("\n");
		});

		// Write the output to a file
		fs.writeFileSync("output.txt", q);

		console.log(
			"Done in " + (new Date().getTime() / 1000 - startTime) + " seconds",
		);
		console.log(
			"Create a map (bpm doesn't matter) and then copy the output.txt file and paste it under [HitObjects]",
		);
	});
});
