import { NavigatedData, Page } from '@nativescript/core';
import { DetailViewModel } from './detail-view-model';

export function onNavigatingTo(args: NavigatedData) {
  const page = <Page>args.object;
  const odonate = args.context;
  page.bindingContext = new DetailViewModel(odonate);
}