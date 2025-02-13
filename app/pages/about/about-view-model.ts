import { Observable, Frame, Utils } from '@nativescript/core';

export class AboutViewModel extends Observable {
  constructor() {
    super();
  }

  goBack() {
    Frame.topmost().goBack();
  }

  openWebsite() {
    Utils.openUrl("https://thinkdigitdev.blogspot.com");
  }

  openPlayStore() {
    Utils.openUrl("https://play.google.com/store/apps/details?id=com.thinkdigit.butterflies.kerala");
  }
  
  openPlayStorePub() {
    Utils.openUrl("https://play.google.com/store/apps/developer?id=thinkdigit");
  }

  sendEmail() {
    Utils.openUrl("mailto:epbrijesh@gmail.com");
  }

  // New image double tap handlers
  onDeveloperImageTap() {
    Utils.openUrl("https://www.facebook.com/brijesh.ep");
  }

  onStearImageTap() {
    Utils.openUrl("https://stearorg.blogspot.com");
  }

  onTnhsImageTap() {
    Utils.openUrl("https://tnhs.info");
  }

  onWikipediaImageTap() {
    Utils.openUrl("https://ml.wikipedia.org");
  }

  onSosImageTap() {
    Utils.openUrl("https://odonatesociety.org");
  }

  onInaturalistImageTap() {
    Utils.openUrl("https://www.inaturalist.org");
  }

  onBoltImageTap() {
    Utils.openUrl("https://bolt.new");
  }

  onGithubImageTap() {
    Utils.openUrl("https://github.com/epbrijesh/Odonates_of_Kerala_App/");
  }
}