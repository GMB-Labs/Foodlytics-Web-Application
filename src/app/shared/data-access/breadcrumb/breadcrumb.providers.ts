// shared/data-access/breadcrumb.providers.ts
import {
    inject,
    makeEnvironmentProviders,
    provideEnvironmentInitializer,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BreadcrumbService, Crumb } from './breadcrumb.service';

export function provideBreadcrumbsFromRouter() {
    return makeEnvironmentProviders([
        provideEnvironmentInitializer(() => {
            const router = inject(Router);
            const root = inject(ActivatedRoute);
            const bc = inject(BreadcrumbService);

            const buildLink = (route: ActivatedRoute): any[] => {
                const segs: string[] = [];
                let cur: ActivatedRoute | null = route.root;
                while (cur) {
                    segs.push(...cur.snapshot.url.map(u => u.path));
                    cur = cur.firstChild!;
                }
                return ['/', ...segs];
            };

            const sync = () => {
                const crumbs: Crumb[] = [];
                let r: ActivatedRoute | null = root.firstChild;

                while (r) {
                    const data = r.snapshot.data as any;
                    const raw = data?.breadcrumb; // string | (data)=>string
                    if (raw) {
                        const label = typeof raw === 'function' ? raw(data) : String(raw);
                        crumbs.push({ label, link: buildLink(r) });
                    }
                    r = r.firstChild!;
                }

                if (!crumbs.length || crumbs[0].label !== 'Dashboard') {
                    crumbs.unshift({ label: 'Dashboard', link: ['/dashboard'] });
                }
                bc.set(crumbs);
            };

            // correr una vez al iniciar y luego en cada NavigationEnd
            Promise.resolve().then(sync);
            router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(sync);
        }),
    ]);
}