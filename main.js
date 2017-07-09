var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = 'en-IN';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

var currentSongNumber = 1;
var willLoop = 0;
var willShuffle = 0;

var songs = [
  {
    'name': 'Badri Ki Dulhania (Title Track)',
    'artist': 'Neha Kakkar, Monali Thakur, Ikka Singh, Dev Negi',
    'album': 'Badrinath ki Dulhania',
    'duration': '2:56',
    'fileName': 'song1.mp3'
  },
  {
    'name': 'Humma Song',
    'artist': 'Badshah, Jubin Nautiyal, Shashaa Tirupati',
    'album': 'Ok Jaanu',
    'duration': '3:15',
    'fileName': 'song2.mp3'
  },
  {
    'name': 'Nashe Si Chadh Gayi',
    'artist': 'Arijit Singh',
    'album': 'Befikre',
    'duration': '2:34',
    'fileName': 'song3.mp3'
  },
  {
    'name': 'The Breakup Song',
    'artist': 'Nakash Aziz, Arijit Singh, Badshah, Jonita Gandhi',
    'album': 'Ae Dil Hai Mushkil',
    'duration': '2:29',
    'fileName': 'song4.mp3'
  }
];

$('.welcome-screen button').on('click', function() {
  var name = $('#name-input').val();
  if(name.length > 2) {
    var message = "Welcome, " + name;
    $('.main .user-name').text(message);
    $('.welcome-screen').addClass('hidden');
    $('.main').removeClass('hidden');
  }
  else {
    $('#name-input').addClass('error');
  }
});

$('.play-icon').on('click', function() {
  toggleSong();
});

$('body').on('keypress', function(event) {
  if(event.keyCode == 32 && event.target.tagName != 'INPUT')
    toggleSong();
});

// This function toggles the audio, regardless of how the song is toggled,
// i.e., using the Play/Pause button, etc.
function toggleSong() {
  var song = document.querySelector('audio');
  if(song.paused) {
    $('.play-icon').removeClass('fa-play').addClass('fa-pause');  // If the song is paused, start playing it
    song.play();                                                  // and change the icon of Toggle button.
  }
  else {
    $('.play-icon').removeClass('fa-pause').addClass('fa-play');  // If the song is playing, pause it
    song.pause();                                                 // and change the icon of Toggle button.
  }
}

// Update the current time of the song as well as the total duration of the song.
function updateCurrentTime() {
  var song = document.querySelector('audio');
  var currentTime = fancyTimeFormat(Math.floor(song.currentTime));
  var duration = fancyTimeFormat(Math.floor(song.duration));
  $('.time-elapsed').text(currentTime);
  $('.song-duration').text(duration);
}

$(document).ready(function() {
  changeCurrentSongDetails(songs[0]);
  for(var i=0; i<songs.length; ++i) {
    var obj = songs[i];
    var name = '#song' + (i+1);
    var song = $(name);
    song.find('.song-name').text(obj.name);
    song.find('.song-artist').text(obj.artist);
    song.find('.song-album').text(obj.album);
    song.find('.song-length').text(obj.duration);
    addSongNameClickEvent(obj, i+1);
  }
  updateCurrentTime();
  setInterval(function() {
    updateCurrentTime();
  }, 1000);

  $('#songs').DataTable({
    paging: false
  });
});

function fancyTimeFormat(time) {
  // Hours, minutes and seconds
  var hrs = ~~(time / 3600);
  var mins = ~~((time % 3600) / 60);
  var secs = time % 60;

  // Output like "1:01" or "4:03:59" or "123:03:59"
  var ret = "";

  if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
  }

  ret += "" + mins + ":" + (secs < 10 ? "0" : "");
  ret += "" + secs;
  return ret;
}

function addSongNameClickEvent(song, position) {
  var songId = '#song' + position;
  var fileName = song.fileName;
  $(songId).on('click', function() {
    var audio = document.querySelector('audio');
    if(audio.src.search(fileName) != -1) {
      toggleSong();
    }
    else {
      audio.src = fileName;
      toggleSong();
      changeCurrentSongDetails(song);
    }
  });
}

function changeCurrentSongDetails(song) {
  $('.current-song-name').text(song.name);
  $('.current-song-album').text(song.album);
}

// Updates the progress bar of the player as the song progresses with time.
$('audio').on('timeupdate', function() {
  var audio = document.querySelector('audio');
  $('.progress-filled').stop().animate({'width': (audio.currentTime) / audio.duration * 100 + '%'}, 250, 'linear');
});

// The 'scrub' function: it updates the current time whenever the user clicks
// anywhere on the progress bar.
$('.player-progress').on('click', function(event) {
  var audio = document.querySelector('audio');
  var progress = document.querySelector('.player-progress');

  var scrubTime = (event.offsetX / progress.offsetWidth) * audio.duration;
  audio.currentTime = scrubTime;
});

// The following code is to implement the looping functionality.
// Toggle the looping ability.
$('.fa-repeat').on('click',function() {
    $('.fa-repeat').toggleClass('disabled')
    willLoop = 1 - willLoop;
});

//The actual looping code. Runs only if looping is enabled.
$('audio').on('ended', function() {
  // Run the following code only if willLoop == 1, i.e., if the player will loop.
  if(willLoop) {
    var audio = document.querySelector('audio');
    if(currentSongNumber < songs.length) {
      // PLay the next song
      var nextSongObj = songs[currentSongNumber];
      audio.src = nextSongObj.fileName;   // Change the source
      toggleSong();   // Play the next song
      changeCurrentSongDetails(nextSongObj);  // Change the song details in the player controls
      currentSongNumber++;  // Increment the current song number.
    }
    else {
      // Play the first song
      audio.src = songs[0].fileName;
      toggleSong();
      changeCurrentSongDetails(songs[0]);
      currentSongNumber = 1;
    }
  }
});
// End of code for looping functionality.

$('.fa-random').on('click', function() {
  $('.fa-random').toggleClass('disabled');
  willShuffle = 1 - willShuffle;
});

$('audio').on('ended', function() {
  if(willShuffle) {
    audio = document.querySelector('audio');
    currentSongNumber = Math.floor((Math.random() * 4) + 1);
    var nextSongObj = songs[currentSongNumber - 1];
    audio.src = nextSongObj.fileName;
    toggleSong();
    changeCurrentSongDetails(nextSongObj);
  }
});

// Code for the 'Next' button.
$('.fa-step-forward').on('click', function() {
  var audio = document.querySelector('audio');
  if(currentSongNumber < songs.length) {
    currentSongNumber++;
    var nextSongObj = songs[currentSongNumber - 1];
    audio.src = nextSongObj.fileName;
    toggleSong();
    changeCurrentSongDetails(nextSongObj);
  }
  else {
    currentSongNumber = 1;
    audio.src = songs[0].fileName;
    toggleSong();
    changeCurrentSongDetails(songs[0]);
  }
});

// Code for the 'Previous' button.
$('.fa-step-backward').on('click', function() {
  var audio = document.querySelector('audio');
  if(currentSongNumber >= 1) {
    currentSongNumber--;
    var prevSongObj = songs[currentSongNumber - 1];
    audio.src = prevSongObj.fileName;
    toggleSong();
    changeCurrentSongDetails(prevSongObj);
  }
  else {
    currentSongNumber = songs.length;
    audio.src = songs[currentSongNumber - 1].fileName;
    toggleSong();
    changeCurrentSongDetails(songs[currentSongNumber - 1]);
  }
});

// The following code is meant to use the Web Speech API.
$('.fa-microphone').on('click', function() {
  recognition.start();
  console.log('Started!');
});

recognition.onresult = function(event) {
  var last = event.results.length - 1;
  var transcript = event.results[last][0].transcript;
  alert(transcript);
  var song = document.querySelector('audio');
  if(song.paused===true && transcript.toUpperCase() === 'PLAY') {
    $('.play-icon').removeClass('fa-play').addClass('fa-pause');
    song.play();
    // alert("Is paused: " + song.paused);
    console.log("Is paused: " + song.paused);
  }
  else if(transcript.toUpperCase() === 'PAUSE') {
    $('.play-icon').removeClass('fa-pause').addClass('fa-play');
    song.pause();
    // alert("Is paused: " + song.paused);
    console.log("Is paused: " + song.paused);
  }
};

recognition.onspeechend = function() {
  recognition.stop();
};
