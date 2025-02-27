import { Observable, Frame, Dialogs } from '@nativescript/core';
import { ChecklistService } from '../../services/checklist.service';
import { ClipboardService } from '../../services/clipboard.service';
import { odonates } from '../../data/odonates';
import { Checklist } from '../../models/checklist.model';

export class ChecklistViewModel extends Observable {
  private checklistService: ChecklistService;
  private clipboardService: ClipboardService;
  private _checklistItems = [];
  private _activeChecklistName = "No Checklist Selected";
  private _activeChecklist: Checklist | null = null;

  constructor() {
    super();
    this.checklistService = ChecklistService.getInstance();
    this.clipboardService = ClipboardService.getInstance();
    this.loadActiveChecklist();
  }

  get checklistItems() {
    return this._checklistItems;
  }

  get activeChecklistName() {
    return this._activeChecklistName;
  }

  get activeChecklist() {
    return this._activeChecklist;
  }

  private loadActiveChecklist() {
    const activeChecklist = this.checklistService.getActiveChecklist();
    if (activeChecklist) {
      this._activeChecklistName = activeChecklist.name;
      this._activeChecklist = activeChecklist;
      this.notifyPropertyChange('activeChecklistName', this._activeChecklistName);
      this.notifyPropertyChange('activeChecklist', this._activeChecklist);
      this.loadChecklistItems(activeChecklist);
    }
  }

  private loadChecklistItems(checklist: Checklist) {
    this._checklistItems = odonates
      .filter(odonate => checklist.species.includes(odonate.id))
      .map((odonate, index) => ({
        id: odonate.id,
        serialNumber: index + 1,
        scientificName: odonate.scientificName,
        sciName: odonate.sciName,
        commonName: odonate.commonName,
        malayalamName: odonate.malayalamName,
        mainPhoto: odonate.mainPhoto,
        family: odonate.family,
        description1: odonate.description1,
		description2: odonate.description2,
		description3: odonate.description3,
		description4: odonate.description4,
		description5: odonate.description5,
        photos: odonate.photos,
        speciesLink: odonate.speciesLink,
        wikipediaLink: odonate.wikipediaLink
      }));
    this.notifyPropertyChange('checklistItems', this._checklistItems);
  }

  onItemTap(args) {
    const tappedItem = this._checklistItems[args.index];
    Frame.topmost().navigate({
      moduleName: "pages/detail/detail-page",
      context: tappedItem,
      clearHistory: false
    });
  }

  createNewChecklist() {
    Dialogs.prompt({
      title: "New Checklist",
      message: "Enter checklist name:",
      okButtonText: "Next",
      cancelButtonText: "Cancel",
      defaultText: ""
    }).then(nameResult => {
      if (nameResult.result) {
        Dialogs.prompt({
          title: "Location",
          message: "Enter location:",
          okButtonText: "Next",
          cancelButtonText: "Cancel",
          defaultText: ""
        }).then(placeResult => {
          if (placeResult.result) {
            Dialogs.prompt({
              title: "Survey Start Date",
              message: "Enter start date (YYYY-MM-DD):",
              okButtonText: "Next",
              cancelButtonText: "Cancel",
              defaultText: new Date().toISOString().split('T')[0]
            }).then(startDateResult => {
              if (startDateResult.result) {
                Dialogs.prompt({
                  title: "Survey End Date",
                  message: "Enter end date (YYYY-MM-DD):",
                  okButtonText: "Create",
                  cancelButtonText: "Cancel",
                  defaultText: new Date().toISOString().split('T')[0]
                }).then(endDateResult => {
                  if (endDateResult.result) {
                    const id = this.checklistService.createChecklist({
                      name: nameResult.text.trim(),
                      place: placeResult.text.trim(),
                      startDate: startDateResult.text.trim(),
                      endDate: endDateResult.text.trim(),
                      notes: ""
                    });
                    this.checklistService.setActiveChecklist(id);
                    this.loadActiveChecklist();
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  deleteChecklist() {
    const activeChecklist = this.checklistService.getActiveChecklist();
    if (!activeChecklist) {
      Dialogs.alert({
        title: "No Checklist",
        message: "No checklist is currently selected.",
        okButtonText: "OK"
      });
      return;
    }

    Dialogs.confirm({
      title: "Delete Checklist",
      message: `Are you sure you want to delete "${activeChecklist.name}"? This action cannot be undone.`,
      okButtonText: "Delete",
      cancelButtonText: "Cancel"
    }).then(result => {
      if (result) {
        this.checklistService.deleteChecklist(activeChecklist.id);
        this.loadActiveChecklist();
      }
    });
  }

  showChecklistPicker() {
    const checklists = this.checklistService.getChecklists();
    const options = {
      title: "Select Checklist",
      message: "Choose a checklist to view:",
      cancelButtonText: "Cancel",
      actions: checklists.map(list => `${list.name} (${list.startDate} to ${list.endDate})`)
    };

    Dialogs.action(options).then(result => {
      if (result !== "Cancel") {
        const selectedChecklist = checklists[options.actions.indexOf(result)];
        this.checklistService.setActiveChecklist(selectedChecklist.id);
        this.loadActiveChecklist();
      }
    });
  }

  editChecklistDetails() {
    const activeChecklist = this.checklistService.getActiveChecklist();
    if (!activeChecklist) return;

    Dialogs.prompt({
      title: "Edit Checklist",
      message: "Checklist name:",
      okButtonText: "Next",
      cancelButtonText: "Cancel",
      defaultText: activeChecklist.name
    }).then(nameResult => {
      if (nameResult.result) {
        Dialogs.prompt({
          title: "Location",
          message: "Enter location:",
          okButtonText: "Next",
          cancelButtonText: "Cancel",
          defaultText: activeChecklist.place
        }).then(placeResult => {
          if (placeResult.result) {
            Dialogs.prompt({
              title: "Survey Start Date",
              message: "Enter start date (YYYY-MM-DD):",
              okButtonText: "Next",
              cancelButtonText: "Cancel",
              defaultText: activeChecklist.startDate
            }).then(startDateResult => {
              if (startDateResult.result) {
                Dialogs.prompt({
                  title: "Survey End Date",
                  message: "Enter end date (YYYY-MM-DD):",
                  okButtonText: "Save",
                  cancelButtonText: "Cancel",
                  defaultText: activeChecklist.endDate
                }).then(endDateResult => {
                  if (endDateResult.result) {
                    this.checklistService.updateChecklist(activeChecklist.id, {
                      name: nameResult.text.trim(),
                      place: placeResult.text.trim(),
                      startDate: startDateResult.text.trim(),
                      endDate: endDateResult.text.trim()
                    });
                    this.loadActiveChecklist();
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  exportChecklist() {
    const activeChecklist = this.checklistService.getActiveChecklist();
    if (!activeChecklist || this._checklistItems.length === 0) {
      Dialogs.alert({
        title: "Empty Checklist",
        message: "This checklist is empty. Add some species first!",
        okButtonText: "OK"
      });
      return;
    }

    const formattedNames = this._checklistItems
      .map(item => `${item.serialNumber}. ${item.sciName}`)
      .join('\n');

    const checklistText = `My Odonata Checklist:\n------------------------------\nChecklist Name: ${activeChecklist.name}\nLocation: ${activeChecklist.place}\nSurvey Period: ${activeChecklist.startDate} to ${activeChecklist.endDate}\n\nSpecies List:\n------------------------------\n${formattedNames}\n----------------------\nGenerated from *Odonates of Kerala App* by Brijesh Pookkottur.\nhttps://play.google.com/store/apps/details?id=com.thinkdigit.odonatesofkerala\n`;

    if (this.clipboardService.copyToClipboard(checklistText)) {
      Dialogs.alert({
        title: "Success",
        message: "Checklist has been copied to clipboard!\n\ \n\ചെക്ക്‌ലിസ്റ്റ് വിവരങ്ങള്‍ കോപ്പി ചെയ്തു. ഇനി എവിടേയും പേസ്റ്റ് ചെയ്യാം.",
        okButtonText: "OK"
      });
    } else {
      Dialogs.alert({
        title: "Error",
        message: "Failed to copy checklist to clipboard. Please try again.",
        okButtonText: "OK"
      });
    }
  }

  goBack() {
    Frame.topmost().goBack();
  }
}