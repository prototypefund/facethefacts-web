import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

//import { CameraPreviewOptions } from "@ionic-native/camera-preview";
import { IonButton } from "@ionic/react";

import {
	BlazeFaceModel,
	load,
	NormalizedFace,
} from "@tensorflow-models/blazeface";

import { createWorker, createScheduler } from "tesseract.js";
import Fuse from "fuse.js";

import "./CameraView.css";

// TODO: Refactor to properly make use of async functions and promises
// DetectFace should return a promise,
// upon resolve we detect Characters,
// upon resolve we fuzzy search for the politicians name,
// upon resolve we redirect

// Pseudo Code ideal structure component

// async componentDidMount(){
//   await this.startCamera().then
//
//	 await this.detectFaceFromVideoFrame().then

//	 await this.detectTextFromVideoFrame().then

//	 this.redirectToProfile(candidateId)

// detectFaceFromVideoFrame(){
//model.detect()
// for i in results.length
// 	this.setState(faces[i]: results[i])
//}

class CameraView extends React.PureComponent<RouteComponentProps> {
	constructor(props: RouteComponentProps) {
		super(props);
	}
	state = {
		politicianDetected: false,
	};

	canvasRef: React.RefObject<HTMLCanvasElement> = React.createRef();
	videoRef: React.RefObject<HTMLVideoElement> = React.createRef();
	stream?: MediaStream;

	cameraOpts = {
		x: 0,
		y: 0,
		width: window.screen.width,
		height: window.screen.height * 0.8,
		camera: "rear",
		tapPhoto: true,
		previewDrag: false,
		toBack: true,
		alpha: 1,
	};

	scheduler = createScheduler();

	async componentDidMount() {
		await this.startCamera()
			.then((res) => {
				console.log("started camera");
			})
			.catch((err) => {
				console.log(err);
			});
	}

	detectFaceFromVideoFrame = (
		model: BlazeFaceModel,
		video: React.RefObject<HTMLVideoElement>
	) => {
		if (video.current !== null) {
			model.estimateFaces(video.current, false).then(
				(predictions) => {
					this.showDetections(predictions);

					requestAnimationFrame(() => {
						this.detectFaceFromVideoFrame(model, video);
					});
				},
				(error) => {
					console.log("Couldn't start the webcam");
					console.error(error);
				}
			);
		}
	};

	initializeTesseract = async () => {
		for (let i = 0; i < 1; i++) {
			const worker = createWorker({
				logger: (m) => console.log(m),
			});
			await worker.load();
			await worker.loadLanguage("deu");
			await worker.initialize("deu");
			await worker.setParameters({
				tessedit_char_whitelist:
					"abcdefghijklmnopqrstuvwxyzäöüABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ",
			});
			this.scheduler.addWorker(worker);
		}
	};

	detectTextFromVideoFrame = async (
		canvas: React.RefObject<HTMLCanvasElement>,
		video: React.RefObject<HTMLVideoElement>
	) => {
		if (this.scheduler.getNumWorkers() === 0) {
			await this.initializeTesseract();
		}
		const start = new Date();

		if (video.current) {
			canvas.current
				?.getContext("2d")
				?.drawImage(
					video.current,
					0,
					0,
					canvas.current.width,
					canvas.current.height
				);

			await this.scheduler
				.addJob("recognize", canvas.current)
				.then((result) => {
					console.log(result.data.text);
					result.data.text.split("\n").forEach((line: String) => {
						console.log(line);
					});
					const list = result.data.text.split("\n");
					const options = {
						includeScore: true,
					};

					const fuse = new Fuse(list, options);

					const res = fuse.search("philipp amthor");
					console.log(res);
					if (res.length > 0) {
						this.redirectToProfile();
						return new Promise((resolve, reject) => {});
						/* this.setState({politicianDetected: true}) */
					}
					const end = new Date();
					console.log(
						`[${start.getMinutes()}:${start.getSeconds()} - ${end.getMinutes()}:${end.getSeconds()}], ${
							(end.getTime() - start.getTime()) / 1000
						} s`
					);
					requestAnimationFrame(() => {
						this.detectTextFromVideoFrame(canvas, video);
					});
				});
		}
	};

	redirectToProfile = async () => {
		console.log("terminating workers");
		await this.scheduler.terminate();

		console.log("stopping camera");
		const tracks = this.stream?.getTracks();
		if (tracks !== undefined) {
			for (let track of tracks) {
				track.stop();
			}
		}

		console.log("redirecting");
		this.props.history.push("/politician/1");
	};

	showDetections = (predictions: NormalizedFace[]) => {
		const ctx = this.canvasRef.current?.getContext(
			"2d"
		) as CanvasRenderingContext2D;

		ctx.canvas.width = this.cameraOpts.width;
		ctx.canvas.height = this.cameraOpts.height;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		predictions.forEach((prediction) => {
			const start: [number, number] = prediction.topLeft as [
				number,
				number
			];
			const end: [number, number] = prediction.bottomRight as [
				number,
				number
			];
			var probability = prediction.probability as number;

			const size = [end[0] - start[0], end[1] - start[1]];

			// Render a rectangle over each detected face.
			ctx.beginPath();
			ctx.strokeStyle = "green";
			ctx.lineWidth = 4;
			ctx.rect(start[0], start[1], size[0], size[1]);
			ctx.stroke();
			var prob = (probability * 100).toPrecision(5).toString();
			var text = prob + "%";
			ctx.fillStyle = "red";
			ctx.font = "13pt sans-serif";
			ctx.fillText(text, start[0] + 5, start[1] + 20);
		});
	};

	async startCamera() {
		if (this.videoRef.current !== null) {
			this.videoRef.current.style.width = String(this.cameraOpts.width);
			this.videoRef.current.style.height = String(this.cameraOpts.height);
			this.videoRef.current.addEventListener(
				"play",
				() => {
					this.draw();
				},
				false
			);
		}

		await navigator.mediaDevices
			.getUserMedia({
				video: { facingMode: "environment" },
				audio: false,
			})
			.then((stream: MediaStream) => {
				console.log(this.videoRef);
				if (this.videoRef.current !== null) {
					this.stream = stream;
					this.videoRef.current.srcObject = stream;
					this.videoRef.current.onloadedmetadata = (e) => {
						if (this.videoRef.current !== null) {
							console.log(e);
							console.log(this);
							this.videoRef.current.play();
						}
					};
					console.log(this.videoRef.current);
				}
			})
			.catch((err: {}) => {
				console.log(err);
			});
		return new Promise((resolve, reject) => {
			if (
				this.videoRef.current !== null &&
				typeof this.videoRef.current.srcObject !== "undefined"
			) {
				resolve({ value: "success" });
			} else {
				reject("error");
			}
		});
	}

	async draw() {
		console.log("Drawing");

		// This broke everything, it was added because we got the error 'no backend set'
		//console.log('Using TensorFlow backend: ', tf.getBackend());

		//const context = this.canvasRef.current?.getContext("2d");
		const model = await load();
		console.log(model);
		const video = this.videoRef;
		this.detectFaceFromVideoFrame(model, video);
		await this.detectTextFromVideoFrame(this.canvasRef, video);
	}
	render() {
		return (
			<div>
				{/* <IonButton onClick={this.startCamera.bind(this)}>
					Start Camera Preview
				</IonButton> */}
				{/* { this.state.politicianDetected ? <IonButton id='profile-button' routerLink='/politician/1' >Detected Philipp Amthor, view?</IonButton> : null } */}

				<video ref={this.videoRef} playsInline autoPlay></video>
				<canvas ref={this.canvasRef} id="camera-canvas"></canvas>
			</div>
		);
	}
}
export default withRouter(CameraView);