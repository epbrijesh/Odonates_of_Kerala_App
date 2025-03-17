import { Observable, Frame, Utils, ApplicationSettings, Dialogs } from '@nativescript/core';
import { SyncService } from '../../services/sync.service';

interface SyncProgress {
  current: number;
  total: number;
}

export class AboutViewModel extends Observable {
  private syncService: SyncService;
  private _currentVersion: number;
  private _latestVersion: number = 0;
  private _updateStatus: string = 'No updates in progress';
  private _isUpdating: boolean = false;
  private _progressValue: number = 0;
  private _progressText: string = '';
  private _downloadStatus: string = '';
  private _updateButtonText: string = 'Update App Data';

  constructor() {
    super();
    this.syncService = SyncService.getInstance();
    this._currentVersion = ApplicationSettings.getNumber('butterfliesDataVersion', 0);
    this.checkLatestVersion();
  }

  get currentVersion(): string {
    return this._currentVersion ? `${this._currentVersion}` : 'Not synced';
  }

  get latestVersion(): string {
    return this._latestVersion ? `${this._latestVersion}` : 'Checking...';
  }

  get updateStatus(): string {
    return this._updateStatus;
  }

  get isUpdating(): boolean {
    return this._isUpdating;
  }

  get progressValue(): number {
    return this._progressValue;
  }

  get progressText(): string {
    return this._progressText;
  }

  get downloadStatus(): string {
    return this._downloadStatus;
  }

  get updateButtonText(): string {
    return this._updateButtonText;
  }

  private async checkLatestVersion() {
    try {
      const hasUpdates = await this.syncService.checkForUpdates();
      if (hasUpdates) {
        const response = await fetch(this.syncService.VERSION_URL);
        const data = await response.json();
        this._latestVersion = data.version;
        this.notifyPropertyChange('latestVersion', this.latestVersion);
      } else {
        this._latestVersion = this._currentVersion;
        this.notifyPropertyChange('latestVersion', this.latestVersion);
      }
    } catch (error) {
      console.error('Error checking latest version:', error);
      this._latestVersion = 0;
      this.notifyPropertyChange('latestVersion', 'Error');
    }
  }

  async syncAll() {
    if (this._isUpdating) return;

    try {
      // Start update process
      this._isUpdating = true;
      this._updateButtonText = 'Updating...';
      this.notifyPropertyChange('isUpdating', this._isUpdating);
      this.notifyPropertyChange('updateButtonText', this._updateButtonText);

      // Check for updates
      this._progressText = 'Checking for updates...';
      this._progressValue = 10;
      this.notifyPropertyChange('progressText', this._progressText);
      this.notifyPropertyChange('progressValue', this._progressValue);

      const hasUpdates = await this.syncService.checkForUpdates();
      
      if (!hasUpdates) {
        this._updateStatus = 'Your app is already up to date!';
        this.resetUpdateState();
        return;
      }

      // Update data
      this._progressText = 'Downloading new data...';
      this._progressValue = 30;
      this.notifyPropertyChange('progressText', this._progressText);
      this.notifyPropertyChange('progressValue', this._progressValue);

      const dataResult = await this.syncService.syncData();
      
      if (!dataResult.success) {
        this._updateStatus = 'Failed to update data: ' + dataResult.message;
        this.resetUpdateState();
        return;
      }

      this._currentVersion = dataResult.version;
      this.notifyPropertyChange('currentVersion', this.currentVersion);

      // Update images
      this._progressText = 'Downloading images...';
      this._progressValue = 50;
      this.notifyPropertyChange('progressText', this._progressText);
      this.notifyPropertyChange('progressValue', this._progressValue);

      const imageResult = await this.syncService.syncImages(
        (progress: SyncProgress) => {
          this._progressValue = 50 + (progress.current / progress.total * 50);
          this._downloadStatus = `Downloaded ${progress.current} of ${progress.total} images`;
          this.notifyPropertyChange('progressValue', this._progressValue);
          this.notifyPropertyChange('downloadStatus', this._downloadStatus);
        }
      );
      
      if (imageResult.success) {
        this._updateStatus = 'Update completed successfully!\n' + imageResult.message;
      } else {
        this._updateStatus = 'Data updated but image sync failed: ' + imageResult.message;
      }

      this.resetUpdateState();
      
    } catch (error) {
      this._updateStatus = 'An unexpected error occurred during update.';
      this.resetUpdateState();
    }
  }

  private resetUpdateState() {
    this._isUpdating = false;
    this._updateButtonText = 'Update App Data';
    this._progressValue = 0;
    this._progressText = '';
    this._downloadStatus = '';
    this.notifyPropertyChange('isUpdating', this._isUpdating);
    this.notifyPropertyChange('updateButtonText', this._updateButtonText);
    this.notifyPropertyChange('progressValue', this._progressValue);
    this.notifyPropertyChange('progressText', this._progressText);
    this.notifyPropertyChange('downloadStatus', this._downloadStatus);
    this.notifyPropertyChange('updateStatus', this._updateStatus);
  }

  goBack() {
    if (this._isUpdating) {
      Dialogs.alert({
        title: "Update in Progress",
        message: "Please wait until the update is complete before going back.",
        okButtonText: "OK"
      });
      return;
    }
    Frame.topmost().goBack();
  }

  openWebsite() {
    Utils.openUrl("https://thinkdigitdev.blogspot.com");
  }

  openPlayStore() {
    Utils.openUrl("https://play.google.com/store/apps/details?id=com.thinkdigit.odonatesofkerala");
  }
  
  openPlayStorePub() {
    Utils.openUrl("https://play.google.com/store/apps/developer?id=thinkdigit");
  }

  sendEmail() {
    Utils.openUrl("mailto:epbrijesh@gmail.com");
  }

  callPhone() {
    Utils.openUrl("tel:+919961257788");
  }

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
    Utils.openUrl("https://ml.wikipedia.org/wiki/Odonata_of_Kerala");
  }

  onSosImageTap() {
    Utils.openUrl("https://odonatesociety.org");
  }

  onInaturalistImageTap() {
    Utils.openUrl("https://www.inaturalist.org/projects/dragonflies-of-kerala");
  }

  onButterflyVisionImageTap() {
    Utils.openUrl("https://scholar.google.co.in/citations?user=qVr1HmcAAAAJ&hl=en");
  }
  
  onBoltImageTap() {
    Utils.openUrl("https://bolt.new");
  }

  onGithubImageTap() {
    Utils.openUrl("https://github.com/epbrijesh/Odonates_of_Kerala_App/");
  }
}