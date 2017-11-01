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
    private fullScreen: boolean;
    private isVideoPaused: boolean;

    constructor(content: HTMLElement)
    {
        this.speed = Speed.COMMON;
        this.fullScreen = false;
        this.isVideoPaused = true;

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

        this.progressBar = new ProgressBarManager(this, this.video,
            <HTMLElement>content.querySelector(".progress_bar"),
            <HTMLElement>content.querySelector(".text_progress"));
        this.volumeManager = new VolumeManager(this.video, <HTMLElement>content.querySelector(".sound"));


        this.video.addEventListener("ended", () => this.togglePlayButton.innerText = "Play");
        this.video.addEventListener("click", () => this.togglePlay());
    }

    togglePlay(): void
    {
        if (this.isVideoPaused) {
            this.isVideoPaused = false;
            this.video.play();
            this.togglePlayButton.innerText = "Pause";
        }
        else {
            this.isVideoPaused = true;
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
        if (!this.fullScreen) {
            if (this.video.requestFullscreen) {
                this.video.requestFullscreen();
            }
            else if (this.video.mozRequestFullScreen) {
                this.video.mozRequestFullScreen();
            }
            else if (this.video.webkitRequestFullscreen) {
                this.video.webkitRequestFullscreen();
            }
            this.fullScreen = true;
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
            this.fullScreen = false;
        }
    }
}

class ProgressBarManager
{
    private video: HTMLMediaElement;
    private progress: HTMLElement;
    private bar: HTMLElement;
    private textProgress: HTMLElement;

    constructor(player: Player, video: HTMLMediaElement, bar: HTMLElement, textProgress: HTMLElement)
    {
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

        this.bar.addEventListener("click", (event) =>
        {
            isPaused = video.paused;
            let x = event.offsetX / bar.offsetWidth;
            video.currentTime = x * video.duration;
            isMouseDown = false;

            if (!isPaused)
                video.play();
        });
        document.addEventListener('mouseup', (event) =>
        {
            if (isMouseDown) {
                isMouseDown = false;
                if (!isPaused && !video.ended)
                    video.play();
            }
        });
        document.addEventListener('mousemove', (event) =>
        {
            if (isMouseDown) {

                let offset = (<HTMLElement>document.querySelector(".movie_player")).offsetLeft;

                let x = (event.pageX - offset) / bar.offsetWidth;
                video.currentTime = x * video.duration;
            }
        });
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
        this.video = video;
        this.soundBar = soundView;
        this.volumeView = <HTMLElement>soundView.querySelector(".volume");

        this.changeVolume(video.volume);

        let isMouseDown = false;
        this.soundBar.addEventListener('mouseout', () => isMouseDown = false);
        this.soundBar.addEventListener('mouseup', () => isMouseDown = false);
        this.soundBar.addEventListener('mousedown', () => isMouseDown = true);
        this.soundBar.addEventListener('mousemove', (event) =>
        {
           if (isMouseDown)
           {
               let volume = event.offsetX / this.soundBar.offsetWidth;
               this.changeVolume(volume);
           }
        });

        this.soundBar.addEventListener('click', (event) =>
        {
            let volume = event.offsetX / this.soundBar.offsetWidth;
            this.changeVolume(volume);
            isMouseDown = false;
        });
    }

    changeVolume(volume: number): void
    {
        if (volume > 1)
            volume = 1;
        else if (volume < 0)
            volume = 0;

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
    let minutes = Math.floor(time / 60);
    let sec = Math.floor(time) % 60;

    return ("00" + minutes).slice(-2) + ":" + ("00" + sec).slice(-2);
}



window.onload = () => new Player(<HTMLElement>document.querySelector(".movie_player"));