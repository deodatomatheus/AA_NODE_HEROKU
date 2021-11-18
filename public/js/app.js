//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording
var userName							//Name of the user, used in filename
var filename
var audio_blob
var sendedCount = 0
var sentences = [
	"assalto dinheiro assalto playboy",
	"o socorro perdeu playboy",
	"passa o socorro dinheiro",
	"playboy passa o dinheiro",
	"perdeu assalto passa dinheiro",
	"playboy dinheiro o assalto",
	"socorro assalto perdeu passa",
	"playboy perdeu o passa",
	"socorro socorro assalto dinheiro"
]

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");
var pauseButton = document.getElementById("uploadButton");

$('#meuModal').modal()


function reply_click(clicked_id) {
	var str = $("#modal-name").val();
	if (str.length) {
		userName = str
		$('#meuModal').modal('hide')
	} else {
		alert("Informe seu nome")
	}
}


//add events to those 3 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);
pauseButton.addEventListener("click", uploadToDb);

$('#frase').html("Frase: " + sentences[sendedCount])

function uploadToDb() {//falta colocar estado de enviando
	var xhr = new XMLHttpRequest();
	xhr.onload = function (e) {
		if (this.readyState === 4) {
			console.log("Server returned: ", e.target.responseText);
		}
	};
	var fd = new FormData();
	fd.append("file", audio_blob, filename);
	xhr.open("POST", "/file/upload", true);
	xhr.send(fd);
	pauseButton.disabled = true;
	//mudar a frase
	sendedCount++;
	$('#audio-info').html("");
	if (sendedCount < sentences.length)
		$('#frase').html("Frase: " + sentences[sendedCount])
	else {
		$('#frase').html("Obrigado!!!")
		recordButton.disabled = true;
	}

}
function startRecording() {
	//console.log("recordButton clicked");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/

	var constraints = { audio: true, video: false }

	/*
	  Disable the record button until we get a success or fail from getUserMedia() 
  */

	recordButton.disabled = true;
	stopButton.disabled = false;
	pauseButton.disabled = true;

	/*
		We're using the standard promise based getUserMedia() 
		https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
		//console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext({ sampleRate: 16000 });
		//update the format 
		//document.getElementById("formats").innerHTML = "Format: 1 channel pcm @ " + audioContext.sampleRate / 1000 + "kHz"

		/*  assign to gumStream for later use  */
		gumStream = stream;

		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input, { numChannels: 1 })

		//start the recording process
		rec.record()

	}).catch(function (err) {
		//enable the record button if getUserMedia() fails
		recordButton.disabled = false;
		stopButton.disabled = true;
		pauseButton.disabled = true
	});
}

function pauseRecording() {
	//console.log("pauseButton clicked rec.recording=",rec.recording );
	if (rec.recording) {
		//pause
		rec.stop();
		pauseButton.innerHTML = "Resume";
	} else {
		//resume
		rec.record()
		pauseButton.innerHTML = "Pause";

	}
}

function stopRecording() {
	//console.log("stopButton clicked");

	//disable the stop button, enable the record too allow for new recordings
	stopButton.disabled = true;
	recordButton.disabled = false;

	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);
}

function createDownloadLink(blob) {

	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');

	//name of .wav file to use during upload and download (without extendion)
	
	filename = (userName + '_' + sentences[sendedCount].replace(/\s/g, '_') + ".wav").toLowerCase()
	audio_blob = blob
	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	pauseButton.disabled = false;

	$('#audio-info').html(au);
}

