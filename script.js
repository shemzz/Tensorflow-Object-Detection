const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

// Check if webcam access is supported.
function getUserMediaSupported() {
    return !!(navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia);
  }
  
  // If webcam supported, add event listener to button for when user
  // wants to activate it to call enableCam function which we will 
  // define in the next step.
  if (getUserMediaSupported()) {
    enableWebcamButton.addEventListener('click', enableCam);
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }

  // Enable the live webcam view and start classification.
function enableCam(event) {
    // Only continue if the COCO-SSD has finished loading.
    if (!model) {
      return;
    }
    
    // Hide the button once clicked.
    event.target.classList.add('removed');  
    
    // getUsermedia parameters to force video but not audio.
    const constraints = {
      video: true
    };
  
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
      video.srcObject = stream;
      video.addEventListener('loadeddata', predictWebcam);
    });
}

var children = [];
  // Placeholder function for next step.
  
  // Store the resulting model in the global scope of our app.
  var model = undefined;
  
  cocoSsd.load().then(loadedModel => {
    model = loadedModel;
    demosSection.classList.remove('invisible');
  })

function predictWebcam() {
  // Now let's start classifying a frame in the stream.
  model.detect(video).then(function (predictions) {
    // Remove any highlighting we did previous frame.
    for (let i = 0; i < children.length; i++) {
      liveView.removeChild(children[i]);
    }
    children.splice(0);
    
    // Now lets loop through predictions and draw them to the live view if
    // they have a high confidence score.
    for (let n = 0; n < predictions.length; n++) {
      // If we are over 66% sure we are sure we classified it right, draw it!
      if (predictions[n].score > 0.66) {
        const p = document.createElement('p');
        p.innerText = predictions[n].class  + ' - with ' 
            + Math.round(parseFloat(predictions[n].score) * 100) 
            + '% confidence.';
        p.style = 'margin-left: ' + predictions[n].bbox[0] + 'px; margin-top: '
            + (predictions[n].bbox[1] - 10) + 'px; width: ' 
            + (predictions[n].bbox[2] - 10) + 'px; top: 0; left: 0;';

        const highlighter = document.createElement('div');
        highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: '
            + predictions[n].bbox[1] + 'px; width: ' 
            + predictions[n].bbox[2] + 'px; height: '
            + predictions[n].bbox[3] + 'px;';

        liveView.appendChild(highlighter);
        liveView.appendChild(p);
        children.push(highlighter);
        children.push(p);
        // doBoundingBoxesIntersect(predictions[0], predictions[1])
      }
    }
    
    // Call this function again to keep predicting when the browser is ready.
    window.requestAnimationFrame(predictWebcam);
  });
}
  
function doBoundingBoxesIntersect(box1, box2) {
  // Extract the coordinates of the boxes
  const [x1, y1, width1, height1] = box1;
  const [x2, y2, width2, height2] = box2;

  // Calculate the coordinates of the corners of each box
  const x1Min = x1;
  const x1Max = x1 + width1;
  const y1Min = y1;
  const y1Max = y1 + height1;

  const x2Min = x2;
  const x2Max = x2 + width2;
  const y2Min = y2;
  const y2Max = y2 + height2;

  // Check for intersection
  if (x1Min <= x2Max && x1Max >= x2Min && y1Min <= y2Max && y1Max >= y2Min) {
    console.log('intersected')
    return true; // Intersection detected
  }

  return false; // No intersection
}

// Example usage
// const box1 = [10, 10, 50, 50]; // [x, y, width, height]
// const box2 = [40, 40, 50, 50];
// const intersect = doBoundingBoxesIntersect(box1, box2);

// console.log("Do the bounding boxes intersect?", intersect);