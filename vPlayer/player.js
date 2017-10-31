var Player = (function () {
    function Player(content) {
        var _this = this;
        this.speed = Speed.COMMON;
        this.fullscreen = false;
        this.video = content.querySelector("video");
        this.togglePlayButton = content.querySelector(".togglePlay");
        this.toggleSpeedButton = content.querySelector(".speed");
        this.up10Button = content.querySelector(".up_10");
        this.down10Button = content.querySelector(".down_10");
        this.muteButton = content.querySelector(".mute");
        this.fullScreenButton = content.querySelector(".fullscreen");
        this.togglePlayButton.addEventListener('click', function () { return _this.togglePlay(); });
        this.toggleSpeedButton.addEventListener('click', function () { return _this.toggleSpeed(); });
        this.muteButton.addEventListener('click', function () { return _this.toggleMute(); });
        this.up10Button.addEventListener('click', function () { return _this.video.currentTime += 10; });
        this.down10Button.addEventListener('click', function () { return _this.video.currentTime -= 10; });
        this.fullScreenButton.addEventListener('click', function () { return _this.toggleFullScreen(); });
        this.progressBar = new ProgressBarManager(this.video, content.querySelector(".progress_bar"), content.querySelector(".text_progress"));
        this.volumeManager = new VolumeManager(this.video, content.querySelector(".sound"));
        this.video.addEventListener("ended", function () { return _this.togglePlayButton.innerText = "Play"; });
    }
    Player.prototype.togglePlay = function () {
        if (this.video.paused) {
            this.video.play();
            this.togglePlayButton.innerText = "Pause";
        }
        else {
            this.video.pause();
            this.togglePlayButton.innerText = "Play";
        }
    };
    Player.prototype.toggleMute = function () {
        if (this.video.muted) {
            this.video.muted = false;
            this.muteButton.style.textDecoration = "none";
        }
        else {
            this.video.muted = true;
            this.muteButton.style.textDecoration = "line-through";
        }
    };
    Player.prototype.toggleSpeed = function () {
        switch (this.speed) {
            case Speed.HALF:
                this.speed = Speed.COMMON;
                this.video.playbackRate = 1;
                this.toggleSpeedButton.innerText = "1";
                break;
            case Speed.COMMON:
                this.speed = Speed.DOUBLE;
                this.video.playbackRate = 2;
                this.toggleSpeedButton.innerText = "2";
                break;
            case Speed.DOUBLE:
                this.speed = Speed.HALF;
                this.video.playbackRate = 0.5;
                this.toggleSpeedButton.innerText = "0.5";
                break;
        }
    };
    Player.prototype.toggleFullScreen = function () {
        if (!this.fullscreen) {
            if (this.video.requestFullscreen) {
                this.video.requestFullscreen();
            }
            else if (this.video.mozRequestFullScreen) {
                this.video.mozRequestFullScreen();
            }
            else if (this.video.webkitRequestFullscreen) {
                this.video.webkitRequestFullscreen();
            }
            this.fullscreen = true;
        }
        else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            }
            else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.fullscreen = false;
        }
    };
    return Player;
}());
var ProgressBarManager = (function () {
    function ProgressBarManager(video, bar, textProgress) {
        var _this = this;
        var self = this;
        this.video = video;
        this.progress = bar.querySelector(".progress");
        this.bar = bar;
        this.textProgress = textProgress;
        setInterval(function () { return _this.doProgress(); }, 100);
        var isMouseDown = false;
        var isPaused;
        this.bar.addEventListener("mousedown", function (event) {
            isPaused = video.paused;
            video.pause();
            var x = event.offsetX / bar.offsetWidth;
            video.currentTime = x * video.duration;
            isMouseDown = true;
        });
        this.bar.addEventListener("mouseup", function () {
            isMouseDown = false;
            if (!isPaused)
                video.play();
        });
        this.bar.addEventListener("click", function (event) {
            isPaused = video.paused;
            var x = event.offsetX / bar.offsetWidth;
            video.currentTime = x * video.duration;
            isMouseDown = false;
            if (!isPaused)
                video.play();
        });
        this.bar.addEventListener("mousemove", function (event) {
            if (isMouseDown) {
                var x = event.offsetX / bar.offsetWidth;
                video.currentTime = x * video.duration;
            }
        });
        this.video.addEventListener("mousemove", function (event) {
            if (isMouseDown) {
                var x = event.offsetX / bar.offsetWidth;
                video.currentTime = x * video.duration;
            }
        });
        this.video.addEventListener("mouseup", function () {
            isMouseDown = false;
            if (!isPaused)
                video.play();
        });
    }
    ProgressBarManager.prototype.doProgress = function () {
        if (!this.video.ended) {
            var time = this.video.currentTime;
            var progress = time / this.video.duration;
            this.progress.style.width = progress * 100 + "%";
            this.textProgress.innerText = timeFormat(time) + "/" + timeFormat(this.video.duration);
        }
    };
    return ProgressBarManager;
}());
var VolumeManager = (function () {
    function VolumeManager(video, soundView) {
        var self = this;
        this.video = video;
        this.soundBar = soundView;
        this.volumeView = soundView.querySelector(".volume");
        this.changeVolume(video.volume);
        var isMouseDown = false;
        this.soundBar.addEventListener('mousedown', function () { return isMouseDown = true; });
        this.soundBar.addEventListener('mouseup', function () { return isMouseDown = false; });
        //this.soundBar.addEventListener('mouseout', () => isMouseDown = false)
        this.soundBar.addEventListener('mousemove', function (event) {
            if (isMouseDown) {
                var volume = event.offsetX / self.soundBar.offsetWidth;
                self.changeVolume(volume);
            }
        });
        this.soundBar.addEventListener('click', function (event) {
            var volume = event.offsetX / self.soundBar.offsetWidth;
            self.changeVolume(volume);
            isMouseDown = false;
        });
    }
    VolumeManager.prototype.changeVolume = function (volume) {
        this.video.volume = volume;
        this.volumeView.style.width = volume * 100 + "%";
    };
    return VolumeManager;
}());
var Speed;
(function (Speed) {
    Speed[Speed["HALF"] = 0] = "HALF";
    Speed[Speed["COMMON"] = 1] = "COMMON";
    Speed[Speed["DOUBLE"] = 2] = "DOUBLE";
})(Speed || (Speed = {}));
function timeFormat(time) {
    var minutes = Math.round(time / 60);
    var sec = Math.round(time % 60);
    return ("00" + minutes).slice(-2) + ":" + ("00" + sec).slice(-2);
}
window.onload = function () { return new Player(document.querySelector(".movie_player")); };
