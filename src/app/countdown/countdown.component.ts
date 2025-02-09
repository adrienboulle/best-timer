import { Component, HostListener } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { formatTimes } from '../helper';
import { ITimer } from '../interfaces';

const INTERVAL = 10; // ms
const TITLE = 'Timer';

@Component({
  selector: 'app-countdown',
  templateUrl: './countdown.component.html',
  styleUrls: ['./countdown.component.scss'],
})
export class CountdownComponent {
  public startTime: ITimer;
  public delta: number;
  public deltaFormated: ITimer;
  public lastResume: number;
  public pastTime: number;

  public isPaused: boolean = true;
  public isStart: boolean = true;
  public interval: number;

  public withArrows: boolean = true;
  public isTimeUp: boolean = false;
  public initialTime: number = 0;

  constructor(
    private _title: Title,
  ) {
    this.resetTimer();
  }

  public updateInitialTimer(timer: ITimer): void {
    this.initialTime = this._formatTimerToTime(timer);
    this.resetTimer();
  }

  public play(): void {
    if (!this.initialTime) {
      return;
    }

    this.withArrows = false;
    this.lastResume = Date.now();

    this.interval = setInterval(() => {
      this.delta = this.initialTime - (Date.now() - this.lastResume + this.pastTime);

      if (this.delta <= 0) {
        this.isTimeUp = true;
        this.clear();
      } else {
        this.deltaFormated = this._formatTimeToTimer(this.delta);
        this._title.setTitle(`${this.deltaFormated.h} : ${this.deltaFormated.m} : ${this.deltaFormated.s}`);
      }
    }, INTERVAL);

    this.isStart = false;
  }

  public pause(): void {
    clearInterval(this.interval);
    this.withArrows = true;
    this.pastTime = this.initialTime - this.delta;
  }

  public togglePause(): void {
    if (this.isPaused) {
      this.play();
    } else {
      this.pause();
    }

    this.isPaused = !this.isPaused;
  }

  public clear(): void {
    if (this.isStart) {
      this.initialTime = 0;
    }

    this.pause();
    this.isStart = true;
    this.isPaused = true;
    this.resetTimer();
  }

  public resetTimer(): void {
    this.pastTime = 0;
    this.delta = 0;

    if (this.initialTime) {
      this.deltaFormated = this._formatTimeToTimer(this.initialTime);
    } else {
      this.deltaFormated = this._formatTimeToTimer(this.delta);
      this._title.setTitle(TITLE);
    }
  }

  @HostListener('document:keydown', ['$event'])
  public onKeyBoardEvent(event: KeyboardEvent): void {
    if (this.isTimeUp) {
      this.isTimeUp = false;

      return;
    }

    switch (event.code) {
      case 'Enter': {
        this.clear();
        this.togglePause();

        break;
      }
      case 'Space': {
        this.togglePause();

        break;
      }
      case 'Delete':
      case 'Backspace': {
        this.clear();

        break;
      }
    }
  }

  @HostListener('document:click')
  public onGlobalClick(): void {
    this.isTimeUp = false;
  }

  public ngOnDestroy(): void {
    this.clear();
  }

  private _formatTimeToTimer(value: number): ITimer {
    const hours = Math.trunc(value / 1000 / 3600);
    const mins = Math.trunc((value - hours * 3600 * 1000) / 1000 / 60);
    const secs = Math.trunc((value - hours * 3600 * 1000 - mins * 60 * 1000) / 1000);
    const ms = Math.trunc((value - hours * 3600 * 1000 - mins * 60 * 1000 - secs * 1000) / 10);

    const strHours = formatTimes(hours);
    const strMins = formatTimes(mins);
    const strSecs = formatTimes(secs);
    const strMs = formatTimes(ms);

    return {
      h: strHours,
      m: strMins,
      s: strSecs,
      ms: strMs,
    };
  }

  private _formatTimerToTime(timer: ITimer): number {
    const hours = +timer.h * 3600 * 1000;
    const mins = +timer.m * 60 * 1000;
    const secs = +timer.s * 1000;
    const ms = +timer.ms * 10;

    return hours + mins + secs + ms;
  }
}
