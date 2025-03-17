import { Observable, Frame, Utils } from '@nativescript/core';
import { speciesList } from '../../data/app_data';
import { DateService } from '../../services/date.service';

export class HomeViewModel extends Observable {
  private _featuredSpecies;

  constructor() {
    super();
    const dateService = DateService.getInstance();
    const randomIndex = dateService.getRandomNumber(speciesList.length);
    this._featuredSpecies = speciesList[randomIndex];
  }

  get featuredSpecies() {
    return this._featuredSpecies;
  }

  onFeaturedSpeciesTap() {
    Frame.topmost().navigate({
      moduleName: "pages/detail/detail-page",
      context: this._featuredSpecies,
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

  onTransectTap() {
    Frame.topmost().navigate({
      moduleName: "pages/transect/transect-page",
      clearHistory: false
    });
  }

  onAboutTap() {
    Frame.topmost().navigate({
      moduleName: "pages/about/about-page",
      clearHistory: false
    });
  }

  onAIIdentifierTap() {
    Utils.openUrl("https://theivaprakasham-odonata.hf.space/");
  }

  onFeedbackTap() {
    Utils.openUrl("https://forms.gle/PwZ9xxBiZcbtfrxP7");
  }
}