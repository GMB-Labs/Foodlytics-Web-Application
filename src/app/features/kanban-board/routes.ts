import {Routes} from "@angular/router";

export const KANBAN_BOARD_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./feature.component').then(m => m.KanbanBoardFeature),
        children: [
            {
                path: '',
                title: 'Kanban Board',
                data: { breadcrumb: 'Kanban Board' },
                loadComponent: () =>
                    import('./ui/pages/kanban-board.component').then(m => m.KanbanBoardComponent)
            }
        ]
    }
]