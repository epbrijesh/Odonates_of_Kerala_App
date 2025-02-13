import { Observable, Frame, Utils } from '@nativescript/core';

export class LearnViewModel extends Observable {
  constructor() {
    super();
  }

  goBack() {
    Frame.topmost().goBack();
  }

  openIntroBook() {
    Utils.openUrl("https://ia601705.us.archive.org/24/items/introduction-to-odonata-2/Introduction%20to%20Odonata%202.pdf");
  }

  openSpreadwings() {
    Utils.openUrl("https://ia802707.us.archive.org/7/items/spreadwings-vol-i-issue-1/Spreadwings%20Vol%20I%20%20Issue%201.pdf");
  }

  openOdonataKerala() {
    Utils.openUrl("https://ia801001.us.archive.org/17/items/dli.zoological.occpapers.269/index.pdf");
  }
}