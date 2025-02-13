import { Observable, Frame, Dialogs } from '@nativescript/core';
import { Odonate } from '../../models/odonate.model';
import { odonates } from '../../data/odonates';

export class ListViewModel extends Observable {
  private _odonates: Odonate[] = odonates;
  private _filteredOdonates: Odonate[] = [];
  private _searchQuery: string = '';
  private _sortType: string = 'default';
  private _selectedFamilies: Set<string> = new Set();

  constructor() {
    super();
    this._filteredOdonates = [...this._odonates];
  }

  get filteredOdonates(): Odonate[] {
    return this._filteredOdonates;
  }

  get searchQuery(): string {
    return this._searchQuery;
  }

  get sortType(): string {
    return this._sortType;
  }

  get hasActiveFilters(): boolean {
    return this._selectedFamilies.size > 0;
  }

  set searchQuery(value: string) {
    if (this._searchQuery !== value) {
      this._searchQuery = value;
      this.notifyPropertyChange('searchQuery', value);
      this.filterAndSortOdonates();
    }
  }

  showFamilyFilter() {
    // Get unique families from odonates
    const families = [...new Set(this._odonates.map(o => o.family))].sort();
    
    // Create actions array with checkmarks for selected families
    const actions = families.map(family => {
      const isSelected = this._selectedFamilies.has(family);
      return `${isSelected ? '✓ ' : ''}${family}`;
    });

    // Add Clear Filters option if there are active filters
    if (this._selectedFamilies.size > 0) {
      actions.unshift('Clear Filters');
    }

    Dialogs.action({
      title: "Filter by Family",
      message: "Select families to show:",
      cancelButtonText: "Cancel",
      actions: actions
    }).then(result => {
      if (result === 'Clear Filters') {
        this._selectedFamilies.clear();
      } else if (result !== 'Cancel') {
        // Remove checkmark if present
        const selectedFamily = result.replace('✓ ', '');
        
        if (this._selectedFamilies.has(selectedFamily)) {
          this._selectedFamilies.delete(selectedFamily);
        } else {
          this._selectedFamilies.add(selectedFamily);
        }
      }
      
      this.notifyPropertyChange('hasActiveFilters', this.hasActiveFilters);
      this.filterAndSortOdonates();
    });
  }

  onSearch() {
    this.filterAndSortOdonates();
  }

  onClear() {
    this.searchQuery = '';
  }

  sortByName() {
    this._sortType = 'name';
    this.notifyPropertyChange('sortType', this._sortType);
    this.filterAndSortOdonates();
  }

  sortByFamily() {
    this._sortType = 'family';
    this.notifyPropertyChange('sortType', this._sortType);
    this.filterAndSortOdonates();
  }

  sortByDefault() {
    this._sortType = 'default';
    this.notifyPropertyChange('sortType', this._sortType);
    this.filterAndSortOdonates();
  }

  onOdonateTap(args) {
    const tappedItem = this._filteredOdonates[args.index];
    Frame.topmost().navigate({
      moduleName: "pages/detail/detail-page",
      context: tappedItem,
      clearHistory: false
    });
  }

  goBack() {
    Frame.topmost().goBack();
  }

  private filterAndSortOdonates() {
    const query = this._searchQuery.toLowerCase();
    let filtered = this._odonates.filter(odonate => 
      (odonate.commonName.toLowerCase().includes(query) ||
       odonate.malayalamName.toLowerCase().includes(query) ||
       odonate.scientificName.toLowerCase().includes(query)) &&
      (this._selectedFamilies.size === 0 || this._selectedFamilies.has(odonate.family))
    );

    switch (this._sortType) {
      case 'name':
        filtered.sort((a, b) => a.scientificName.localeCompare(b.scientificName));
        break;
      case 'family':
        filtered.sort((a, b) => a.family.localeCompare(b.family));
        break;
      default:
        filtered = filtered.sort((a, b) => a.id - b.id);
    }

    this._filteredOdonates = filtered;
    this.notifyPropertyChange('filteredOdonates', this._filteredOdonates);
  }
}