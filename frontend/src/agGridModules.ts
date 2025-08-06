import {
    ModuleRegistry,
    ClientSideRowModelModule,
    TextFilterModule,
    PaginationModule,
    AllCommunityModule,
    DateFilterModule,
} from 'ag-grid-community';
import {
    RowGroupingModule,
    RowGroupingPanelModule,
    GroupFilterModule,
    ValidationModule,
} from 'ag-grid-enterprise';

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    RowGroupingModule,
    RowGroupingPanelModule,
    TextFilterModule,
    GroupFilterModule,
    ValidationModule,
    PaginationModule,
    DateFilterModule,
    AllCommunityModule,
]);