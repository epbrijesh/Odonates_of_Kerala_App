import { Observable, Frame, GestureEventData, PinchGestureEventData, PanGestureEventData, Utils, Dialogs } from '@nativescript/core';
import { Odonate } from '../../models/odonate.model';
import { ZoomService } from '../../services/zoom.service';
import { ChecklistService } from '../../services/checklist.service';
import { ClipboardService } from '../../services/clipboard.service';

export class DetailViewModel extends Observable {
  private _odonate: Odonate;
  private _zoomService: ZoomService;
  private _checklistService: ChecklistService;
  private _clipboardService: ClipboardService;
  private _isInChecklist: boolean;

  constructor(odonate: Odonate) {
    super();
    this._odonate = odonate;
    this._zoomService = new ZoomService();
    this._checklistService = ChecklistService.getInstance();
    this._clipboardService = ClipboardService.getInstance();
    this._isInChecklist = this._checklistService.isInChecklist(odonate.id);
  }

  get odonate(): Odonate {
    return this._odonate;
  }

  get isInChecklist(): boolean {
    return this._isInChecklist;
  }

  get checklistButtonText(): string {
    return this._isInChecklist ? "Remove from My Checklist" : "Add to My Checklist";
  }

  copyScientificInfo() {
    const text = `${this._odonate.sciName} | ${this._odonate.malayalamName} | ${this._odonate.commonName}`;
    
    if (!this._clipboardService.copyToClipboard(text)) {
      Dialogs.alert({
        title: "Error",
        message: "Failed to copy information. Please try again.",
        okButtonText: "OK"
      });
    }
  }

  copyToClipboard() {
    const details = [
	  `Scientific Name: ${this._odonate.sciName}`,
      `Common Name: ${this._odonate.commonName}`,
      `Malayalam Name: ${this._odonate.malayalamName}`,
      `Family: ${this._odonate.family}`,
      `Description: ${this._odonate.description1} ${this._odonate.description2} ${this._odonate.description3} ${this._odonate.description4} ${this._odonate.description5}`,
      `Wikipedia: ${this._odonate.wikipediaLink}`
    ].join('\n\n');

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
    Utils.openUrl(this._odonate.speciesLink);
  }

  onWikipediaLinkTap() {
    Utils.openUrl(this._odonate.wikipediaLink);
  }

  onCreditTap(args) {
    const photo = args.object.bindingContext;
    if (photo && photo.sourceUrl) {
      Utils.openUrl(photo.sourceUrl);
    }
  }

  onChecklistTap() {
    if (this._isInChecklist) {
      this._checklistService.removeFromChecklist(this._odonate.id);
    } else {
      this._checklistService.addToChecklist(this._odonate.id);
    }
    this._isInChecklist = !this._isInChecklist;
    this.notifyPropertyChange('isInChecklist', this._isInChecklist);
    this.notifyPropertyChange('checklistButtonText', this.checklistButtonText);
  }

  goBack() {
    Frame.topmost().goBack();
  }
}