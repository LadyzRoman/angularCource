class Player
{
    private video: HTMLMediaElement;
    private progressBar: ProgressBarManager;
    private volumeManager: VolumeManager;

    private togglePlayButton: HTMLButtonElement;
    private toggleSpeedButton: HTMLButtonElement;
    private up10Button: HTMLButtonElement;
    private down10Button: HTMLButtonElement;
    private muteButton: HTMLButtonElement;
    private fullScreenButton: HTMLButtonElement;

    private speed : Speed;
    private fullscreen: boolean;

    constructor(content: HTMLElement)
    {
        this.speed = Speed.COMMON;
        this.fullscreen = false;

        this.video = content.querySelector("video");
        this.togglePlayButton = <HTMLButtonElement> content.querySelector(".togglePlay");
        this.toggleSpeedButton = <HTMLButtonElement> content.querySelector(".speed");
        this.up10Button = <HTMLButtonElement> content.querySelector(".up_10");
        this.down10Button = <HTMLButtonElement> content.querySelector(".down_10");
        this.muteButton = <HTMLButtonElement> content.querySelector(".mute");
        this.fullScreenButton = <HTMLButtonElement> content.querySelector(".fullscreen");

        this.togglePlayButton.addEventListener('click', () => this.togglePlay());
        this.toggleSpeedButton.addEventListener('click', () => this.toggleSpeed());
        this.muteButton.addEventListener('click', () => this.toggleMute());
        this.up10Button.addEventListener('click', () => this.video.currentTime += 10);
        this.down10Button.addEventListener('click', () => this.video.currentTime -= 10);
        this.fullScreenButton.addEventListener('click', () => this.toggleFullScreen());



        this.progressBar = new ProgressBarManager(this.video,
            <HTMLElement>content.querySelector(".progress_bar"),
            <HTMLElement>content.querySelector(".text_progress"));
        this.volumeManager = new VolumeManager(this.video, <HTMLElement>content.querySelector(".sound"));


        this.video.addEventListener("ended", () => this.togglePlayButton.innerText = "Play");
    }

    togglePlay(): void
    {
        if (this.video.paused) {
            this.video.play();
            this.togglePlayButton.innerText = "Pause";
        }
        else {
            this.video.pause();
            this.togglePlayButton.innerText = "Play";
        }
    }

    toggleMute(): void
    {
        if (this.video.muted)
        {
            this.video.muted = false;
            this.muteButton.style.textDecoration = "none";
        }
        else
        {
            this.video.muted = true;
            this.muteButton.style.textDecoration = "line-through";
        }

    }

    toggleSpeed(): void
    {
        switch (this.speed)
        {
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

    }

    toggleFullScreen(): void
    {
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
        else
        {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.fullscreen = false;
        }



    }
}

class ProgressBarManager
{
    private video: HTMLMediaElement;
    private progress: HTMLElement;
    private bar: HTMLElement;
    private textProgress: HTMLElement;

    constructor(video: HTMLMediaElement, bar: HTMLElement, textProgress: HTMLElement)
    {
        let self = this;
        this.video = video;
        this.progress = <HTMLElement>bar.querySelector(".progress");
        this.bar = bar;
        this.textProgress = textProgress;
        setInterval(() => this.doProgress(), 100);

        let isMouseDown = false;
        let isPaused;

        this.bar.addEventListener("mousedown", (event) =>
        {
            isPaused = video.paused;
            video.pause();
            let x = event.offsetX / bar.offsetWidth;
            video.currentTime = x * video.duration;
            isMouseDown = true;

        });
        this.bar.addEventListener("mouseup", () =>
        {
            isMouseDown = false;

            if (!isPaused)
                video.play();
        });
        this.bar.addEventListener("click", function(event)
        {
            isPaused = video.paused;
            let x = event.offsetX / bar.offsetWidth;
            video.currentTime = x * video.duration;
            isMouseDown = false;

            if (!isPaused)
                video.play();
        });
        this.bar.addEventListener("mousemove", function(event)
        {
            if (isMouseDown) {
                let x = event.offsetX / bar.offsetWidth;
                video.currentTime = x * video.duration;
            }
        });
        this.video.addEventListener("mousemove", function (event)
        {
            if (isMouseDown) {
                let x = event.offsetX / bar.offsetWidth;
                video.currentTime = x * video.duration;
            }
        });
        this.video.addEventListener("mouseup", () =>
        {
            isMouseDown = false;
            if (!isPaused)
                video.play();
        }
        );
    }

    doProgress(): void
    {
        if (!this.video.ended) {
            let time: number = this.video.currentTime;
            let progress: number = time / this.video.duration;

            this.progress.style.width = progress * 100 + "%";

            this.textProgress.innerText = timeFormat(time) + "/" + timeFormat(this.video.duration);
        }
    }
}

class VolumeManager
{
    private video: HTMLMediaElement;
    private soundBar: HTMLElement;
    private volumeView: HTMLElement;


    constructor(video: HTMLMediaElement, soundView: HTMLElement)
    {
        let self = this;
        this.video = video;
        this.soundBar = soundView;
        this.volumeView = <HTMLElement>soundView.querySelector(".volume");

        this.changeVolume(video.volume);


        let isMouseDown = false;
        this.soundBar.addEventListener('mousedown', () => isMouseDown = true);
        this.soundBar.addEventListener('mouseup', () => isMouseDown = false);
        //this.soundBar.addEventListener('mouseout', () => isMouseDown = false)
        this.soundBar.addEventListener('mousemove', function(event)
        {
            if (isMouseDown)
            {
                let volume = event.offsetX / self.soundBar.offsetWidth;
                self.changeVolume(volume);
            }
        });
        this.soundBar.addEventListener('click', function(event)
        {
            let volume = event.offsetX / self.soundBar.offsetWidth;
            self.changeVolume(volume);
            isMouseDown = false;
        });
    }

    changeVolume(volume: number): void
    {
        this.video.volume = volume;
        this.volumeView.style.width = volume * 100 + "%";
    }
}

enum Speed
{
    HALF,
    COMMON,
    DOUBLE
}


function timeFormat(time: number) : string
{
    let minutes = Math.round(time / 60);
    let sec = Math.round(time % 60);

    return ("00" + minutes).slice(-2) + ":" + ("00" + sec).slice(-2);
}



window.onload = () => new Player(<HTMLElement>document.querySelector(".movie_player"));