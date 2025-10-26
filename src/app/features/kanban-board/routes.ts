import {Routes} from "@angular/router";

export const KANBAN_BOARD_ROUTES: Routes = [
    {
        path: '',
        title: 'Kanban Board',
        loadComponent: () => import('./ui/kanban-board.component').then(m => m.KanbanBoardComponent)
    }
]