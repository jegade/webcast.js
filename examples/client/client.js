
import { Socket } from "./webcast.js";


const record = document.querySelector('.record');
const stop = document.querySelector('.stop');
const soundClips = document.querySelector('.sound-clips');
const canvas = document.querySelector('.visualizer');
const mainSection = document.querySelector('.main-controls');


let audioCtx;
const canvasCtx = canvas.getContext("2d");

function visualize(stream) {
    if(!audioCtx) {
      audioCtx = new AudioContext();
    }
  
    const source = audioCtx.createMediaStreamSource(stream);
  
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
  
    source.connect(analyser);
    //analyser.connect(audioCtx.destination);
  
    draw()
  
    function draw() {
      const WIDTH = canvas.width
      const HEIGHT = canvas.height;
  
      requestAnimationFrame(draw);
  
      analyser.getByteTimeDomainData(dataArray);
  
      canvasCtx.fillStyle = 'rgb(200, 200, 200)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  
      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
  
      canvasCtx.beginPath();
  
      let sliceWidth = WIDTH * 1.0 / bufferLength;
      let x = 0;
  
  
      for(let i = 0; i < bufferLength; i++) {
  
        let v = dataArray[i] / 128.0;
        let y = v * HEIGHT/2;
  
        if(i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
  
        x += sliceWidth;
      }
  
      canvasCtx.lineTo(canvas.width, canvas.height/2);
      canvasCtx.stroke();
  
    }
  }
  

if (navigator.mediaDevices) {
    console.log("getUserMedia supported.");

    const constraints = { audio: true };
    let chunks = [];

    navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
            const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            var webcast = new Socket({
                mediaRecorder: mediaRecorder,
                url: "ws://user:pass@10.0.4.3:8080/mount",
                info: {}
            });


            mediaRecorder.start(1000 / 25 );

            visualize(stream);

            
        })
        .catch((err) => {
            console.error(`The following error occurred: ${err}`);
        });
}

