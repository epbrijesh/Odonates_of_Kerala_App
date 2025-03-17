import { Observable, Frame, Dialogs } from '@nativescript/core';
import { Species } from '../../models/species.model';
import { speciesList } from '../../data/app_data';

export class ListViewModel extends Observable {
  private _speciesList: Species[] = speciesList;
  private _filteredSpecies: Species[] = [];
  private _searchQuery: string = '';
  private _sortType: string = 'default';
  private _selectedFamilies: Set<string> = new Set();
  private static _instance: ListViewModel;

  constructor() {
    super();
    if (ListViewModel._instance) {
      return ListViewModel._instance;
    }
    ListViewModel._instance = this;
    this._filteredSpecies = [...this._speciesList];
  }

  static getInstance(): ListViewModel {
    if (!ListViewModel._instance) {
      new ListViewModel();
    }
    return ListViewModel._instance;
  }

  get filteredSpecies(): Species[] {
    return this._filteredSpecies;
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
      this.filterAndSortSpecies();
    }
  }

  showFamilyFilter() {
    const families = [...new Set(this._speciesList.map(s => s.family))].sort();
    
    const actions = families.map(family => {
      const isSelected = this._selectedFamilies.has(family);
      return `${isSelected ? '✓ ' : ''}${family}`;
    });

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
        const selectedFamily = result.replace('✓ ', '');
        
        if (this._selectedFamilies.has(selectedFamily)) {
          this._selectedFamilies.delete(selectedFamily);
        } else {
          this._selectedFamilies.add(selectedFamily);
        }
      }
      
      this.notifyPropertyChange('hasActiveFilters', this.hasActiveFilters);
      this.filterAndSortSpecies();
    });
  }

  onSearch() {
    this.filterAndSortSpecies();
  }

  onClear() {
    this.searchQuery = '';
  }

  sortByName() {
    this._sortType = 'name';
    this.notifyPropertyChange('sortType', this._sortType);
    this.filterAndSortSpecies();
  }

  sortByFamily() {
    this._sortType = 'family';
    this.notifyPropertyChange('sortType', this._sortType);
    this.filterAndSortSpecies();
  }

  sortByDefault() {
    this._sortType = 'default';
    this.notifyPropertyChange('sortType', this._sortType);
    this.filterAndSortSpecies();
  }

  onSpeciesTap(args) {
    const tappedItem = this._filteredSpecies[args.index];
    Frame.topmost().navigate({
      moduleName: "pages/detail/detail-page",
      context: tappedItem,
      clearHistory: false
    });
  }

  goBack() {
    Frame.topmost().goBack();
  }

  private filterAndSortSpecies() {
    const query = this._searchQuery.toLowerCase();
    let filtered = this._speciesList.filter(species => 
      (species.commonName.toLowerCase().includes(query) ||
       species.malayalamName.toLowerCase().includes(query) ||
       species.scientificName.toLowerCase().includes(query)) &&
      (this._selectedFamilies.size === 0 || this._selectedFamilies.has(species.family))
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

    this._filteredSpecies = filtered;
    this.notifyPropertyChange('filteredSpecies', this._filteredSpecies);
  }
}