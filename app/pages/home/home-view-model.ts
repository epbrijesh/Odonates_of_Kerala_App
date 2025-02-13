import { Observable, Frame } from '@nativescript/core';
import { odonates } from '../../data/odonates';
import { DateService } from '../../services/date.service';

export class HomeViewModel extends Observable {
  private _featuredOdonate;

  constructor() {
    super();
    const dateService = DateService.getInstance();
    const randomIndex = dateService.getRandomNumber(odonates.length);
    this._featuredOdonate = odonates[randomIndex];
  }

  get featuredOdonate() {
    return this._featuredOdonate;
  }

  onFeaturedOdonateTap() {
    Frame.topmost().navigate({
      moduleName: "pages/detail/detail-page",
      context: this._featuredOdonate,
      clearHistory: false
    });
  }

  onSearchTap() {
    Frame.topmost().navigate({
      moduleName: "pages/list/list-page",
      clearHistory: false
    });
  }

  onLearnTap() {
    Frame.topmost().navigate({
      moduleName: "pages/learn/learn-page",
      clearHistory: false
    });
  }

  onChecklistsTap() {
    Frame.topmost().navigate({
      moduleName: "pages/checklist/checklist-page",
      clearHistory: false
    });
  }

  onAboutTap() {
    Frame.topmost().navigate({
      moduleName: "pages/about/about-page",
      clearHistory: false
    });
  }
}