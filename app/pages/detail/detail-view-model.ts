import { Observable, Frame, GestureEventData, PinchGestureEventData, PanGestureEventData, Utils, Dialogs } from '@nativescript/core';
import { ZoomService } from '../../services/zoom.service';
import { ChecklistService } from '../../services/checklist.service';
import { ClipboardService } from '../../services/clipboard.service';

export class DetailViewModel extends Observable {
  private _species: any;
  private _zoomService: ZoomService;
  private _checklistService: ChecklistService;
  private _clipboardService: ClipboardService;
  private _isInChecklist: boolean;

  constructor(species: any) {
    super();
    this._species = species;
    this._zoomService = new ZoomService();
    this._checklistService = ChecklistService.getInstance();
    this._clipboardService = ClipboardService.getInstance();
    this._isInChecklist = this._checklistService.isInChecklist(species.id);
  }

  get species(): any {
    return this._species;
  }

  get isInChecklist(): boolean {
    return this._isInChecklist;
  }

  get checklistButtonText(): string {
    return this._isInChecklist ? "Remove from My Checklist" : "Add to My Checklist";
  }

  copyScientificInfo() {
    const text = `${this._species.sciName} | ${this._species.malayalamName} | ${this._species.commonName}`;
    
    if (!this._clipboardService.copyToClipboard(text)) {
      Dialogs.alert({
        title: "Error",
        message: "Failed to copy information. Please try again.",
        okButtonText: "OK"
      });
    }
  }

  copyToClipboard() {
    const hostPlantsText = this._species.hostPlants && this._species.hostPlants.length > 0 
    
    const details = [
      `Scientific Name: ${this._species.sciName}`,
      `Common Name: ${this._species.commonName}`,
      `Malayalam Name: ${this._species.malayalamName}`,
      `Family: ${this._species.family}`,
      `Description: ${this._species.description1} ${this._species.description2} ${this._species.description3} ${this._species.description4} ${this._species.description5}`,
      `Wikipedia: ${this._species.wikipediaLink}`
    ].filter(item => item !== '').join('\n\n');

    if (this._clipboardService.copyToClipboard("*Odonates of Kerala App* by Brijesh Pookkottur.\n https://play.google.com/store/apps/details?id=com.thinkdigit.odonatesofkerala\n\n"+details+"\n")) {
      Dialogs.alert({
        title: "Success",
        message: "Details copied to clipboard!\n\ \n\വിവരങ്ങള്‍ കോപ്പി ചെയ്തു. ഇനി എവിടേയും പേസ്റ്റ് ചെയ്യാം.",
        okButtonText: "OK"
      });
    } else {
      Dialogs.alert({
        title: "Error",
        message: "Failed to copy details. Please try again.",
        okButtonText: "OK"
      });
    }
  }

  onPinch(args: PinchGestureEventData) {
    try {
      if (!this._zoomService) {
        this._zoomService = new ZoomService();
      }
      this._zoomService.handlePinch(args);
    } catch (error) {
      console.error('Error in onPinch:', error);
    }
  }

  onDoubleTap(args: GestureEventData) {
    try {
      if (!this._zoomService) {
        this._zoomService = new ZoomService();
      }
      this._zoomService.handleDoubleTap(args);
    } catch (error) {
      console.error('Error in onDoubleTap:', error);
    }
  }

  onPan(args: PanGestureEventData) {
    try {
      if (!this._zoomService) {
        this._zoomService = new ZoomService();
      }
      this._zoomService.handlePan(args);
    } catch (error) {
      console.error('Error in onPan:', error);
    }
  }

  onSpeciesLinkTap() {
    Utils.openUrl(this._species.speciesLink);
  }

  onWikipediaLinkTap() {
    Utils.openUrl(this._species.wikipediaLink);
  }

  onCreditTap(args) {
    const photo = args.object.bindingContext;
    if (photo && photo.sourceUrl) {
      Utils.openUrl(photo.sourceUrl);
    }
  }

  onHostPlantTap(args) {
    const hostPlant = args.object.bindingContext;
    if (hostPlant && hostPlant.wikiLink) {
      Utils.openUrl(hostPlant.wikiLink);
    }
  }

  onChecklistTap() {
    if (this._isInChecklist) {
      this._checklistService.removeFromChecklist(this._species.id);
    } else {
      this._checklistService.addToChecklist(this._species.id);
    }
    this._isInChecklist = !this._isInChecklist;
    this.notifyPropertyChange('isInChecklist', this._isInChecklist);
    this.notifyPropertyChange('checklistButtonText', this.checklistButtonText);
  }

  goBack() {
    Frame.topmost().goBack();
  }
}